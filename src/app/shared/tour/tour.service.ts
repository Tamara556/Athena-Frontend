import { Injectable, computed, signal } from '@angular/core';

export interface TourStep {
  /** CSS selector of the element to spotlight. Omit for a centered, element-less step. */
  selector?: string;
  title: string;
  body: string;
}

const SEEN_KEY = 'athena_tour_done';
const PENDING_KEY = 'athena_tour_pending';

/** The first-run guided tour of the app, shown once to a newly-registered user. */
@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly _steps = signal<TourStep[]>([]);
  readonly index = signal(0);
  readonly active = signal(false);

  readonly steps = this._steps.asReadonly();
  readonly step = computed(() => this._steps()[this.index()] ?? null);
  readonly count = computed(() => this._steps().length);
  readonly isFirst = computed(() => this.index() === 0);
  readonly isLast = computed(() => this.index() === this.count() - 1);

  /**
   * Called right after registration so the tour fires when /roadmap first loads.
   * Clears any prior "seen" flag — a fresh signup is a new user who should see it,
   * even if a previous account in this browser already completed the tour.
   */
  markPending(): void {
    try {
      localStorage.removeItem(SEEN_KEY);
      localStorage.setItem(PENDING_KEY, '1');
    } catch {
      /* storage unavailable — tour just won't auto-start */
    }
  }

  /** Auto-start the tour once, for a user who just registered and hasn't seen it. */
  maybeStart(steps: TourStep[]): void {
    let pending = false;
    let seen = true;
    try {
      pending = localStorage.getItem(PENDING_KEY) === '1';
      seen = localStorage.getItem(SEEN_KEY) === '1';
    } catch {
      return;
    }
    if (pending && !seen) {
      this.start(steps);
    }
  }

  start(steps: TourStep[]): void {
    if (!steps.length) {
      return;
    }
    this._steps.set(steps);
    this.index.set(0);
    this.active.set(true);
  }

  next(): void {
    if (this.isLast()) {
      this.finish();
      return;
    }
    this.index.update((i) => i + 1);
  }

  prev(): void {
    if (!this.isFirst()) {
      this.index.update((i) => i - 1);
    }
  }

  goTo(i: number): void {
    if (i >= 0 && i < this.count()) {
      this.index.set(i);
    }
  }

  /** Finish or skip — either way it's marked seen so it never auto-shows again. */
  finish(): void {
    this.active.set(false);
    try {
      localStorage.setItem(SEEN_KEY, '1');
      localStorage.removeItem(PENDING_KEY);
    } catch {
      /* ignore */
    }
  }
}
