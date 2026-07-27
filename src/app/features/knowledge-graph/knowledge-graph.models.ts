export type KnowledgeStatusClass = 'm' | 'l' | 'w';

export interface KnowledgeNode {
  id: string;
  title: string;
  category: string;
  status: string;
  mastery: number;
  confidence: number;
  generatedByAI: boolean;
  lastUpdated: string;
  x: number;
  y: number;
  size: number;
}

export interface KnowledgeEdge {
  source: string;
  target: string;
  relationship: string;
  labelX: number;
  labelY: number;
}

export interface GraphSummary {
  strongestSkills: string[];
  weakestSkills: string[];
  averageMastery: number;
  totalSkills: number;
}

export interface KnowledgeGraphView {
  domain: string;
  generatedAt: string;
  defaultNodeId: string;
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  summary: GraphSummary;
  insights: string[];
}

export interface InterviewSignal {
  checkpoint: string;
  note: string;
}

export interface NodeExploration {
  nodeId: string;
  whyThisLevel: string;
  interviewSignal: InterviewSignal | null;
  recommendedNext: string[];
  recentMovementLabel: string | null;
}

export type MentorInsightKind = 'anchor' | 'opportunity' | 'multiplier';

export interface MentorInsight {
  kind: MentorInsightKind;
  skill: string;
  before: string;
  after: string;
}

export interface WhyItMatters {
  before: string;
  bold: string;
  after: string;
}

export type RecommendationAction = 'refresher' | 'strengthen' | 'plan';

export interface RecommendationCard {
  id: string;
  icon: string;
  gradient: string;
  title: string;
  meta: string;
  before: string;
  bold: string;
  after: string;
  impact: string;
  actionLabel: string;
  actionVariant: 'glass' | 'primary';
  action: RecommendationAction;
  targetSkill: string;
}

export interface EvolutionSeries {
  label: string;
  stroke: string;
  legend: string;
  delaySeconds: number;
  weekly: number[];
  primary: boolean;
  dotColors: string[];
}

export interface EvolutionView {
  headlineSkill: string;
  fromMastery: number;
  toMastery: number;
  gainLabel: string;
  xPositions: number[];
  series: EvolutionSeries[];
}
