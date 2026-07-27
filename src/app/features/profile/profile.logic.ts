import { AthenaInsight, Milestone, ProfileIdentity } from './profile.models';

const AVAILABILITY_LABELS: Record<string, string> = {
  '30m': '30 minutes daily',
  '1h': '1 hour daily',
  '2h': '2 hours daily',
  '4h': '4+ hours daily',
};

const STYLE_BULLETS: Record<string, readonly string[]> = {
  practical: ['Practical exercises', 'Step-by-step progression', 'Visual explanations'],
  visual: ['Visual explanations', 'Diagrams and mental models', 'Worked examples'],
  reading: ['In-depth reading', 'Structured notes', 'First-principles reasoning'],
  mixed: ['A blend of practice and theory', 'Step-by-step progression', 'Visual explanations'],
};

const INSIGHT_ICONS: Record<string, string> = {
  strength: '✓',
  approach: '⚡',
  growth: '↑',
};

const FALLBACK_INSIGHT_ICON = '✦';
const MONTH_YEAR = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

export function fullName(identity: ProfileIdentity): string {
  return `${identity.firstName} ${identity.lastName}`.trim();
}

export function initials(firstName: string, lastName: string): string {
  const letters = [firstName, lastName]
    .map((part) => part.trim()[0] ?? '')
    .join('');
  return letters.toUpperCase() || '·';
}

export function formatMonthYear(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : MONTH_YEAR.format(date);
}

export function availabilityLabel(value: string): string {
  return AVAILABILITY_LABELS[value] ?? `${value} daily`;
}

export function difficultyLabel(value: string): string {
  return capitalize(value);
}

export function styleBullets(style: string): readonly string[] {
  return STYLE_BULLETS[style] ?? STYLE_BULLETS['practical'];
}

export function insightIcon(kind: string): string {
  return INSIGHT_ICONS[kind] ?? FALLBACK_INSIGHT_ICON;
}

export function emphasize(insight: AthenaInsight): { before: string; bold: string; after: string } {
  const index = insight.emphasis ? insight.text.indexOf(insight.emphasis) : -1;
  if (index < 0) {
    return { before: insight.text, bold: '', after: '' };
  }
  return {
    before: insight.text.slice(0, index),
    bold: insight.emphasis,
    after: insight.text.slice(index + insight.emphasis.length),
  };
}

export function sortMilestones(milestones: readonly Milestone[]): Milestone[] {
  return [...milestones].sort((a, b) => new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime());
}

export function hasMeaningfulActivity(milestones: readonly Milestone[], insights: readonly AthenaInsight[]): boolean {
  return milestones.length > 0 || insights.length > 0;
}

function capitalize(value: string): string {
  return value ? value[0].toUpperCase() + value.slice(1) : value;
}
