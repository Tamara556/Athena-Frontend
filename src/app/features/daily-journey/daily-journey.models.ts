export type DayStatus = 'FORMING' | 'READY' | 'IN_PROGRESS' | 'COMPLETED' | 'REFLECTED';
export type BlockStatus = 'UPCOMING' | 'CURRENT' | 'COMPLETED' | 'SKIPPED';
export type BlockType = 'READING' | 'PRACTICE' | 'VIDEO' | 'QUIZ' | 'SPEAKING' | 'REVIEW' | 'DRILL';
export type Difficulty = 'EASY' | 'MODERATE' | 'CHALLENGING';
export type Confidence = 'CONFIDENT' | 'UNSURE' | 'NEED_HELP';
export type AdjustAction = 'SIMPLIFY' | 'INTENSIFY' | 'REGENERATE';

export interface MissionView {
  title: string;
  description: string;
  goalContext: string | null;
  difficulty: Difficulty;
  availableMinutes: number;
  estimatedMinutes: number;
  status: DayStatus;
}

export interface ProgressView {
  completed: number;
  total: number;
}

export interface BlockView {
  id: string;
  orderIndex: number;
  type: BlockType;
  title: string;
  description: string | null;
  difficulty: Difficulty;
  durationMinutes: number;
  status: BlockStatus;
  progressPercent: number;
  priorityInsert: boolean;
  sourceRef: string | null;
  knowledgeNodeId: string | null;
  skipReason: string | null;
}

export interface AdjustmentView {
  id: string;
  type: 'ADD' | 'REVIEW' | 'SIMPLIFY' | 'TRIM' | 'REGENERATE';
  reason: string;
  affectedBlockId: string | null;
  createdAt: string;
}

export interface WeaknessView {
  knowledgeNodeId: string;
  skillName: string;
  domain: string | null;
  masteryPercentage: number;
  source: string;
  inMission: boolean;
}

export interface CheckinView {
  confidence: Confidence;
  reply: string;
  createdAt: string;
}

export interface ReflectionView {
  present: boolean;
  skipped: boolean;
  hardestPart: string | null;
  whatClicked: string | null;
  adjustRequest: string | null;
}

export interface DailyJourney {
  missionId: string;
  date: string;
  learningSessionId: string | null;
  mission: MissionView;
  progress: ProgressView;
  blocks: BlockView[];
  adjustments: AdjustmentView[];
  weaknesses: WeaknessView[];
  lastCheckin: CheckinView | null;
  reflection: ReflectionView;
}

export interface ReasoningEvent {
  icon: string;
  label: string;
  text: string;
}

export interface WhyReasoning {
  events: ReasoningEvent[];
  conclusion: string;
}
