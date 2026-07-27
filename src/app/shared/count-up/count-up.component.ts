import { Component, effect, input, signal, untracked } from '@angular/core';

@Component({
  selector: 'app-count-up',
  standalone: true,
  template: '{{ display() }}',
})
export class CountUpComponent {
  readonly value = input.required<number>();
  readonly durationMs = input(900);

  readonly display = signal(0);
  private frame = 0;

  constructor() {
    effect((onCleanup) => {
      const target = this.value();
      const from = untracked(this.display);
      const duration = untracked(this.durationMs);
      const start = performance.now();

      const tick = (now: number): void => {
        const progress = duration <= 0 ? 1 : Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        this.display.set(Math.round(from + (target - from) * eased));
        if (progress < 1) {
          this.frame = requestAnimationFrame(tick);
        }
      };

      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(tick);
      onCleanup(() => cancelAnimationFrame(this.frame));
    });
  }
}
