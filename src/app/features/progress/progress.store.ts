import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, tap } from 'rxjs';
import { ProgressApi } from './progress.api';
import { Reflection } from './progress.models';

const REVEAL_DELAY_MS = 400;

@Injectable({ providedIn: 'root' })
export class ProgressStore {
  private readonly api = inject(ProgressApi);

  readonly transform = toSignal(this.api.getTransform(), { initialValue: null });
  readonly highlights = toSignal(this.api.getHighlights(), { initialValue: [] });
  readonly journey = toSignal(this.api.getJourney(), { initialValue: [] });
  readonly observations = toSignal(this.api.getObservations(), { initialValue: [] });
  readonly milestones = toSignal(this.api.getMilestones(), { initialValue: [] });
  readonly future = toSignal(this.api.getFuture(), { initialValue: [] });
  readonly prompts = toSignal(this.api.getPrompts(), { initialValue: [] });
  private readonly reflections = toSignal(this.api.getReflections(), { initialValue: [] });

  readonly loaded = signal(false);
  readonly promptIndex = signal(0);
  readonly saving = signal(false);
  private readonly drafts = signal<Record<number, string>>({});

  readonly ready = computed(() => this.transform() !== null);
  readonly newLearner = computed(() => this.ready() && this.milestones().length === 0 && this.highlights().length === 0);
  readonly placeholder = computed(() => this.prompts()[this.promptIndex()]?.placeholder ?? '');
  readonly draft = computed(() => {
    const index = this.promptIndex();
    const local = this.drafts()[index];
    if (local !== undefined) {
      return local;
    }
    const label = this.prompts()[index]?.label;
    return this.reflections().find((entry) => entry.prompt === label)?.text ?? '';
  });

  constructor() {
    effect(() => {
      if (this.ready()) {
        setTimeout(() => this.loaded.set(true), REVEAL_DELAY_MS);
      }
    });
  }

  selectPrompt(index: number): void {
    this.promptIndex.set(index);
  }

  setDraft(text: string): void {
    const index = this.promptIndex();
    this.drafts.update((current) => ({ ...current, [index]: text }));
  }

  save(): Observable<Reflection> {
    const label = this.prompts()[this.promptIndex()]?.label ?? '';
    this.saving.set(true);
    return this.api.saveReflection(label, this.draft()).pipe(tap(() => this.saving.set(false)));
  }
}
