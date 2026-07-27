import { Component, effect, input, output, signal } from '@angular/core';

interface Confetti {
  left: string;
  background: string;
  animationDelay: string;
  transform: string;
}

const COLORS = ['#8B5CF6', '#A855F7', '#F472B6', '#22D3EE', '#34D399', '#FBBF24'];

@Component({
  selector: 'app-completion-section',
  standalone: true,
  template: `
    <div class="done-overlay" [class.show]="show()" role="dialog" aria-modal="true" aria-labelledby="doneTitle"
         (click)="onBackdrop($event)">
      <div class="done-card">
        @for (c of confetti(); track $index) {
          <span class="confetti" [style.left]="c.left" [style.background]="c.background"
                [style.animation-delay]="c.animationDelay" [style.transform]="c.transform"></span>
        }
        <div class="done-mark"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></div>
        <h2 id="doneTitle">Today's Learning Complete</h2>
        <p class="msg">Small steps create extraordinary growth.</p>
        <div class="done-stats">
          <div class="done-stat"><b>{{ minutes() }}<small style="font-size:14px"> min</small></b><span>Time spent</span></div>
          <div class="done-stat"><b>4</b><span>Stages done</span></div>
          <div class="done-stat"><b>+15</b><span>Streak XP</span></div>
        </div>
        <div class="athena-note">
          <svg class="am" viewBox="0 0 120 120" aria-hidden="true"><use href="#athenaMark"/></svg>
          <p><b>Athena:</b> You showed up and did the work today. That's exactly how mastery is built — one focused session at a time. Come back tomorrow and we'll keep going.</p>
        </div>
        <div class="done-actions">
          <button class="btn btn-primary" type="button" (click)="returnRoadmap.emit()">Return to Roadmap</button>
          <button class="btn btn-glass" type="button" (click)="continueTomorrow.emit()">Continue Tomorrow</button>
        </div>
      </div>
    </div>
  `,
})
export class CompletionSectionComponent {
  readonly show = input(false);
  readonly minutes = input(0);
  readonly returnRoadmap = output<void>();
  readonly continueTomorrow = output<void>();

  readonly confetti = signal<Confetti[]>([]);

  constructor() {
    effect(() => {
      if (this.show()) {
        this.confetti.set(this.burst());
      } else {
        this.confetti.set([]);
      }
    });
  }

  onBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.continueTomorrow.emit();
    }
  }

  private burst(): Confetti[] {
    const out: Confetti[] = [];
    for (let i = 0; i < 26; i++) {
      out.push({
        left: 10 + Math.random() * 80 + '%',
        background: COLORS[i % COLORS.length],
        animationDelay: Math.random() * 0.4 + 's',
        transform: 'rotate(' + Math.random() * 180 + 'deg)',
      });
    }
    return out;
  }
}
