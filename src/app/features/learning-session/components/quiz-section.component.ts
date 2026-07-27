import { Component, computed, input, output, signal } from '@angular/core';
import { QuizQuestion } from '../learning-session.models';

@Component({
  selector: 'app-quiz-section',
  standalone: true,
  styles: [':host{display:contents}'],
  template: `
    <section class="stage" [class.active]="active()" role="tabpanel" aria-label="Quiz stage">
      <div class="stage-head">
        <span class="stage-badge sb-quiz"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9.1 9a3 3 0 1 1 4 2.8c-.8.4-1.1 1-1.1 1.7v.5M12 17h.01"/><circle cx="12" cy="12" r="9.5"/></svg></span>
        <div><h2>AI Quiz</h2><p>Quick checks. This is for you, not a grade — answer honestly.</p></div>
      </div>

      <div class="quiz-wrap">
        @if (!submitted()) {
          <div class="quiz-top">
            <div class="quiz-progress-row">
              <span class="qcount">Question <b>{{ index() + 1 }}</b> of {{ total() }}</span>
              <span class="qpts">{{ answeredCount() }} answered</span>
            </div>
            <div class="qbar"><i [style.width]="barWidth()"></i></div>
          </div>

          <div class="qbody">
            @if (current(); as q) {
              <div class="qslide on">
                <span class="qtype">{{ typeLabel(q) }}</span>
                <p class="qtext">{{ q.question }}</p>
                @if (q.options.length) {
                  <div class="opts">
                    @for (opt of q.options; track $index; let i = $index) {
                      <button class="opt" type="button" [class.sel]="answers()[index()] === i" (click)="pick(i)">
                        <span class="mk">{{ marker(q, i) }}</span>{{ opt }}
                      </button>
                    }
                  </div>
                } @else {
                  <input class="short-input" placeholder="Type your answer…" [value]="shortValue()"
                         (input)="setShort($event)" aria-label="Short answer">
                }
              </div>
            }
          </div>

          <div class="qnav">
            <button class="btn btn-glass" type="button" [disabled]="index() === 0" (click)="prev()">Previous</button>
            <button class="btn btn-primary" type="button" (click)="next()">{{ index() === total() - 1 ? 'Submit quiz' : 'Next' }}</button>
          </div>
        } @else {
          <div style="padding:clamp(30px,5vw,46px);text-align:center">
            <div class="done-mark" style="width:64px;height:64px;border-radius:20px;margin:0 auto 18px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></div>
            <h3 style="font-size:22px;letter-spacing:-.03em;margin-bottom:6px">You answered {{ answeredCount() }} of {{ total() }}</h3>
            <p style="color:var(--ink-soft);font-size:15px;max-width:360px;margin:0 auto 22px">However it landed, you showed up and thought it through. That's the part that compounds.</p>
            <button class="btn btn-primary" type="button" (click)="complete.emit()">Finish today's session <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
          </div>
        }
      </div>
    </section>
  `,
})
export class QuizSectionComponent {
  readonly quizzes = input<QuizQuestion[]>([]);
  readonly active = input(false);
  readonly complete = output<void>();

  readonly index = signal(0);
  readonly submitted = signal(false);
  readonly answers = signal<(number | string | null)[]>([]);

  readonly total = computed(() => this.quizzes().length);
  readonly current = computed(() => this.quizzes()[this.index()] ?? null);
  readonly barWidth = computed(() => ((this.index() + 1) / Math.max(this.total(), 1)) * 100 + '%');
  readonly answeredCount = computed(
    () => this.answers().filter((a) => a !== null && a !== '').length,
  );
  readonly shortValue = computed(() => {
    const a = this.answers()[this.index()];
    return typeof a === 'string' ? a : '';
  });

  typeLabel(q: QuizQuestion): string {
    if (q.type === 'TRUE_FALSE') {
      return 'True / False';
    }
    return q.options.length === 0 ? 'Short answer' : 'Multiple choice';
  }

  marker(q: QuizQuestion, i: number): string {
    if (q.type === 'TRUE_FALSE') {
      return i === 0 ? 'T' : 'F';
    }
    return String.fromCharCode(65 + i);
  }

  pick(i: number): void {
    this.setAnswer(i);
  }

  setShort(event: Event): void {
    const value = (event.target as HTMLInputElement).value.trim();
    this.setAnswer(value.length > 0 ? value : null);
  }

  prev(): void {
    if (this.index() > 0) {
      this.index.update((v) => v - 1);
    }
  }

  next(): void {
    if (this.index() === this.total() - 1) {
      this.submitted.set(true);
    } else {
      this.index.update((v) => v + 1);
    }
  }

  private setAnswer(value: number | string | null): void {
    const next = [...this.answers()];
    next[this.index()] = value;
    this.answers.set(next);
  }
}
