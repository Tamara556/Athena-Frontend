import { Component, HostListener, OnDestroy, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { errorMessage } from '../../core/errors';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';
import { LangSelectComponent } from '../../shared/lang-select/lang-select.component';
import { CompletionSectionComponent } from './components/completion-section.component';
import { EmptyStateComponent } from './components/empty-state.component';
import { LearningSessionHeaderComponent } from './components/learning-session-header.component';
import { LearningStageProgressComponent } from './components/learning-stage-progress.component';
import { AthenaLoaderComponent } from '../../shared/athena-loader/athena-loader.component';
import { PracticeSectionComponent } from './components/practice-section.component';
import { QuizSectionComponent } from './components/quiz-section.component';
import { ReadingSectionComponent } from './components/reading-section.component';
import { WatchingSectionComponent } from './components/watching-section.component';
import { LearningSessionApiService } from './learning-session-api.service';
import { LearningSession } from './learning-session.models';

// Generation is slow on a local model. We poll for the session the onboarding trigger may
// already be building, and also kick off our own generation on the first miss so a fresh
// user never dead-ends on a 404.
const POLL_MS = 5000;
const MAX_POLLS = 60;   // give up after ~5 min

// Status lines cycled under the loader while materials are being prepared.
const LOADING_MESSAGES = [
  'Athena is reading your roadmap…',
  'Gathering the best materials for you…',
  'Writing your reading and practice…',
  'Putting together your quiz…',
  'Almost there — polishing your lesson…',
];
const LOADING_MESSAGE_MS = 6000;

const TOAST_LABELS = ['Reading complete', 'Watching complete', 'Practice complete', 'Quiz complete'];
const TOAST_SUBS = [
  'Foundation laid — you’ve got the ideas.',
  'You saw it in motion. Now build it.',
  'You did the work. That sticks.',
  'Honest answers — that’s how learning lands.',
];

@Component({
  selector: 'app-daily-learning-session',
  standalone: true,
  imports: [
    SidebarComponent, ThemeToggleComponent, LangSelectComponent, RouterLink, AthenaLoaderComponent, EmptyStateComponent,
    LearningSessionHeaderComponent, LearningStageProgressComponent, ReadingSectionComponent,
    WatchingSectionComponent, PracticeSectionComponent, QuizSectionComponent, CompletionSectionComponent,
  ],
  templateUrl: './daily-learning-session.component.html',
})
export class DailyLearningSessionComponent implements OnInit, OnDestroy {
  private readonly api = inject(LearningSessionApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly sidebar = viewChild(SidebarComponent);

  readonly loading = signal(true);
  readonly loadingText = signal(LOADING_MESSAGES[0]);
  readonly error = signal<string | null>(null);
  readonly session = signal<LearningSession | null>(null);
  readonly scrolled = signal(false);

  readonly activeStage = signal(0);
  readonly stagesDone = signal<boolean[]>([false, false, false, false]);
  readonly showCompletion = signal(false);
  readonly toast = signal<{ show: boolean; title: string; sub: string }>({ show: false, title: '', sub: '' });

  private toastTimer?: ReturnType<typeof setTimeout>;
  private pollTimer?: ReturnType<typeof setTimeout>;
  private loadingTimer?: ReturnType<typeof setInterval>;
  private settled = false;
  private fallbackFired = false;

  readonly doneCount = computed(() => this.stagesDone().filter(Boolean).length);
  readonly pct = computed(() => Math.round((this.doneCount() / 4) * 100));
  readonly totalMinutes = computed(() => this.session()?.estimatedMinutes ?? 0);

  readonly statusText = computed(() => {
    switch (this.session()?.status) {
      case 'COMPLETED': return 'Complete';
      case 'IN_PROGRESS': return 'In Progress';
      default: return 'Not started';
    }
  });

  readonly ctaLabel = computed(() => {
    const status = this.session()?.status;
    if (status === 'NOT_STARTED') return 'Start Learning';
    if (status === 'IN_PROGRESS') return 'Continue Learning';
    return null;
  });

  readonly metas = computed(() => {
    const s = this.session();
    if (!s) return ['', '', '', ''];
    return [
      `~${this.sumMinutes(s.readings)} min`,
      `~${this.sumMinutes(s.watchings)} min`,
      `~${this.sumMinutes(s.practices)} min`,
      `${s.quizzes.length} questions`,
    ];
  });

  readonly totalLabel = computed(() => `${this.totalMinutes()} min total`);
  readonly leftLabel = computed(() => {
    const s = this.session();
    if (!s) return '';
    const spent = this.stageMinutes(s, 0) * b(this.stagesDone()[0])
      + this.stageMinutes(s, 1) * b(this.stagesDone()[1])
      + this.stageMinutes(s, 2) * b(this.stagesDone()[2]);
    return `${Math.max(this.totalMinutes() - spent, 0)} min left`;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.settled = false;
    this.fallbackFired = false;
    this.startLoadingMessages();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getById(id).subscribe({
        next: (s) => this.onLoaded(s),
        error: (err) => {
          if (err?.status === 404) {
            // The lesson isn't ready yet — generate it and keep the loader up.
            this.pollCurrent(0);
          } else {
            this.stopLoadingMessages();
            this.loading.set(false);
            this.error.set(errorMessage(err));
          }
        },
      });
      return;
    }
    this.pollCurrent(0);
  }

  /**
   * Poll for the session (the onboarding trigger may already be building it) and,
   * on the first miss, kick off generation ourselves so a fresh user never dead-ends
   * on a 404. Whichever resolves first wins; polling continues as a safety net.
   */
  private pollCurrent(attempt: number): void {
    if (this.settled) {
      return;
    }
    this.api.getCurrent().subscribe({
      next: (s) => this.onLoaded(s),
      error: (err) => {
        if (this.settled) {
          return;
        }
        if (err?.status !== 404) {
          this.stopLoadingMessages();
          this.loading.set(false);
          this.error.set(errorMessage(err));
          return;
        }
        if (!this.fallbackFired) {
          this.fallbackFired = true;
          this.api.generate().subscribe({ next: (s) => this.onLoaded(s), error: () => {} });
        }
        if (attempt >= MAX_POLLS) {
          this.stopLoadingMessages();
          this.loading.set(false);
          this.session.set(null);
          return;
        }
        this.pollTimer = setTimeout(() => this.pollCurrent(attempt + 1), POLL_MS);
      },
    });
  }

  private onLoaded(s: LearningSession): void {
    if (this.settled) {
      return;
    }
    this.settled = true;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
    }
    this.stopLoadingMessages();
    this.session.set(s);
    this.applyStatus(s);
    this.loading.set(false);
    this.revealSoon();
  }

  private startLoadingMessages(): void {
    this.stopLoadingMessages();
    let i = 0;
    this.loadingText.set(LOADING_MESSAGES[0]);
    this.loadingTimer = setInterval(() => {
      i = Math.min(i + 1, LOADING_MESSAGES.length - 1);
      this.loadingText.set(LOADING_MESSAGES[i]);
    }, LOADING_MESSAGE_MS);
  }

  private stopLoadingMessages(): void {
    if (this.loadingTimer) {
      clearInterval(this.loadingTimer);
      this.loadingTimer = undefined;
    }
  }

  ngOnDestroy(): void {
    this.settled = true;
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
    }
    this.stopLoadingMessages();
  }

  prepare(): void {
    this.settled = false;
    this.fallbackFired = true; // generation is being triggered explicitly here
    this.loading.set(true);
    this.error.set(null);
    this.startLoadingMessages();
    this.api.generate().subscribe({
      next: (s) => this.onLoaded(s),
      error: (err) => {
        this.stopLoadingMessages();
        this.loading.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }

  onCta(): void {
    const s = this.session();
    if (!s) return;
    if (s.status === 'NOT_STARTED') {
      this.api.start(s.id).subscribe({
        next: (updated) => {
          this.session.set(updated);
          this.activeStage.set(0);
          this.scrollToStage(0);
        },
        error: (err) => this.error.set(errorMessage(err)),
      });
    } else {
      this.scrollToStage(this.activeStage());
    }
  }

  selectStage(i: number): void {
    this.activeStage.set(i);
    this.scrollToStage(i);
  }

  back(i: number): void {
    this.selectStage(Math.max(0, i - 1));
  }

  completeStage(i: number): void {
    const done = [...this.stagesDone()];
    done[i] = true;
    this.stagesDone.set(done);
    this.showToast(i);

    if (done.every(Boolean)) {
      this.finishSession();
      return;
    }
    const next = done.findIndex((d) => !d);
    setTimeout(() => this.selectStage(next), 420);
  }

  onReturnRoadmap(): void {
    this.showCompletion.set(false);
    this.router.navigateByUrl('/roadmap');
  }

  onContinueTomorrow(): void {
    this.showCompletion.set(false);
  }

  openDrawer(): void {
    this.sidebar()?.openDrawer();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  private finishSession(): void {
    const s = this.session();
    if (!s) return;
    this.api.complete(s.id).subscribe({
      next: (updated) => {
        this.session.set(updated);
        setTimeout(() => this.showCompletion.set(true), 500);
      },
      error: (err) => this.error.set(errorMessage(err)),
    });
  }

  private applyStatus(s: LearningSession): void {
    if (s.status === 'COMPLETED') {
      this.stagesDone.set([true, true, true, true]);
      this.activeStage.set(3);
      setTimeout(() => this.showCompletion.set(true), 500);
    } else {
      this.stagesDone.set([false, false, false, false]);
      this.activeStage.set(0);
    }
  }

  private showToast(i: number): void {
    this.toast.set({ show: true, title: TOAST_LABELS[i], sub: TOAST_SUBS[i] });
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.update((t) => ({ ...t, show: false })), 2600);
  }

  private scrollToStage(i: number): void {
    setTimeout(() => {
      const el = document.querySelectorAll('.content .stage')[i] as HTMLElement | undefined;
      if (el) {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 86, behavior: 'smooth' });
      }
    });
  }

  private revealSoon(): void {
    setTimeout(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in')), 60);
  }

  private sumMinutes(items: { estimatedMinutes: number }[]): number {
    return items.reduce((sum, x) => sum + x.estimatedMinutes, 0);
  }

  private stageMinutes(s: LearningSession, i: number): number {
    if (i === 0) return this.sumMinutes(s.readings);
    if (i === 1) return this.sumMinutes(s.watchings);
    if (i === 2) return this.sumMinutes(s.practices);
    return 0;
  }
}

function b(value: boolean): number {
  return value ? 1 : 0;
}
