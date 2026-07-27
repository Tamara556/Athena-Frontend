import { KnowledgeEdge } from './knowledge-graph.models';

interface RawNode {
  id: string;
  mastery: number;
}

interface Placement {
  x: number;
  y: number;
  size: number;
}

const MIN_SIZE = 46;
const MAX_SIZE = 64;
const RADIUS_X = 38;
const RADIUS_Y = 34;

export function computeLayout(nodes: readonly RawNode[], edges: readonly KnowledgeEdge[]): Map<string, Placement> {
  const degree = new Map<string, number>();
  for (const node of nodes) {
    degree.set(node.id, 0);
  }
  for (const edge of edges) {
    degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1);
    degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1);
  }

  const ranked = [...nodes].sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0));
  const placements = new Map<string, Placement>();
  const maxDegree = Math.max(1, ...ranked.map((node) => degree.get(node.id) ?? 0));

  ranked.forEach((node, index) => {
    const angle = (index / ranked.length) * Math.PI * 2 + hash(node.id);
    const pull = 1 - (degree.get(node.id) ?? 0) / maxDegree;
    placements.set(node.id, {
      x: clamp(50 + Math.cos(angle) * RADIUS_X * pull, 12, 92),
      y: clamp(50 + Math.sin(angle) * RADIUS_Y * pull, 15, 88),
      size: Math.round(MIN_SIZE + (MAX_SIZE - MIN_SIZE) * (node.mastery / 100)),
    });
  });

  return placements;
}

function hash(id: string): number {
  let value = 0;
  for (let i = 0; i < id.length; i++) {
    value = (value * 31 + id.charCodeAt(i)) % 360;
  }
  return (value / 360) * Math.PI * 2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
