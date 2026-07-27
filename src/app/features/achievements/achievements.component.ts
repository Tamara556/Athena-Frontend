import { Component, HostListener, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';
import { LangSelectComponent } from '../../shared/lang-select/lang-select.component';
import { CountUpComponent } from '../../shared/count-up/count-up.component';
import { BadgesStore } from './badges.store';
import { Badge, BadgeSort, BadgeStatus } from './badges.models';
import { cardVars, progressPercent, rarityLabel } from './badges.logic';
import { I18nService } from '../../core/i18n';
import { TranslatePipe } from '../../shared/translate.pipe';

const STATUS_OPTIONS: { value: BadgeStatus }[] = [
  { value: 'all' },
  { value: 'earned' },
  { value: 'locked' },
];
const SORT_OPTIONS: { value: BadgeSort }[] = [
  { value: 'recent' },
  { value: 'rarity' },
  { value: 'progress' },
  { value: 'title' },
];

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [SidebarComponent, ThemeToggleComponent, LangSelectComponent, CountUpComponent, TranslatePipe],
  templateUrl: './achievements.component.html',
})
export class AchievementsComponent implements OnInit {
  private readonly sidebar = viewChild(SidebarComponent);
  readonly store = inject(BadgesStore);
  private readonly i18n = inject(I18nService);

  readonly scrolled = signal(false);
  readonly showEmptyPreview = signal(false);

  readonly statusOptions = STATUS_OPTIONS;
  readonly sortOptions = SORT_OPTIONS;

  readonly loaded = computed(() => !this.store.loading());
  readonly emptyState = computed(() => this.showEmptyPreview() || (this.loaded() && this.store.stats().total === 0));
  readonly heroSince = computed(() => {
    const iso = this.store.firstEarned();
    return iso ? this.formatMonth(iso) : null;
  });

  constructor() {
    effect(() => {
      if (this.loaded()) {
        setTimeout(() => this.revealAll(), 40);
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => this.revealAll(), 60);
  }

  openDrawer(): void {
    this.sidebar()?.openDrawer();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.store.close();
  }

  badgeStyle(badge: Badge): Record<string, string> {
    return cardVars(badge);
  }

  percent(badge: Badge): number {
    return progressPercent(badge);
  }

  rarity(value: string): string {
    const key = 'ach.rarity.' + value.toLowerCase();
    const translated = this.i18n.translate(key);
    return translated === key ? rarityLabel(value) : translated;
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat(this.i18n.lang(), { year: 'numeric', month: 'short', day: 'numeric' })
      .format(new Date(`${iso}T00:00:00`));
  }

  formatMonth(iso: string): string {
    return new Intl.DateTimeFormat(this.i18n.lang(), { year: 'numeric', month: 'long' })
      .format(new Date(`${iso}T00:00:00`));
  }

  private revealAll(): void {
    document.querySelectorAll('.ach-root .reveal:not(.in)').forEach((el) => el.classList.add('in'));
  }
}
