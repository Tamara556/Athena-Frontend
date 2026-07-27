import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BadgesApi } from './badges.api';
import { Badge, BadgeSort, BadgeStatus } from './badges.models';
import {
  computeStats,
  distinctCategories,
  distinctRarities,
  filterBadges,
  firstEarnedAt,
  recentlyEarned,
  sortBadges,
} from './badges.logic';

@Injectable({ providedIn: 'root' })
export class BadgesStore {
  private readonly api = inject(BadgesApi);
  private readonly source = toSignal(this.api.getBadges(), { initialValue: null });

  readonly loading = computed(() => this.source() === null);
  readonly all = computed<Badge[]>(() => this.source() ?? []);

  readonly search = signal('');
  readonly category = signal<string | null>(null);
  readonly rarity = signal<string | null>(null);
  readonly status = signal<BadgeStatus>('all');
  readonly aiOnly = signal(false);
  readonly sort = signal<BadgeSort>('recent');
  readonly selected = signal<Badge | null>(null);

  readonly stats = computed(() => computeStats(this.all()));
  readonly categories = computed(() => distinctCategories(this.all()));
  readonly rarities = computed(() => distinctRarities(this.all()));
  readonly recent = computed(() => recentlyEarned(this.all()));
  readonly firstEarned = computed(() => firstEarnedAt(this.all()));

  readonly visible = computed(() => sortBadges(
    filterBadges(this.all(), {
      search: this.search(),
      category: this.category(),
      rarity: this.rarity(),
      status: this.status(),
      aiOnly: this.aiOnly(),
    }),
    this.sort()));

  readonly hasActiveFilters = computed(() =>
    this.search().trim().length > 0
    || this.category() !== null
    || this.rarity() !== null
    || this.status() !== 'all'
    || this.aiOnly());

  toggleCategory(value: string): void {
    this.category.update((current) => (current === value ? null : value));
  }

  toggleRarity(value: string): void {
    this.rarity.update((current) => (current === value ? null : value));
  }

  setStatus(value: BadgeStatus): void {
    this.status.set(value);
  }

  toggleAiOnly(): void {
    this.aiOnly.update((current) => !current);
  }

  setSort(value: BadgeSort): void {
    this.sort.set(value);
  }

  clearFilters(): void {
    this.search.set('');
    this.category.set(null);
    this.rarity.set(null);
    this.status.set('all');
    this.aiOnly.set(false);
  }

  open(badge: Badge): void {
    this.selected.set(badge);
  }

  close(): void {
    this.selected.set(null);
  }
}
