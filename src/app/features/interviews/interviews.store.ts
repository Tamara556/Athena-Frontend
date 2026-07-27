import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { InterviewsApi } from './interviews.api';
import { confidenceGain } from './interviews.logic';
import { InterviewLevel, StartedInterview } from './interviews.models';

const REVEAL_DELAY_MS = 350;

@Injectable({ providedIn: 'root' })
export class InterviewsStore {
  private readonly api = inject(InterviewsApi);

  readonly nextInterview = toSignal(this.api.getNextInterview(), { initialValue: null });
  readonly confidence = toSignal(this.api.getConfidenceTrend(), { initialValue: null });
  readonly readiness = toSignal(this.api.getReadiness(), { initialValue: null });
  readonly history = toSignal(this.api.getHistory(), { initialValue: [] });
  readonly observations = toSignal(this.api.getObservations(), { initialValue: [] });
  readonly reviewTopics = toSignal(this.api.getReviewTopics(), { initialValue: [] });
  readonly tips = toSignal(this.api.getTips(), { initialValue: [] });
  readonly impacts = toSignal(this.api.getImpacts(), { initialValue: [] });
  readonly levels = toSignal(this.api.getMockLevels(), { initialValue: [] });

  readonly loaded = signal(false);
  readonly mockSel = signal(1);
  readonly starting = signal<string | null>(null);
  readonly activeInterview = signal<StartedInterview | null>(null);

  readonly gain = computed(() => confidenceGain(this.confidence()));
  readonly selectedLevel = computed<InterviewLevel | null>(() => {
    const levels = this.levels();
    return levels.find((level) => level.id === this.mockSel()) ?? levels[0] ?? null;
  });

  constructor() {
    effect(() => {
      if (this.levels().length) {
        setTimeout(() => this.loaded.set(true), REVEAL_DELAY_MS);
      }
    });
  }

  pickMock(id: number): void {
    this.mockSel.set(id);
  }

  start(domain: string, level: string, source: string): void {
    if (this.starting()) {
      return;
    }
    this.starting.set(source);
    this.api.start(domain, level).subscribe({
      next: (interview) => {
        this.activeInterview.set(interview);
        this.starting.set(null);
      },
      error: () => this.starting.set(null),
    });
  }
}
