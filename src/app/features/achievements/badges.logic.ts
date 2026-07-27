import { Badge, BadgeFilter, BadgeSort, BadgeStats } from './badges.models';

const RECENTLY_EARNED_LIMIT = 4;
const FULL_PERCENT = 100;
const DEFAULT_ACCENT = '#8B5CF6';
const GLOW_ALPHA = 0.32;
const HALO_ALPHA = 0.16;

interface RarityMeta {
  rank: number;
  label: string;
  accent: string;
}

const RARITY_META: Record<string, RarityMeta> = {
  common: { rank: 1, label: 'Common', accent: '#94A3B8' },
  rare: { rank: 2, label: 'Rare', accent: '#22D3EE' },
  epic: { rank: 3, label: 'Epic', accent: '#A855F7' },
  legendary: { rank: 4, label: 'Legendary', accent: '#FBBF24' },
  mythic: { rank: 5, label: 'Mythic', accent: '#F472B6' },
};

export function rarityRank(rarity: string): number {
  return RARITY_META[rarity.toLowerCase()]?.rank ?? 0;
}

export function rarityLabel(rarity: string): string {
  return RARITY_META[rarity.toLowerCase()]?.label ?? rarity;
}

export function rarityAccent(rarity: string): string {
  return RARITY_META[rarity.toLowerCase()]?.accent ?? DEFAULT_ACCENT;
}

export function progressPercent(badge: Badge): number {
  if (badge.earned) {
    return FULL_PERCENT;
  }
  if (badge.maxProgress <= 0) {
    return 0;
  }
  return Math.min(FULL_PERCENT, Math.round((badge.progress / badge.maxProgress) * FULL_PERCENT));
}

export function cardVars(badge: Badge): Record<string, string> {
  const base = badge.color || rarityAccent(badge.rarity);
  return {
    '--g1': base,
    '--g2': rarityAccent(badge.rarity),
    '--glow': hexToRgba(base, GLOW_ALPHA),
    '--halo': hexToRgba(base, HALO_ALPHA),
  };
}

export function distinctCategories(badges: Badge[]): string[] {
  return Array.from(new Set(badges.map((badge) => badge.category))).sort((a, b) => a.localeCompare(b));
}

export function distinctRarities(badges: Badge[]): string[] {
  return Array.from(new Set(badges.map((badge) => badge.rarity))).sort((a, b) => rarityRank(a) - rarityRank(b));
}

export function filterBadges(badges: Badge[], filter: BadgeFilter): Badge[] {
  const query = filter.search.trim().toLowerCase();
  return badges.filter((badge) => {
    if (query && !matchesQuery(badge, query)) {
      return false;
    }
    if (filter.category && badge.category !== filter.category) {
      return false;
    }
    if (filter.rarity && badge.rarity !== filter.rarity) {
      return false;
    }
    if (filter.status === 'earned' && !badge.earned) {
      return false;
    }
    if (filter.status === 'locked' && badge.earned) {
      return false;
    }
    return !(filter.aiOnly && !badge.generatedByAI);
  });
}

export function sortBadges(badges: Badge[], sort: BadgeSort): Badge[] {
  const copy = [...badges];
  switch (sort) {
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'rarity':
      return copy.sort((a, b) => rarityRank(b.rarity) - rarityRank(a.rarity) || earnedTime(b) - earnedTime(a));
    case 'progress':
      return copy.sort((a, b) => progressPercent(b) - progressPercent(a));
    default:
      return copy.sort((a, b) => rank(b) - rank(a));
  }
}

export function computeStats(badges: Badge[]): BadgeStats {
  const unlocked = badges.filter((badge) => badge.earned).length;
  const total = badges.length;
  return {
    total,
    unlocked,
    locked: total - unlocked,
    aiGenerated: badges.filter((badge) => badge.generatedByAI).length,
    completionPercent: total > 0 ? Math.round((unlocked / total) * FULL_PERCENT) : 0,
  };
}

export function recentlyEarned(badges: Badge[]): Badge[] {
  return badges
    .filter((badge) => badge.earned && badge.earnedAt)
    .sort((a, b) => earnedTime(b) - earnedTime(a))
    .slice(0, RECENTLY_EARNED_LIMIT);
}

export function firstEarnedAt(badges: Badge[]): string | null {
  return badges
    .filter((badge) => badge.earned && badge.earnedAt)
    .map((badge) => badge.earnedAt as string)
    .sort((a, b) => a.localeCompare(b))[0] ?? null;
}

function matchesQuery(badge: Badge, query: string): boolean {
  return [badge.title, badge.description, badge.category, badge.rarity]
    .some((field) => field.toLowerCase().includes(query));
}

function rank(badge: Badge): number {
  return badge.earned ? earnedTime(badge) : progressPercent(badge) - FULL_PERCENT;
}

function earnedTime(badge: Badge): number {
  return badge.earnedAt ? new Date(badge.earnedAt).getTime() : 0;
}

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((char) => char + char).join('')
    : normalized;
  const r = parseInt(value.slice(0, 2), 16) || 0;
  const g = parseInt(value.slice(2, 4), 16) || 0;
  const b = parseInt(value.slice(4, 6), 16) || 0;
  return `rgba(${r},${g},${b},${alpha})`;
}
