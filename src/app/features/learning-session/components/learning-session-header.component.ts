import { Component, effect, input, output, signal } from '@angular/core';

const RING_CIRC = 327;

@Component({
  selector: 'app-learning-session-header',
  standalone: true,
  styles: [':host{display:contents} .hero-ring{transition:stroke-dashoffset 1.2s cubic-bezier(.2,.8,.2,1)}'],
  template: `
    <section class="hero reveal" aria-labelledby="topicTitle">
      <div class="ring-wrap">
        <div class="ring">
          <svg width="120" height="120" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(21,21,31,.07)" stroke-width="9"/>
            <circle class="hero-ring" cx="60" cy="60" r="52" fill="none" stroke="url(#kgEdge2)" stroke-width="9"
                    stroke-linecap="round" stroke-dasharray="327" [style.stroke-dashoffset]="ringOffset()"/>
            <defs><linearGradient id="kgEdge2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8B5CF6"/><stop offset="1" stop-color="#22D3EE"/></linearGradient></defs>
          </svg>
          <div class="ring-core">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>
          </div>
        </div>
        <div style="text-align:center">
          <div class="ring-pct">{{ pct() }}%</div>
          <div class="ring-status">{{ statusText() }}</div>
        </div>
      </div>

      <div style="min-width:0">
        <div class="hero-meta-top">
          <span class="you-here"><span class="pdot"></span>You are here</span>
          <span class="hero-time">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            {{ totalLabel() }} · <strong>{{ leftLabel() }}</strong>
          </span>
        </div>
        <h1 id="topicTitle">{{ title() }}</h1>
        <p class="sub">Athena prepared this learning journey specifically for you — paced for the way you learn best.</p>
        @if (ctaLabel()) {
          <div class="hero-tags">
            <button class="btn btn-primary" type="button" (click)="cta.emit()">{{ ctaLabel() }}</button>
          </div>
        }
      </div>
    </section>
  `,
})
export class LearningSessionHeaderComponent {
  readonly title = input('');
  readonly pct = input(0);
  readonly statusText = input('In Progress');
  readonly totalLabel = input('');
  readonly leftLabel = input('');
  readonly ctaLabel = input<string | null>(null);
  readonly cta = output<void>();

  readonly ringOffset = signal(RING_CIRC);

  constructor() {
    effect(() => {
      const target = RING_CIRC - (RING_CIRC * this.pct()) / 100;
      setTimeout(() => this.ringOffset.set(target), 350);
    });
  }
}
