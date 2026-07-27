export type BadgeVisibility = 'visible' | 'hidden' | 'secret';

export interface BadgeReward {
  type: string;
  label: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
  category: string;
  earned: boolean;
  earnedAt: string | null;
  progress: number;
  maxProgress: number;
  generatedByAI: boolean;
  color: string;
  animation: string;
  experience?: number;
  reward?: BadgeReward;
  visibility?: BadgeVisibility;
  metadata?: Record<string, unknown>;
}

export type BadgeStatus = 'all' | 'earned' | 'locked';
export type BadgeSort = 'recent' | 'rarity' | 'progress' | 'title';

export interface BadgeFilter {
  search: string;
  category: string | null;
  rarity: string | null;
  status: BadgeStatus;
  aiOnly: boolean;
}

export interface BadgeStats {
  total: number;
  unlocked: number;
  locked: number;
  aiGenerated: number;
  completionPercent: number;
}

export interface BadgeCatalogDto {
  code: string;
  name: string;
  description: string;
  icon: string;
  rarity?: string;
  category?: string;
  reward?: BadgeReward;
  experience?: number;
  visibility?: BadgeVisibility;
}

export interface UserBadgeDto {
  code: string;
  name: string;
  description: string;
  icon: string;
  awardedAt: string;
}

export interface AiBadgeSuggestionDto {
  code: string;
  name: string;
  description: string;
  icon: string;
}

export interface BadgeProgressDto {
  code: string;
  progress: number;
  maxProgress: number;
}
