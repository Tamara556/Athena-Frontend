import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Athena landing page. Markup + styles are a 1:1 port of the static design; the
 * original vanilla scripts (scroll-reveal, nav scroll state, mobile menu, ring
 * animation) are reimplemented here as Angular component behaviour.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;

  readonly scrolled = signal(false);
  readonly menuOpen = signal(false);

  private revealObserver?: IntersectionObserver;
  private ringObserver?: IntersectionObserver;

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 24);
  }

  ngAfterViewInit(): void {
    const root: HTMLElement = this.host.nativeElement;

    // Reveal-on-scroll
    this.revealObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          if (e.target.id === 'bigRing' || e.target.querySelector?.('#bigRing')) {
            root.querySelector('#bigRing')?.classList.add('in');
          }
          this.revealObserver?.unobserve(e.target);
        }),
      { threshold: 0.12 },
    );
    root.querySelectorAll('.reveal').forEach((el) => this.revealObserver!.observe(el));

    // Big ring animation trigger
    this.ringObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            this.ringObserver?.unobserve(e.target);
          }
        }),
      { threshold: 0.4 },
    );
    const bigRing = root.querySelector('#bigRing');
    if (bigRing) this.ringObserver.observe(bigRing);
  }

  ngOnDestroy(): void {
    this.revealObserver?.disconnect();
    this.ringObserver?.disconnect();
  }
}
