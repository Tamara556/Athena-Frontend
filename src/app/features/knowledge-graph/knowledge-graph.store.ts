import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KnowledgeGraphApi } from './knowledge-graph.api';
import { connectedTitles, deriveMentorInsights, deriveWhyItMatters, findMatch, neighborIds } from './knowledge-graph.logic';
import { KnowledgeEdge, NodeExploration, RecommendationCard } from './knowledge-graph.models';

const SWAP_MS = 200;

@Injectable({ providedIn: 'root' })
export class KnowledgeGraphStore {
  private readonly api = inject(KnowledgeGraphApi);

  private readonly view = toSignal(this.api.getVisualization(), { initialValue: null });
  private readonly selection = signal<string | null>(null);

  readonly evolution = toSignal(this.api.getEvolution(), { initialValue: null });
  readonly opportunities = toSignal(this.api.getOpportunities(), { initialValue: [] });
  readonly accelerators = toSignal(this.api.getAccelerators(), { initialValue: [] });

  readonly query = signal('');
  readonly swapping = signal(false);
  readonly actionPending = signal<string | null>(null);

  readonly ready = computed(() => this.view() !== null);
  readonly domain = computed(() => this.view()?.domain ?? '');
  readonly nodes = computed(() => this.view()?.nodes ?? []);
  readonly edges = computed(() => this.view()?.edges ?? []);
  readonly summary = computed(() => this.view()?.summary ?? null);

  readonly mentorInsights = computed(() => deriveMentorInsights(this.summary()));
  readonly whyItMatters = computed(() => deriveWhyItMatters(this.view()?.insights ?? []));

  readonly selectedId = computed(() => this.selection() ?? this.view()?.defaultNodeId ?? null);
  readonly selectedNode = computed(() => {
    const id = this.selectedId();
    return id ? this.nodes().find((node) => node.id === id) ?? null : null;
  });
  readonly neighborIds = computed(() => neighborIds(this.edges(), this.selectedId()));
  readonly connectedSkills = computed(() => connectedTitles(this.nodes(), this.edges(), this.selectedId()));
  readonly focusMode = computed(() => this.selectedId() !== null);
  readonly exploration = computed<NodeExploration | null>(() => null);

  isSelected(nodeId: string): boolean {
    return this.selectedId() === nodeId;
  }

  isNear(nodeId: string): boolean {
    return this.neighborIds().includes(nodeId);
  }

  isEdgeHighlighted(edge: KnowledgeEdge): boolean {
    const id = this.selectedId();
    return id != null && (edge.source === id || edge.target === id);
  }

  select(nodeId: string): void {
    if (this.selectedId() === nodeId) {
      return;
    }
    this.swapping.set(true);
    setTimeout(() => {
      this.selection.set(nodeId);
      this.swapping.set(false);
    }, SWAP_MS);
  }

  search(value: string): void {
    this.query.set(value);
    const match = findMatch(this.nodes(), value);
    if (match) {
      this.select(match.id);
    }
  }

  apply(card: RecommendationCard): void {
    if (this.actionPending()) {
      return;
    }
    this.actionPending.set(card.id);
    this.api.applyRecommendation(card.action, card.targetSkill).subscribe({
      next: () => this.actionPending.set(null),
      error: () => this.actionPending.set(null),
    });
  }
}
