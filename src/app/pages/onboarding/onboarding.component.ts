import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Api } from '../../core/api';
import { Session } from '../../core/session';
import { errorMessage } from '../../core/errors';

type Step = 'goal' | 'busy' | 'questions';

/**
 * Guided onboarding. The learner states a goal, Athena returns an adaptive
 * assessment, and once the answers are submitted the AI generates the roadmap.
 * Each AI step shows the animated Athena loader with a rotating status line
 * (the model reasons for a while before it produces the JSON), then we go to /roadmap.
 */
@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css',
})
export class OnboardingComponent implements OnInit, OnDestroy {
  private readonly api = inject(Api);
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  readonly step = signal<Step>('goal');
  readonly busyText = signal('Athena is getting things ready');

  readonly greeting = signal("Let's get started");
  readonly goalQuestion = signal('What would you like to learn?');

  readonly goal = signal('');
  readonly questions = signal<string[]>([]);
  readonly answers = signal<string[]>([]);
  readonly invalidIndex = signal(-1);
  readonly error = signal('');

  private busyTimer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (!this.session.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
    // Idempotently ensure the onboarding session exists and fetch the greeting.
    this.api.startOnboarding().subscribe({
      next: (res) => {
        if (res?.greeting) this.greeting.set(res.greeting);
        if (res?.firstQuestion) this.goalQuestion.set(res.firstQuestion);
      },
      error: () => {
        /* keep sensible defaults; the goal step still works */
      },
    });
  }

  submitGoal(): void {
    const goal = this.goal().trim();
    if (!goal) {
      this.error.set("Tell Athena what you'd like to learn to continue.");
      return;
    }
    this.error.set('');
    this.startBusy([
      'Athena is thinking…',
      'Athena is preparing your questions…',
    ]);
    this.api.submitGoal(goal).subscribe({
      next: (res) => {
        this.stopBusy();
        const qs: string[] = Array.isArray(res?.questions) ? res.questions : [];
        this.questions.set(qs);
        this.answers.set(qs.map(() => ''));
        this.step.set('questions');
      },
      error: (err) => {
        this.stopBusy();
        this.error.set(errorMessage(err));
        this.step.set('goal');
      },
    });
  }

  setAnswer(index: number, value: string): void {
    this.answers.update((arr) => {
      const next = [...arr];
      next[index] = value;
      return next;
    });
    if (this.invalidIndex() === index) this.invalidIndex.set(-1);
    this.error.set('');
  }

  /**
   * "Start from zero" — for a complete beginner. Auto-answers every question with
   * "I don't know" and generates the roadmap, so Athena pitches it at the ground floor.
   */
  startFromZero(): void {
    this.error.set('');
    this.invalidIndex.set(-1);
    this.answers.set(this.questions().map(() => "I don't know — I'm starting from scratch."));
    this.submitAssessment();
  }

  submitAssessment(): void {
    const qs = this.questions();
    const ans = this.answers();
    const firstEmpty = qs.findIndex((_, i) => !(ans[i] ?? '').trim());
    if (firstEmpty !== -1) {
      this.invalidIndex.set(firstEmpty);
      this.error.set('Please answer every question so Athena can tailor your roadmap.');
      return;
    }
    this.error.set('');
    const payload = qs.map((question, i) => ({ question, answer: ans[i].trim() }));
    this.startBusy([
      'Athena is thinking…',
      'Athena is analyzing your answers…',
      'Athena is starting to generate your roadmap — please wait a few minutes…',
    ]);
    this.api.submitAssessment(payload).subscribe({
      next: () => {
        this.stopBusy();
        this.router.navigateByUrl('/roadmap');
      },
      error: (err) => {
        this.stopBusy();
        this.error.set(errorMessage(err));
        this.step.set('questions');
      },
    });
  }

  /**
   * Enter the loading state and walk through the given status lines, pausing on
   * the last one. The model "thinks" (reasons) before emitting the JSON, so this
   * keeps the user informed during a long single request.
   */
  private startBusy(messages: string[]): void {
    this.stopBusy();
    this.step.set('busy');
    let i = 0;
    this.busyText.set(messages[0]);
    if (messages.length > 1) {
      this.busyTimer = setInterval(() => {
        i = Math.min(i + 1, messages.length - 1);
        this.busyText.set(messages[i]);
        if (i === messages.length - 1) this.stopBusy();
      }, 15000);
    }
  }

  private stopBusy(): void {
    if (this.busyTimer) {
      clearInterval(this.busyTimer);
      this.busyTimer = null;
    }
  }

  ngOnDestroy(): void {
    this.stopBusy();
  }
}
