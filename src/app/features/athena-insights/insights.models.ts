export type SegmentKind = 'normal' | 'highlight' | 'soft' | 'bold';

export interface InsightSegment {
  text: string;
  kind: SegmentKind;
}

export interface LetterParagraph {
  lead: boolean;
  segments: InsightSegment[];
}

export interface AthenaLetter {
  eyebrow: string;
  salutation: boolean;
  title: string;
  dateLabel: string | null;
  paragraphs: LetterParagraph[];
  signTagline: string;
}

export interface LearningItem {
  emoji: string;
  text: string;
}

export interface LearningStyle {
  best: LearningItem[];
  harder: LearningItem[];
}

export interface Pattern {
  emoji: string;
  text: string;
}

export interface Strength {
  icon: string;
  gradient: string;
  title: string;
  text: string;
}

export interface Exploration {
  emoji: string;
  segments: InsightSegment[];
}

export interface Evolution {
  segments: InsightSegment[];
}

export interface Potential {
  icon: string;
  gradient: string;
  title: string;
  text: string;
}

export interface InsightsProfile {
  generatedAt: string;
  letter: AthenaLetter;
  learningStyle: LearningStyle;
  patterns: Pattern[];
  strengths: Strength[];
  explorations: Exploration[];
  evolution: Evolution;
  potential: Potential[];
  futureLetter: AthenaLetter;
}
