import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Session } from '../../core/session';
import { InsightsApi } from './insights.api';

const REVEAL_DELAY_MS = 500;
const DEFAULT_GREETING_NAME = 'there';

@Injectable({ providedIn: 'root' })
export class InsightsStore {
  private readonly api = inject(InsightsApi);
  private readonly session = inject(Session);

  private readonly profileSource = toSignal(this.api.getInsights(), { initialValue: null });

  readonly loaded = signal(false);

  readonly profile = computed(() => this.profileSource());
  readonly ready = computed(() => this.profileSource() !== null);
  readonly greetingName = computed(() => firstName(this.session.name()) ?? DEFAULT_GREETING_NAME);
  readonly newLearner = computed(() => {
    const profile = this.profileSource();
    return profile !== null && profile.strengths.length === 0 && profile.patterns.length === 0;
  });

  constructor() {
    effect(() => {
      if (this.ready()) {
        setTimeout(() => this.loaded.set(true), REVEAL_DELAY_MS);
      }
    });
  }
}

function firstName(name: string | null): string | null {
  const trimmed = name?.trim();
  return trimmed ? trimmed.split(/\s+/)[0] : null;
}
