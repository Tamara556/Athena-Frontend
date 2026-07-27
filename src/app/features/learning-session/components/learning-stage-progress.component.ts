import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-learning-stage-progress',
  standalone: true,
  styles: [':host{display:contents}'],
  template: `
    <section class="flow reveal d1" aria-label="Learning flow">
      <div class="flow-head">
        <h2>Your path for today</h2>
        <span class="hint">One step at a time — Athena unlocks the next as you go.</span>
      </div>
      <div class="stepper" role="tablist" aria-label="Learning stages">
        <button class="step" type="button" role="tab" [class.done]="isDone(0)" [class.current]="isCurrent(0)"
                [class.locked]="isLocked(0)" [attr.aria-selected]="active() === 0" (click)="onSelect(0)">
          <span class="step-orb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 0-2 2V5zM20 5a2 2 0 0 0-2-2h-6v18h6a2 2 0 0 1 2 2V5z"/></svg>
          </span>
          <span class="step-name">Reading</span>
          <span class="step-meta">{{ metas()[0] }}</span>
        </button>
        <button class="step" type="button" role="tab" [class.done]="isDone(1)" [class.current]="isCurrent(1)"
                [class.locked]="isLocked(1)" [attr.aria-selected]="active() === 1" (click)="onSelect(1)">
          <span class="step-orb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 9 5 3-5 3V9z" fill="currentColor" stroke="none"/></svg>
          </span>
          <span class="step-name">Watching</span>
          <span class="step-meta">{{ metas()[1] }}</span>
        </button>
        <button class="step" type="button" role="tab" [class.done]="isDone(2)" [class.current]="isCurrent(2)"
                [class.locked]="isLocked(2)" [attr.aria-selected]="active() === 2" (click)="onSelect(2)">
          <span class="step-orb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6-6 6 6 6M16 6l6 6-6 6"/></svg>
          </span>
          <span class="step-name">Practice</span>
          <span class="step-meta">{{ metas()[2] }}</span>
        </button>
        <button class="step" type="button" role="tab" [class.done]="isDone(3)" [class.current]="isCurrent(3)"
                [class.locked]="isLocked(3)" [attr.aria-selected]="active() === 3" (click)="onSelect(3)">
          <span class="step-orb">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5M12 17h.01"/><circle cx="12" cy="12" r="9.5"/></svg>
          </span>
          <span class="step-name">Quiz</span>
          <span class="step-meta">{{ metas()[3] }}</span>
        </button>
      </div>
    </section>
  `,
})
export class LearningStageProgressComponent {
  readonly active = input(0);
  readonly done = input<boolean[]>([]);
  readonly metas = input<string[]>([]);
  readonly select = output<number>();

  private unlocked(i: number): boolean {
    return i === 0 || this.done()[i - 1] === true;
  }

  isDone(i: number): boolean {
    return this.done()[i] === true;
  }

  isCurrent(i: number): boolean {
    return i === this.active() && !this.isDone(i);
  }

  isLocked(i: number): boolean {
    return !this.unlocked(i) && !this.isDone(i);
  }

  onSelect(i: number): void {
    if (this.isLocked(i)) {
      return;
    }
    this.select.emit(i);
  }
}
