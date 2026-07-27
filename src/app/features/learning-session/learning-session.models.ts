export type SessionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type PracticeType =
  | 'CODE_EDITOR'
  | 'LANGUAGE_EXERCISE'
  | 'SCENARIO'
  | 'CREATIVE_PROMPT'
  | 'REFLECTION';

export type QuizType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

export interface ReadingMaterial {
  id: string;
  title: string;
  content: string;
  estimatedMinutes: number;
  orderIndex: number;
}

export interface WatchingMaterial {
  id: string;
  title: string;
  description: string;
  videoQuery: string;
  /** Real YouTube video id for in-site embedding; may be blank — then videoQuery is used. */
  videoId?: string | null;
  estimatedMinutes: number;
  orderIndex: number;
}

export interface PracticeActivity {
  id: string;
  title: string;
  description: string;
  practiceType: PracticeType;
  instructions: string;
  starterContent: string;
  estimatedMinutes: number;
  orderIndex: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: QuizType;
  options: string[];
  correctAnswer: string;
  explanation: string;
  orderIndex: number;
}

export interface LearningSession {
  id: string;
  roadmapId: string;
  roadmapNodeId: string;
  nodeIndex: number;
  title: string;
  status: SessionStatus;
  estimatedMinutes: number;
  generatedAt: string;
  updatedAt: string;
  readings: ReadingMaterial[];
  watchings: WatchingMaterial[];
  practices: PracticeActivity[];
  quizzes: QuizQuestion[];
}

export interface LearningSessionSummary {
  id: string;
  roadmapNodeId: string;
  nodeIndex: number;
  title: string;
  status: SessionStatus;
  estimatedMinutes: number;
}
