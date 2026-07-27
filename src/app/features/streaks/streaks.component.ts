import { Component, HostListener, OnDestroy, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';
import { LangSelectComponent } from '../../shared/lang-select/lang-select.component';
import { CountUpComponent } from '../../shared/count-up/count-up.component';
import { StreaksStore } from './streaks.store';
import { buildCalendar, dayDetail, fromIso, toIso, MONTH_SHORT, WEEKDAY_LABELS } from './streaks.logic';
import { I18nService } from '../../core/i18n';
import { TranslatePipe } from '../../shared/translate.pipe';

const CONSIST_COUNT = 3;
const MESSAGE_INTERVAL_MS = 5000;
const REVEAL_DELAY_MS = 60;
const SWITCH_DELAY_MS = 220;
const MONTHS_IN_YEAR = 12;
const MINUTES_PER_HOUR = 60;

@Component({
  selector: 'app-streaks',
  standalone: true,
  imports: [SidebarComponent, ThemeToggleComponent, LangSelectComponent, CountUpComponent, TranslatePipe],
  templateUrl: './streaks.component.html',
})
export class StreaksComponent implements OnInit, OnDestroy {
  private readonly sidebar = viewChild(SidebarComponent);
  readonly store = inject(StreaksStore);
  private readonly i18n = inject(I18nService);

  private t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.translate(key, params);
  }

  readonly scrolled = signal(false);
  readonly switching = signal(false);
  readonly showEmpty = signal(false);
  readonly viewYear = signal(new Date().getFullYear());
  readonly viewMonth = signal(new Date().getMonth());
  readonly selKey = signal<string | null>(null);
  readonly msgIndex = signal(0);

  private msgTimer?: ReturnType<typeof setInterval>;

  readonly loaded = computed(() => !this.store.loading());
  readonly calTitle = computed(() =>
    new Intl.DateTimeFormat(this.i18n.lang(), { month: 'long' }).format(new Date(this.viewYear(), this.viewMonth(), 1)));
  /** Localized short weekday headers, Sunday-first, matching the calendar grid. */
  readonly dowHeaders = computed(() => {
    const fmt = new Intl.DateTimeFormat(this.i18n.lang(), { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2023, 0, 1 + i))); // 2023-01-01 is a Sunday
  });
  readonly cells = computed(() => buildCalendar(
    this.store.activityByDate(), this.store.today(), this.store.firstActiveDate(), this.viewYear(), this.viewMonth()));
  readonly detail = computed(() => {
    const key = this.selKey();
    return key ? dayDetail(this.store.activityByDate(), key) : null;
  });
  readonly detailLabel = computed(() => {
    const key = this.selKey();
    if (!key) {
      return '';
    }
    return new Intl.DateTimeFormat(this.i18n.lang(), { month: 'long', day: 'numeric' }).format(fromIso(key));
  });
  readonly consistMessage = computed(() => this.t('streaks.consist.' + this.msgIndex()));

  /** Localize a store-provided English weekday abbrev (Sun…Sat) via Intl. */
  dow(label: string): string {
    const i = WEEKDAY_LABELS.indexOf(label);
    return i < 0 ? label : this.dowHeaders()[i];
  }

  /** Localize a store-provided English month abbrev (Jan…Dec) via Intl. */
  monShort(label: string): string {
    const i = MONTH_SHORT.indexOf(label);
    return i < 0 ? label
      : new Intl.DateTimeFormat(this.i18n.lang(), { month: 'short' }).format(new Date(2023, i, 1));
  }
  readonly learningHours = computed(() => Math.floor(this.store.summary().learningMinutes / MINUTES_PER_HOUR));
  readonly yearHours = computed(() => Math.floor(this.store.yearly().minutes / MINUTES_PER_HOUR));

  ngOnInit(): void {
    this.selKey.set(toIso(new Date()));
    setTimeout(() => document.querySelectorAll('.st-root .reveal').forEach((el) => el.classList.add('in')), REVEAL_DELAY_MS);
    this.msgTimer = setInterval(
      () => this.msgIndex.update((index) => (index + 1) % CONSIST_COUNT), MESSAGE_INTERVAL_MS);
  }

  ngOnDestroy(): void {
    clearInterval(this.msgTimer);
  }

  openDrawer(): void {
    this.sidebar()?.openDrawer();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  selectDay(iso: string): void {
    this.selKey.set(this.selKey() === iso ? null : iso);
  }

  switchMonth(delta: number): void {
    this.switching.set(true);
    this.selKey.set(null);
    setTimeout(() => {
      const total = this.viewYear() * MONTHS_IN_YEAR + this.viewMonth() + delta;
      this.viewYear.set(Math.floor(total / MONTHS_IN_YEAR));
      this.viewMonth.set(((total % MONTHS_IN_YEAR) + MONTHS_IN_YEAR) % MONTHS_IN_YEAR);
      this.switching.set(false);
    }, SWITCH_DELAY_MS);
  }

  formatHours(minutes: number): string {
    const hours = Math.floor(minutes / MINUTES_PER_HOUR);
    const mins = minutes % MINUTES_PER_HOUR;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  }

  formatDate(iso: string): string {
    return new Intl.DateTimeFormat(this.i18n.lang(), { year: 'numeric', month: 'long', day: 'numeric' })
      .format(fromIso(iso));
  }

  pct(ratio: number): number {
    return Math.round(ratio * 100);
  }
}
