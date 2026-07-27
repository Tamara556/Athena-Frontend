import { Component, HostListener, computed, effect, inject, signal } from '@angular/core';
import { TourService } from './tour.service';

interface Spot { top: number; left: number; width: number; height: number; }
interface Pop { top: number; left: number; }

const POP_W = 320;
const POP_H = 210; // estimate for placement/clamping
const GAP = 14;
const PAD = 8;     // spotlight padding around the target

@Component({
  selector: 'app-tour-overlay',
  standalone: true,
  styles: [`
    :host{position:fixed;inset:0;z-index:200;pointer-events:none}
    .backdrop{position:fixed;inset:0;background:rgba(8,6,18,.55);pointer-events:auto;animation:tfade .2s ease}
    .hole{position:fixed;border-radius:14px;pointer-events:none;
      box-shadow:0 0 0 9999px rgba(8,6,18,.55), 0 0 0 2px rgba(255,255,255,.85);
      transition:top .3s cubic-bezier(.4,0,.2,1),left .3s cubic-bezier(.4,0,.2,1),width .3s,height .3s;animation:tfade .2s ease}
    /* Solid white card (opaque) with fixed dark text so it reads on white in any theme. */
    .pop{position:fixed;width:${POP_W}px;max-width:calc(100vw - 24px);pointer-events:auto;
      background:#fff;color:#241d2e;border:1px solid rgba(20,10,30,.1);border-radius:16px;
      box-shadow:0 24px 70px rgba(0,0,0,.32);padding:18px 18px 15px;
      transition:top .3s cubic-bezier(.4,0,.2,1),left .3s cubic-bezier(.4,0,.2,1);animation:tpop .28s cubic-bezier(.34,1.56,.64,1)}
    .pop.center{top:50%;left:50%;transform:translate(-50%,-50%)}
    .step-of{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#9089a0}
    .pop h4{margin:6px 0 6px;font-family:var(--display);font-weight:600;font-size:17px;letter-spacing:-.01em;color:#1b1522}
    .pop p{margin:0;font-size:13.5px;line-height:1.55;color:#4b4557}
    .dots{display:flex;gap:6px;justify-content:center;margin:15px 0 13px;flex-wrap:wrap}
    .dots button{width:7px;height:7px;border-radius:50%;border:0;padding:0;cursor:pointer;background:#e2ddec;transition:transform .2s,background .2s}
    .dots button.on{background:var(--violet,#8B5CF6);transform:scale(1.35)}
    .row{display:flex;align-items:center;gap:10px}
    .row .skip{margin-right:auto;background:none;border:0;color:#9089a0;font-size:12.5px;cursor:pointer;padding:4px}
    .row .skip:hover{color:#1b1522}
    .btn-sm{font-family:var(--display);font-weight:600;font-size:13px;border-radius:10px;padding:8px 14px;cursor:pointer;border:1px solid rgba(20,10,30,.12)}
    .btn-ghost{background:#fff;color:#241d2e}
    .btn-ghost:hover{background:#f4f2f8}
    .btn-solid{background:var(--violet,#8B5CF6);color:#fff;border-color:transparent}
    @keyframes tfade{from{opacity:0}to{opacity:1}}
    @keyframes tpop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}
    @media (prefers-reduced-motion:reduce){.hole,.pop{transition:none;animation:none}}
  `],
  template: `
    @if (tour.active() && tour.step(); as step) {
      <div class="backdrop" (click)="tour.finish()"></div>
      @if (spot(); as s) {
        <div class="hole" [style.top.px]="s.top" [style.left.px]="s.left" [style.width.px]="s.width" [style.height.px]="s.height"></div>
      }
      <div class="pop" [class.center]="!spot()"
           [style.top.px]="!spot() ? null : pop().top" [style.left.px]="!spot() ? null : pop().left">
        <span class="step-of">Step {{ tour.index() + 1 }} of {{ tour.count() }}</span>
        <h4>{{ step.title }}</h4>
        <p>{{ step.body }}</p>
        <div class="dots">
          @for (s of tour.steps(); track $index) {
            <button [class.on]="$index === tour.index()" (click)="tour.goTo($index)" [attr.aria-label]="'Go to step ' + ($index + 1)"></button>
          }
        </div>
        <div class="row">
          <button class="skip" (click)="tour.finish()">Skip tour</button>
          @if (!tour.isFirst()) {
            <button class="btn-sm btn-ghost" (click)="tour.prev()">Back</button>
          }
          <button class="btn-sm btn-solid" (click)="tour.next()">{{ tour.isLast() ? 'Done' : 'Next' }}</button>
        </div>
      </div>
    }
  `,
})
export class TourOverlayComponent {
  readonly tour = inject(TourService);

  readonly spot = signal<Spot | null>(null);
  readonly pop = signal<Pop>({ top: 0, left: 0 });

  constructor() {
    // Whenever the step changes, find its target, scroll it into view and measure it.
    effect(() => {
      if (!this.tour.active()) {
        return;
      }
      const step = this.tour.step();
      const selector = step?.selector;
      if (!selector) {
        this.spot.set(null);
        return;
      }
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        this.spot.set(null);
        return;
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      // Let the scroll settle before measuring.
      setTimeout(() => this.measure(el), 320);
    });
  }

  @HostListener('window:resize')
  @HostListener('window:scroll')
  onViewportChange(): void {
    const selector = this.tour.step()?.selector;
    if (this.tour.active() && selector) {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        this.measure(el);
      }
    }
  }

  private measure(el: HTMLElement): void {
    const r = el.getBoundingClientRect();
    const spot: Spot = {
      top: r.top - PAD,
      left: r.left - PAD,
      width: r.width + PAD * 2,
      height: r.height + PAD * 2,
    };
    this.spot.set(spot);
    this.pop.set(this.place(spot));
  }

  /** Pick the side of the spotlight with the most room, then clamp to the viewport. */
  private place(s: Spot): Pop {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const spaceRight = vw - (s.left + s.width);
    const spaceLeft = s.left;
    const spaceBelow = vh - (s.top + s.height);

    let top: number;
    let left: number;
    if (spaceRight >= POP_W + GAP) {
      left = s.left + s.width + GAP;
      top = s.top;
    } else if (spaceLeft >= POP_W + GAP) {
      left = s.left - POP_W - GAP;
      top = s.top;
    } else if (spaceBelow >= POP_H + GAP) {
      top = s.top + s.height + GAP;
      left = s.left;
    } else {
      top = s.top - POP_H - GAP;
      left = s.left;
    }
    top = Math.max(12, Math.min(top, vh - POP_H - 12));
    left = Math.max(12, Math.min(left, vw - POP_W - 12));
    return { top, left };
  }
}
