import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { API_BASE } from '../../core/api';
import { computeLayout } from './knowledge-graph.layout';
import { statusClass } from './knowledge-graph.logic';
import {
  EvolutionView,
  KnowledgeEdge,
  KnowledgeGraphView,
  KnowledgeNode,
  RecommendationAction,
  RecommendationCard,
} from './knowledge-graph.models';

interface VisualizationResponse {
  domain: string;
  generatedAt: string;
  nodes: { id: string; label: string; mastery: number; confidence: number; status: string; category: string }[];
  edges: { source: string; target: string; relationship: string }[];
  summary: { strongestSkills: string[]; weakestSkills: string[]; averageMastery: number; totalSkills: number };
  insights: string[];
}

const VIEWBOX_X = 10;
const VIEWBOX_Y = 6.8;

@Injectable({ providedIn: 'root' })
export class KnowledgeGraphApi {
  private readonly http = inject(HttpClient);

  getVisualization(): Observable<KnowledgeGraphView | null> {
    return this.http.get<VisualizationResponse>(`${API_BASE}/ai/knowledge-graph/me/visualization`).pipe(
      map(toView),
      catchError(() => of(null)),
    );
  }

  getEvolution(): Observable<EvolutionView | null> {
    return of(null);
  }

  getOpportunities(): Observable<RecommendationCard[]> {
    return of([]);
  }

  getAccelerators(): Observable<RecommendationCard[]> {
    return of([]);
  }

  applyRecommendation(_action: RecommendationAction, _targetSkill: string): Observable<void> {
    return of(void 0);
  }
}

function toView(response: VisualizationResponse): KnowledgeGraphView {
  const layoutEdges: KnowledgeEdge[] = response.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
    relationship: edge.relationship,
    labelX: 0,
    labelY: 0,
  }));
  const layout = computeLayout(response.nodes.map((node) => ({ id: node.id, mastery: node.mastery })), layoutEdges);

  const nodes: KnowledgeNode[] = response.nodes.map((node) => {
    const placement = layout.get(node.id) ?? { x: 50, y: 50, size: 50 };
    return {
      id: node.id,
      title: node.label,
      category: node.category,
      status: node.status,
      mastery: node.mastery,
      confidence: node.confidence,
      generatedByAI: true,
      lastUpdated: response.generatedAt,
      x: placement.x,
      y: placement.y,
      size: placement.size,
    };
  });

  const positionById = new Map(nodes.map((node) => [node.id, { x: node.x, y: node.y }]));
  const edges: KnowledgeEdge[] = response.edges.map((edge) => {
    const source = positionById.get(edge.source);
    const target = positionById.get(edge.target);
    return {
      source: edge.source,
      target: edge.target,
      relationship: edge.relationship,
      labelX: source && target ? Math.round(((source.x + target.x) / 2) * VIEWBOX_X) : 0,
      labelY: source && target ? Math.round(((source.y + target.y) / 2) * VIEWBOX_Y) : 0,
    };
  });

  const defaultNode = nodes.find((node) => statusClass(node.status) === 'l') ?? nodes[0];
  return {
    domain: response.domain,
    generatedAt: response.generatedAt,
    defaultNodeId: defaultNode?.id ?? '',
    nodes,
    edges,
    summary: response.summary,
    insights: response.insights ?? [],
  };
}
