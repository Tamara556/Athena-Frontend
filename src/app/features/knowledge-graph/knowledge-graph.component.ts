import { Component, ElementRef, HostListener, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';
import { LangSelectComponent } from '../../shared/lang-select/lang-select.component';
import { KnowledgeGraphStore } from './knowledge-graph.store';
import {
  edgeKey,
  evolutionDots,
  exploreIcon,
  mentorGradient,
  mentorIcon,
  mentorTag,
  seriesPoints,
  statusClass,
  statusLabel,
  whyGradient,
  whyIcon,
} from './knowledge-graph.logic';
import { EvolutionSeries, KnowledgeEdge, MentorInsightKind, RecommendationCard } from './knowledge-graph.models';
import { I18nService } from '../../core/i18n';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-knowledge-graph',
  standalone: true,
  imports: [SidebarComponent, ThemeToggleComponent, LangSelectComponent, TranslatePipe],
  templateUrl: './knowledge-graph.component.html',
})
export class KnowledgeGraphComponent implements OnInit {
  private readonly sidebar = viewChild(SidebarComponent);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly store = inject(KnowledgeGraphStore);
  private readonly i18n = inject(I18nService);

  readonly scrolled = signal(false);

  readonly ready = this.store.ready;
  readonly nodes = this.store.nodes;
  readonly edges = this.store.edges;
  readonly focusMode = this.store.focusMode;
  readonly swapping = this.store.swapping;
  readonly selectedNode = this.store.selectedNode;
  readonly connectedSkills = this.store.connectedSkills;
  readonly exploration = this.store.exploration;
  readonly mentorInsights = this.store.mentorInsights;
  readonly whyItMatters = this.store.whyItMatters;
  readonly opportunities = this.store.opportunities;
  readonly accelerators = this.store.accelerators;
  readonly evolution = this.store.evolution;
  readonly actionPending = this.store.actionPending;

  readonly evolutionDots = computed(() => {
    const view = this.evolution();
    return view ? evolutionDots(view) : [];
  });

  constructor() {
    effect(() => {
      if (this.ready()) {
        setTimeout(() => this.revealAll(), 40);
      }
    });
    effect(() => {
      if (this.evolution()) {
        setTimeout(() => document.querySelectorAll('.kg-root .evo').forEach((el) => el.classList.add('in')), 60);
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

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchInput()?.nativeElement.focus();
    }
  }

  onSearch(event: Event): void {
    this.store.search((event.target as HTMLInputElement).value);
  }

  select(nodeId: string): void {
    this.store.select(nodeId);
  }

  selectSkill(title: string): void {
    const match = this.nodes().find((node) => node.title === title);
    if (match) {
      this.store.select(match.id);
    }
  }

  edgePath(edge: KnowledgeEdge): string {
    const nodes = this.nodes();
    const source = nodes.find((node) => node.id === edge.source);
    const target = nodes.find((node) => node.id === edge.target);
    if (!source || !target) {
      return '';
    }
    return `M${vx(source.x)} ${vy(source.y)} L${vx(target.x)} ${vy(target.y)}`;
  }

  legendColor(series: EvolutionSeries): string {
    return series.legend;
  }

  apply(card: RecommendationCard): void {
    this.store.apply(card);
  }

  nodeClass(status: string): string {
    return statusClass(status);
  }

  statusName(status: string): string {
    const key = 'kg.status.' + status.toLowerCase();
    const translated = this.i18n.translate(key);
    return translated === key ? statusLabel(status) : translated;
  }

  exploreIcon(status: string): string {
    return exploreIcon(status);
  }

  isSelected(nodeId: string): boolean {
    return this.store.isSelected(nodeId);
  }

  isNear(nodeId: string): boolean {
    return this.store.isNear(nodeId);
  }

  isEdgeHighlighted(edge: KnowledgeEdge): boolean {
    return this.store.isEdgeHighlighted(edge);
  }

  trackEdge(_index: number, edge: KnowledgeEdge): string {
    return edgeKey(edge);
  }

  points(series: EvolutionSeries): string {
    const view = this.evolution();
    return view ? seriesPoints(series, view.xPositions) : '';
  }

  mentorIcon(kind: MentorInsightKind): string {
    return mentorIcon(kind);
  }

  mentorGradient(kind: MentorInsightKind): string {
    return mentorGradient(kind);
  }

  mentorTag(kind: MentorInsightKind): string {
    const key = 'kg.mentor.' + kind;
    const translated = this.i18n.translate(key);
    return translated === key ? mentorTag(kind) : translated;
  }

  whyIcon(index: number): string {
    return whyIcon(index);
  }

  whyGradient(index: number): string {
    return whyGradient(index);
  }

  private revealAll(): void {
    document.querySelectorAll('.kg-root .reveal').forEach((el) => el.classList.add('in'));
  }
}

function vx(percent: number): number {
  return Math.round(percent * 10);
}

function vy(percent: number): number {
  return Math.round(percent * 6.8);
}
