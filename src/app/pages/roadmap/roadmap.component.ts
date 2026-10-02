import { AfterViewInit, Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { RoadmapPhase, RoadmapResponse } from '../../core/api.types';
import { Session } from '../../core/session';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';
import { LangSelectComponent } from '../../shared/lang-select/lang-select.component';
import { TourService } from '../../shared/tour/tour.service';
import { ROADMAP_TOUR } from '../../shared/tour/tour.steps';
import { I18nService } from '../../core/i18n';
import { TranslatePipe } from '../../shared/translate.pipe';

type NodeStatus = 'done' | 'current' | 'avail' | 'locked';

interface PhaseVM {
  index: number;
  name: string;
  description: string;
  weeks: number;
  status: NodeStatus;
  skills: string[];
  objectives: string[];
  progress: number; // 0..100
  ringOffset: number; // for the current node's progress ring (circumference 301.6)
  side: 'left' | 'right';
}

/**
 * The learner's roadmap. Each phase is a node on the journey:
 *  - Completed → green node; hover shows its card (status, duration, progress, skills).
 *  - Current   → expanded feature-card with objectives.
 *  - Available → node; hover shows its card.
 *  - Locked    → node only, no card.
 * More than 5 phases paginate with ← / → . All data comes from the backend roadmap.
 */
@Component({
  selector: 'app-roadmap',
  imports: [SidebarComponent, ThemeToggleComponent, LangSelectComponent, RouterLink, TranslatePipe],
  templateUrl: './roadmap.component.html',
  styleUrl: './roadmap.component.css',
})
export class RoadmapComponent implements OnInit, AfterViewInit {
  private readonly api = inject(Api);
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly tour = inject(TourService);
  private readonly i18n = inject(I18nService);

  private t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.translate(key, params);
  }

  /** Localized "Phase 03" label (recomputed on language change via template binding). */
  phaseNum(index: number): string {
    return this.t('rm.phase') + ' ' + String(index + 1).padStart(2, '0');
  }

  /** Localized "N weeks" duration. */
  durationText(weeks: number): string {
    return weeks + ' ' + this.t(weeks === 1 ? 'rm.week' : 'rm.weeks');
  }

  /** Open today's learning session (keyboard activation for the current node). */
  goToSession(): void {
    this.router.navigateByUrl('/learning/current');
  }

  /**
   * Mark the current phase complete. The backend persists the new phase statuses
   * (this phase → completed, the next → current, the one after → available) and
   * returns the updated roadmap, which we re-render while keeping the current page.
   */
  completePhase(index: number): void {
    if (this.completing()) {
      return;
    }
    this.completing.set(true);
    this.api.completePhase(index).subscribe({
      next: (r) => {
        const currentPage = this.page();
        this.build(r);
        this.page.set(Math.min(currentPage, this.pageCount() - 1));
        this.completing.set(false);
      },
      error: () => this.completing.set(false),
    });
  }

  readonly loading = signal(true);
  readonly hasRoadmap = signal(false);
  readonly revealed = signal(false);
  readonly scrolled = signal(false);
  readonly completing = signal(false);

  readonly name = signal(this.session.name() ?? this.t('rm.there'));
  readonly goal = signal(this.t('rm.yourGoal'));
  readonly level = signal('');
  readonly phases = signal<PhaseVM[]>([]);

  readonly totalPhases = signal(0);
  readonly totalWeeks = signal(0);
  readonly totalObjectives = signal(0);

  // Pagination — show up to 5 nodes per page.
  readonly pageSize = 5;
  readonly page = signal(0);
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.phases().length / this.pageSize)));
  readonly showPager = computed(() => this.phases().length > this.pageSize);
  readonly visiblePhases = computed(() => {
    const start = this.page() * this.pageSize;
    return this.phases().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.api.roadmap().subscribe({
      next: (r) => {
        this.build(r);
        this.hasRoadmap.set(true);
        this.loading.set(false);
        // First-run tour, once, for a freshly-registered user (after the DOM settles).
        setTimeout(() => this.tour.maybeStart(ROADMAP_TOUR), 600);
      },
      error: () => {
        this.hasRoadmap.set(false);
        this.loading.set(false);
      },
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.revealed.set(true), 80);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  prev(): void {
    this.page.update((p) => Math.max(0, p - 1));
  }

  next(): void {
    this.page.update((p) => Math.min(this.pageCount() - 1, p + 1));
  }

  private build(r: RoadmapResponse): void {
    this.goal.set(r?.goal ?? this.t('rm.yourGoal'));
    this.level.set(r?.level ?? '');
    const phases: RoadmapPhase[] = Array.isArray(r?.phases) ? r.phases : [];
    const allowed = ['COMPLETED', 'CURRENT', 'AVAILABLE', 'LOCKED'];

    const vms: PhaseVM[] = phases.map((p, i) => {
      const objectives: string[] = Array.isArray(p?.objectives) ? p.objectives : [];
      const raw = (p?.status ?? '').toString().toUpperCase();
      const phaseStatus = allowed.includes(raw)
        ? raw
        : i === 0 ? 'CURRENT' : i === 1 ? 'AVAILABLE' : 'LOCKED';
      const status: NodeStatus =
        phaseStatus === 'COMPLETED' ? 'done'
        : phaseStatus === 'CURRENT' ? 'current'
        : phaseStatus === 'AVAILABLE' ? 'avail'
        : 'locked';
      const progress = status === 'done' ? 100 : 0;
      const weeks = p?.durationWeeks ?? 0;
      return {
        index: i,
        name: p?.name ?? this.t('rm.phase') + ' ' + (i + 1),
        description: p?.description ?? '',
        weeks,
        status,
        skills: objectives.slice(0, 4),
        objectives,
        progress,
        ringOffset: 301.6 * (1 - progress / 100),
        side: i % 2 === 0 ? 'right' : 'left',
      };
    });

    this.phases.set(vms);
    this.page.set(0);
    this.totalPhases.set(vms.length);
    this.totalWeeks.set(phases.reduce((s, p) => s + (p?.durationWeeks ?? 0), 0));
    this.totalObjectives.set(vms.reduce((s, p) => s + p.objectives.length, 0));
  }
}
