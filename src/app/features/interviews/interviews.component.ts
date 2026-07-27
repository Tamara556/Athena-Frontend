import { Component, HostListener, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';
import { LangSelectComponent } from '../../shared/lang-select/lang-select.component';
import { InterviewsStore } from './interviews.store';
import {
  confidenceAreaPath,
  confidenceDots,
  confidencePointsAttr,
  resultIconPath,
  ringDashoffset,
} from './interviews.logic';
import { InterviewLevel, NextInterview, TalkCard } from './interviews.models';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [SidebarComponent, ThemeToggleComponent, LangSelectComponent, TranslatePipe],
  templateUrl: './interviews.component.html',
})
export class InterviewsComponent implements OnInit {
  private readonly sidebar = viewChild(SidebarComponent);
  private readonly store = inject(InterviewsStore);
  private readonly router = inject(Router);

  readonly scrolled = signal(false);
  readonly openTalks = signal<ReadonlySet<string>>(new Set());

  readonly loaded = this.store.loaded;
  readonly nextInterview = this.store.nextInterview;
  readonly confidence = this.store.confidence;
  readonly readiness = this.store.readiness;
  readonly history = this.store.history;
  readonly observations = this.store.observations;
  readonly reviewTopics = this.store.reviewTopics;
  readonly tips = this.store.tips;
  readonly impacts = this.store.impacts;
  readonly levels = this.store.levels;
  readonly mockSel = this.store.mockSel;
  readonly starting = this.store.starting;
  readonly gain = this.store.gain;
  readonly selectedLevel = this.store.selectedLevel;

  readonly confidencePoints = computed(() => {
    const trend = this.confidence();
    return trend ? confidencePointsAttr(trend) : '';
  });
  readonly confidenceArea = computed(() => {
    const trend = this.confidence();
    return trend ? confidenceAreaPath(trend) : '';
  });
  readonly confidenceDots = computed(() => {
    const trend = this.confidence();
    return trend ? confidenceDots(trend) : [];
  });

  constructor() {
    effect(() => {
      if (this.confidence()) {
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

  isTalkOpen(id: string): boolean {
    return this.openTalks().has(id);
  }

  toggleTalk(id: string): void {
    const next = new Set(this.openTalks());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.openTalks.set(next);
  }

  ringOffset(score: number): number {
    return ringDashoffset(score, this.loaded());
  }

  resultPath(kind: TalkCard['resultKind']): string {
    return resultIconPath(kind);
  }

  pickMock(id: number): void {
    this.store.pickMock(id);
  }

  startScheduled(next: NextInterview): void {
    this.store.start(next.domain, next.level, 'scheduled');
  }

  startMock(level: InterviewLevel): void {
    this.store.start(this.nextInterview()?.domain ?? level.label, level.level, 'mock');
  }

  review(): void {
    this.router.navigate(['/knowledge-graph']);
  }

  private revealAll(): void {
    document.querySelectorAll('.iv-root .reveal').forEach((el) => el.classList.add('in'));
  }
}
