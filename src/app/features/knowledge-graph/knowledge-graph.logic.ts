import {
  EvolutionSeries,
  EvolutionView,
  GraphSummary,
  KnowledgeEdge,
  KnowledgeNode,
  KnowledgeStatusClass,
  MentorInsight,
  MentorInsightKind,
  WhyItMatters,
} from './knowledge-graph.models';

const STATUS_CLASS: Record<string, KnowledgeStatusClass> = {
  mastered: 'm',
  learning: 'l',
  practicing: 'l',
  improving: 'l',
  growing: 'w',
  needs_review: 'w',
  forgotten: 'w',
  not_started: 'w',
};

const MENTOR_ICONS: Record<MentorInsightKind, string> = {
  anchor: '🟢',
  opportunity: '🌱',
  multiplier: '⚡',
};

const MENTOR_GRADIENTS: Record<MentorInsightKind, string> = {
  anchor: 'linear-gradient(135deg,#34D399,#22D3EE)',
  opportunity: 'linear-gradient(135deg,#FBBF24,#FB923C)',
  multiplier: 'linear-gradient(135deg,#8B5CF6,#F472B6)',
};

const MENTOR_TAGS: Record<MentorInsightKind, string> = {
  anchor: 'Your anchor',
  opportunity: 'Biggest opportunity',
  multiplier: 'Quiet multiplier',
};

const EXPLORE_ICONS: Record<KnowledgeStatusClass, string> = {
  m: '✓',
  l: '⚡',
  w: '↗',
};

const WHY_ACCENTS: readonly { icon: string; gradient: string }[] = [
  { icon: '✓', gradient: 'linear-gradient(135deg,#34D399,#22D3EE)' },
  { icon: '↑', gradient: 'linear-gradient(135deg,#8B5CF6,#A855F7)' },
  { icon: '★', gradient: 'linear-gradient(135deg,#F472B6,#A855F7)' },
];

const CHART_TOP = 40;
const CHART_BOTTOM = 220;

export function statusClass(status: string): KnowledgeStatusClass {
  return STATUS_CLASS[status.toLowerCase()] ?? 'w';
}

export function statusLabel(status: string): string {
  return status
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

export function exploreIcon(status: string): string {
  return EXPLORE_ICONS[statusClass(status)];
}

export function mentorIcon(kind: MentorInsightKind): string {
  return MENTOR_ICONS[kind];
}

export function mentorGradient(kind: MentorInsightKind): string {
  return MENTOR_GRADIENTS[kind];
}

export function mentorTag(kind: MentorInsightKind): string {
  return MENTOR_TAGS[kind];
}

export function whyIcon(index: number): string {
  return WHY_ACCENTS[index % WHY_ACCENTS.length].icon;
}

export function whyGradient(index: number): string {
  return WHY_ACCENTS[index % WHY_ACCENTS.length].gradient;
}

export function edgeKey(edge: KnowledgeEdge): string {
  return `${edge.source}__${edge.target}`;
}

export function neighborIds(edges: readonly KnowledgeEdge[], nodeId: string | null): string[] {
  if (!nodeId) {
    return [];
  }
  const ids: string[] = [];
  for (const edge of edges) {
    if (edge.source === nodeId && !ids.includes(edge.target)) {
      ids.push(edge.target);
    } else if (edge.target === nodeId && !ids.includes(edge.source)) {
      ids.push(edge.source);
    }
  }
  return ids;
}

export function isEdgeConnected(edge: KnowledgeEdge, nodeId: string | null): boolean {
  return nodeId != null && (edge.source === nodeId || edge.target === nodeId);
}

export function connectedTitles(
  nodes: readonly KnowledgeNode[],
  edges: readonly KnowledgeEdge[],
  nodeId: string | null,
): string[] {
  const byId = new Map(nodes.map((node) => [node.id, node.title]));
  return neighborIds(edges, nodeId)
    .map((id) => byId.get(id))
    .filter((title): title is string => title != null);
}

export function matchesQuery(node: KnowledgeNode, query: string): boolean {
  return node.title.toLowerCase().includes(query.trim().toLowerCase());
}

export function findMatch(nodes: readonly KnowledgeNode[], query: string): KnowledgeNode | null {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }
  return nodes.find((node) => matchesQuery(node, trimmed)) ?? null;
}

export function deriveMentorInsights(summary: GraphSummary | null): MentorInsight[] {
  if (!summary) {
    return [];
  }
  const anchor = summary.strongestSkills[0];
  const opportunity = summary.weakestSkills[0];
  const multiplier = summary.strongestSkills[1] ?? summary.weakestSkills[1];
  const insights: MentorInsight[] = [];
  if (anchor) {
    insights.push({ kind: 'anchor', skill: anchor, before: 'Your strongest area is ', after: ' — it quietly holds up everything you’ve built above it.' });
  }
  if (opportunity && opportunity !== anchor) {
    insights.push({ kind: 'opportunity', skill: opportunity, before: '', after: ' is your largest room to grow right now — a little focus here pays off across the whole map.' });
  }
  if (multiplier && multiplier !== anchor && multiplier !== opportunity) {
    insights.push({ kind: 'multiplier', skill: multiplier, before: 'Lifting ', after: ' could noticeably speed up everything that builds on it — an easy, high-leverage win.' });
  }
  return insights;
}

export function deriveWhyItMatters(insights: readonly string[]): WhyItMatters[] {
  return insights.slice(0, 3).map((text) => ({ before: text, bold: '', after: '' }));
}

export function chartY(mastery: number): number {
  return CHART_BOTTOM - (mastery / 100) * (CHART_BOTTOM - CHART_TOP);
}

export function seriesPoints(series: EvolutionSeries, xPositions: readonly number[]): string {
  return series.weekly
    .map((mastery, index) => `${xPositions[index]},${round(chartY(mastery))}`)
    .join(' ');
}

export function evolutionDots(view: EvolutionView): { cx: number; cy: number; r: number; fill: string }[] {
  const dots: { cx: number; cy: number; r: number; fill: string }[] = [];
  for (const series of view.series) {
    if (series.primary) {
      series.weekly.forEach((mastery, index) => {
        dots.push({
          cx: view.xPositions[index],
          cy: round(chartY(mastery)),
          r: index >= 2 ? 6 : 5,
          fill: series.dotColors[index] ?? series.stroke,
        });
      });
    } else {
      const last = series.weekly.length - 1;
      dots.push({
        cx: view.xPositions[last],
        cy: round(chartY(series.weekly[last])),
        r: 5,
        fill: series.stroke,
      });
    }
  }
  return dots;
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
