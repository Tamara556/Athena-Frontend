export interface MetricSide {
  display: string;
  percent: number | null;
}

export interface TransformRow {
  caption: string;
  then: MetricSide;
  now: MetricSide;
}

export interface TransformView {
  startLabel: string;
  nowLabel: string;
  rows: TransformRow[];
}

export interface GrowthHighlight {
  name: string;
  gainPercent: number;
  trackPercent: number;
  lead: string | null;
}

export interface ConfidenceQuote {
  when: string;
  color: string;
  quote: string;
  isLast: boolean;
}

export interface Observation {
  icon: string;
  gradient: string;
  before: string;
  bold: string;
  after: string;
}

export interface Milestone {
  icon: string;
  gradient: string;
  title: string;
  dateLabel: string;
}

export interface FuturePrediction {
  icon: string;
  gradient: string;
  before: string;
  bold: string;
  after: string;
}

export interface ReflectionPrompt {
  label: string;
  placeholder: string;
}

export interface Reflection {
  prompt: string;
  text: string;
  savedAt: string;
}
