import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { API_BASE } from '../../core/api';
import {
  AiBadgeSuggestionDto,
  Badge,
  BadgeCatalogDto,
  BadgeProgressDto,
  BadgeReward,
  BadgeVisibility,
  UserBadgeDto,
} from './badges.models';

const DEFAULT_ACCENT = '#8B5CF6';

interface Presentation {
  rarity: string;
  category: string;
  color: string;
  animation: string;
  maxProgress: number;
  reward?: BadgeReward;
}

const PRESENTATION: Record<string, Presentation> = {
  'first-lesson': { rarity: 'Common', category: 'Learning', color: '#A855F7', animation: 'pulse', maxProgress: 1 },
  'tasks-10': { rarity: 'Common', category: 'Learning', color: '#34D399', animation: '', maxProgress: 10 },
  'streak-7': { rarity: 'Common', category: 'Consistency', color: '#FB923C', animation: 'flame', maxProgress: 7 },
  'streak-14': { rarity: 'Rare', category: 'Consistency', color: '#FBBF24', animation: 'flame', maxProgress: 14 },
  'interview-first': { rarity: 'Rare', category: 'Interview', color: '#8B5CF6', animation: '', maxProgress: 1 },
  'streak-30': { rarity: 'Epic', category: 'Consistency', color: '#F472B6', animation: 'flame', maxProgress: 30 },
  'tasks-50': { rarity: 'Rare', category: 'Learning', color: '#22D3EE', animation: '', maxProgress: 50 },
  'tasks-100': { rarity: 'Epic', category: 'Learning', color: '#06B6D4', animation: '', maxProgress: 100 },
  'hours-100': { rarity: 'Epic', category: 'Learning', color: '#8B5CF6', animation: '', maxProgress: 100 },
  'roadmap-first': { rarity: 'Legendary', category: 'Learning', color: '#FBBF24', animation: '', maxProgress: 6, reward: { type: 'unlock', label: 'Advanced track' } },
  'streak-100': { rarity: 'Legendary', category: 'Consistency', color: '#FB7185', animation: '', maxProgress: 100, reward: { type: 'title', label: 'Centurion' } },
  'ai-spring-rookie': { rarity: 'Rare', category: 'Programming', color: '#34D399', animation: 'shine', maxProgress: 1 },
  'ai-bug-hunter': { rarity: 'Epic', category: 'Programming', color: '#A855F7', animation: 'shine', maxProgress: 1 },
  'ai-api-architect': { rarity: 'Epic', category: 'Programming', color: '#06B6D4', animation: '', maxProgress: 5 },
  'ai-microservice-explorer': { rarity: 'Legendary', category: 'Programming', color: '#8B5CF6', animation: '', maxProgress: 4 },
  'ai-kafka-explorer': { rarity: 'Mythic', category: 'AI', color: '#F472B6', animation: '', maxProgress: 3, reward: { type: 'title', label: 'Event Streamer' } },
};

const XP_BY_RARITY: Record<string, number> = {
  common: 50,
  rare: 100,
  epic: 200,
  legendary: 400,
  mythic: 800,
};

@Injectable({ providedIn: 'root' })
export class BadgesApi {
  private readonly http = inject(HttpClient);

  getBadges(): Observable<Badge[]> {
    return forkJoin({
      catalog: this.fetchCatalog(),
      mine: this.fetchMyBadges(),
      ai: this.fetchAiSuggestions(),
      progress: this.fetchProgress(),
    }).pipe(map(({ catalog, mine, ai, progress }) => mergeBadges(catalog, mine, ai, progress)));
  }

  private fetchCatalog(): Observable<BadgeCatalogDto[]> {
    return this.http.get<BadgeCatalogDto[]>(`${API_BASE}/badges`).pipe(catchError(() => of<BadgeCatalogDto[]>([])));
  }

  private fetchMyBadges(): Observable<UserBadgeDto[]> {
    return this.http.get<UserBadgeDto[]>(`${API_BASE}/badges/me`).pipe(catchError(() => of<UserBadgeDto[]>([])));
  }

  private fetchAiSuggestions(): Observable<AiBadgeSuggestionDto[]> {
    return of([]);
  }

  private fetchProgress(): Observable<BadgeProgressDto[]> {
    return of([]);
  }
}

interface Definition {
  code: string;
  name: string;
  description: string;
  icon: string;
  enrich?: BadgeCatalogDto;
}

export function mergeBadges(
  catalog: BadgeCatalogDto[],
  mine: UserBadgeDto[],
  ai: AiBadgeSuggestionDto[],
  progress: BadgeProgressDto[],
): Badge[] {
  const definitions = new Map<string, Definition>();
  for (const dto of catalog) {
    definitions.set(dto.code, { code: dto.code, name: dto.name, description: dto.description, icon: dto.icon, enrich: dto });
  }
  for (const dto of ai) {
    if (!definitions.has(dto.code)) {
      definitions.set(dto.code, { code: dto.code, name: dto.name, description: dto.description, icon: dto.icon });
    }
  }

  const aiCodes = new Set(ai.map((dto) => dto.code));
  const awardedByCode = new Map(mine.map((dto) => [dto.code, dto]));
  const progressByCode = new Map(progress.map((dto) => [dto.code, dto]));

  return Array.from(definitions.values()).map((def) => toBadge(def, aiCodes, awardedByCode, progressByCode));
}

function toBadge(
  def: Definition,
  aiCodes: Set<string>,
  awardedByCode: Map<string, UserBadgeDto>,
  progressByCode: Map<string, BadgeProgressDto>,
): Badge {
  const presentation = presentationFor(def.code);
  const rarity = def.enrich?.rarity ?? presentation.rarity;
  const category = def.enrich?.category ?? presentation.category;
  const award = awardedByCode.get(def.code);
  const earned = award !== undefined;
  const progressDto = progressByCode.get(def.code);
  const maxProgress = progressDto?.maxProgress ?? presentation.maxProgress;
  const generatedByAI = aiCodes.has(def.code);

  return {
    id: def.code,
    title: def.name,
    description: def.description,
    icon: def.icon,
    rarity,
    category,
    earned,
    earnedAt: award ? toIsoDate(award.awardedAt) : null,
    progress: earned ? maxProgress : progressDto?.progress ?? 0,
    maxProgress,
    generatedByAI,
    color: presentation.color,
    animation: presentation.animation,
    experience: def.enrich?.experience ?? experienceFor(rarity),
    reward: def.enrich?.reward ?? presentation.reward,
    visibility: def.enrich?.visibility ?? defaultVisibility(),
    metadata: { source: generatedByAI ? 'ai' : 'catalog' },
  };
}

function presentationFor(code: string): Presentation {
  return PRESENTATION[code] ?? { rarity: 'Common', category: 'General', color: DEFAULT_ACCENT, animation: '', maxProgress: 1 };
}

function experienceFor(rarity: string): number {
  return XP_BY_RARITY[rarity.toLowerCase()] ?? XP_BY_RARITY['common'];
}

function defaultVisibility(): BadgeVisibility {
  return 'visible';
}

function toIsoDate(instant: string): string {
  return instant.slice(0, 10);
}
