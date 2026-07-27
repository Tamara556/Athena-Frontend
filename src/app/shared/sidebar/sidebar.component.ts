import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Session } from '../../core/session';
import { StreaksStore } from '../../features/streaks/streaks.store';
import { TranslatePipe } from '../translate.pipe';

/**
 * Independent Athena sidebar. Renders the `.app` shell and projects page content
 * via <ng-content>, so a page is just `<app-sidebar><main>…</main></app-sidebar>`.
 * Owns its own collapse (desktop) and drawer (mobile) state, exactly like the
 * original standalone design.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly streaks = inject(StreaksStore);

  readonly currentStreak = computed(() => this.streaks.summary().currentStreak);

  readonly collapsed = signal(false);
  readonly drawerOpen = signal(false);
  /** On tablet the rail auto-collapses; this flag is the user's manual "expand" override. */
  readonly forceExpanded = signal(false);

  // Same breakpoints as the CSS, so toggle() and the stylesheet always agree.
  private readonly mobile = window.matchMedia('(max-width:760px)');
  private readonly tablet = window.matchMedia('(min-width:761px) and (max-width:1024px)');

  readonly displayName = computed(() => this.session.name() ?? 'Learner');
  /** Uploaded profile picture URL, or null to fall back to initials. */
  readonly avatar = computed(() => this.session.image());
  readonly initials = computed(() => {
    const name = (this.session.name() ?? '').trim();
    if (!name) return 'A';
    const parts = name.split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + second).toUpperCase() || 'A';
  });

  /** Brand click: drawer on mobile, expand/collapse the rail on tablet, collapse on desktop. */
  toggle(): void {
    if (this.mobile.matches) {
      // Mobile: the brand just opens/closes the drawer.
      this.drawerOpen.update((v) => !v);
      return;
    }
    if (this.tablet.matches) {
      // Tablet auto-collapses to the rail; toggling flips the manual expand override.
      this.forceExpanded.update((v) => !v);
      this.collapsed.set(false);
      return;
    }
    this.collapsed.update((v) => !v);
    this.forceExpanded.set(false);
  }

  /** Public so a page topbar's hamburger can open the drawer. */
  openDrawer(): void {
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  /** After tapping a real link on mobile, close the drawer. */
  onNavigate(): void {
    if (this.mobile.matches) this.closeDrawer();
  }

  /** Placeholder nav entries that don't have a page yet. */
  inert(e: Event): void {
    e.preventDefault();
  }

  logout(): void {
    this.session.clear();
    this.closeDrawer();
    this.router.navigateByUrl('/login');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeDrawer();
  }
}
