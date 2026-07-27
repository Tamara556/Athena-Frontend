export interface InterviewLevel {
  id: number;
  label: string;
  level: string;
  durationLabel: string;
  questionsLabel: string;
}

export interface NextInterview {
  interviewId: string | null;
  title: string;
  domain: string;
  level: string;
  upNextLabel: string;
  scheduledLabel: string;
  durationLabel: string;
  formatLabel: string;
  purpose: string;
}

export interface ConfidencePoint {
  x: number;
  score: number;
  color: string;
  label: string;
}

export interface ConfidenceTrend {
  points: ConfidencePoint[];
}

export interface ReadinessSegment {
  text: string;
  bold: boolean;
}

export interface Readiness {
  tag: string;
  headline: string;
  segments: ReadinessSegment[];
  gaugeLabel: string;
  gaugePercent: number;
}

export type DiscoveryKind = 'good' | 'grow';

export interface Discovery {
  kind: DiscoveryKind;
  text: string;
}

export type ResultKind = 'adapt' | 'unlock';

export interface TalkCard {
  id: string;
  title: string;
  score: number;
  whenLabel: string;
  statusLabel: string;
  discoveries: Discovery[];
  resultKind: ResultKind;
  resultLabel: string;
}

export interface Observation {
  icon: string;
  gradient: string;
  before: string;
  bold: string;
  after: string;
  tag: string;
}

export interface ReviewTopic {
  id: string;
  icon: string;
  gradient: string;
  title: string;
  note: string;
}

export interface Tip {
  before: string;
  bold: string;
  after: string;
}

export interface ImpactItem {
  icon: string;
  gradient: string;
  title: string;
  text: string;
}

export interface StartedQuestion {
  id: string;
  type: string;
  question: string;
}

export interface StartedInterview {
  id: string;
  domain: string;
  level: string;
  status: string;
  questions: StartedQuestion[];
}

export interface InterviewResult {
  id: string;
  interviewId: string;
  score: number;
  passed: boolean;
  weaknesses: string[];
  recommendations: string[];
}

export interface AnswerInput {
  questionId: string;
  answer: string;
}
