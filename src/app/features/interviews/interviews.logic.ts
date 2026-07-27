import { ConfidencePoint, ConfidenceTrend, ResultKind } from './interviews.models';

const RING_CIRCUMFERENCE = 151;
const CHART_BASELINE = 200;
const CHART_SCALE = 1.8;
const LABEL_OFFSET = 14;

export function ringDashoffset(score: number, loaded: boolean): number {
  return loaded ? RING_CIRCUMFERENCE * (1 - score / 100) : RING_CIRCUMFERENCE;
}

export function chartY(score: number): number {
  return round(CHART_BASELINE - score * CHART_SCALE);
}

export function confidencePointsAttr(trend: ConfidenceTrend): string {
  return trend.points.map((point) => `${point.x},${chartY(point.score)}`).join(' ');
}

export function confidenceAreaPath(trend: ConfidenceTrend): string {
  const points = trend.points;
  if (points.length === 0) {
    return '';
  }
  const line = points.map((point) => `${point.x},${chartY(point.score)}`).join(' L ');
  const last = points[points.length - 1];
  const first = points[0];
  return `M ${line} L ${last.x},${CHART_BASELINE} L ${first.x},${CHART_BASELINE} Z`;
}

export function confidenceDots(trend: ConfidenceTrend): { point: ConfidencePoint; y: number; textY: number; r: number; index: number }[] {
  const lastIndex = trend.points.length - 1;
  return trend.points.map((point, index) => ({
    point,
    y: chartY(point.score),
    textY: round(chartY(point.score) - LABEL_OFFSET),
    r: index === lastIndex ? 7 : 6,
    index,
  }));
}

export function confidenceGain(trend: ConfidenceTrend | null): number {
  if (!trend || trend.points.length < 2) {
    return 0;
  }
  return trend.points[trend.points.length - 1].score - trend.points[0].score;
}

export function resultIconPath(kind: ResultKind): string {
  return kind === 'unlock' ? 'M5 12h14M13 6l6 6-6 6' : 'M3 12a9 9 0 1 1 3 6.7L3 16M3 21v-5h5';
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
