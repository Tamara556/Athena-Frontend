import { Component, computed, input, output, signal } from '@angular/core';
import { ReadingMaterial } from '../learning-session.models';

@Component({
  selector: 'app-reading-section',
  standalone: true,
  styles: [':host{display:contents}'],
  template: `
    <section class="stage" [class.active]="active()" role="tabpanel" aria-label="Reading stage">
      <div class="stage-head">
        <span class="stage-badge sb-read"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h6v18H6a2 2 0 0 0-2 2V5zM20 5a2 2 0 0 0-2-2h-6v18h6a2 2 0 0 1 2 2V5z"/></svg></span>
        <div><h2>Read &amp; Understand</h2><p>Short reads to ground the ideas before you build with them.</p></div>
      </div>

      <div class="card-grid">
        @for (r of readings(); track r.id; let i = $index) {
          <article class="lcard" [class.checked]="checked()[i]">
            <div class="lcard-top">
              <span class="lcard-kind"><span class="kdot" [style.background]="i % 2 === 0 ? 'var(--violet)' : 'var(--aqua)'"></span>Reading</span>
              <span class="read-time"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>{{ r.estimatedMinutes }} min</span>
            </div>
            <h3>{{ r.title }}</h3>
            <p class="excerpt">{{ r.content }}</p>
            <div class="lcard-foot">
              <label class="checkbox">
                <input type="checkbox" [checked]="checked()[i]" (change)="toggle(i)">
                <span class="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>Mark as read
              </label>
            </div>
          </article>
        }
      </div>

      <div class="stage-foot">
        <div class="left"><span class="si"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><span>{{ hint() }}</span></div>
        <div class="actions"><button class="btn btn-primary" type="button" [disabled]="!allRead()" (click)="complete.emit()">Mark reading complete <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>
      </div>
    </section>
  `,
})
export class ReadingSectionComponent {
  readonly readings = input<ReadingMaterial[]>([]);
  readonly active = input(false);
  readonly complete = output<void>();

  readonly checked = signal<boolean[]>([]);

  /** The stage can only be completed once every reading is marked as read. */
  readonly allRead = computed(() => {
    const total = this.readings().length;
    return total > 0 && this.checked().filter(Boolean).length === total;
  });

  readonly hint = computed(() => {
    const total = this.readings().length;
    const n = this.checked().filter(Boolean).length;
    if (n === 0) {
      return 'Read through, then continue. No rush.';
    }
    return n === total ? 'All read — nicely done.' : `${n} of ${total} read`;
  });

  toggle(i: number): void {
    const next = [...this.checked()];
    next[i] = !next[i];
    this.checked.set(next);
  }
}
