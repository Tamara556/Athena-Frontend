import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  AnswerInput,
  ConfidenceTrend,
  ImpactItem,
  InterviewLevel,
  InterviewResult,
  NextInterview,
  Observation,
  Readiness,
  ReviewTopic,
  StartedInterview,
  TalkCard,
  Tip,
} from './interviews.models';

const SIMULATED_LATENCY_MS = 420;

const TIPS: Tip[] = [
  { before: 'Explain concepts ', bold: 'aloud', after: ' — if you can teach it, you know it.' },
  { before: 'Focus on ', bold: 'understanding', after: ', not memorizing. I care how you reason.' },
  { before: 'Reach for a ', bold: 'practical example', after: " — that's where you shine." },
  { before: "It's fine to say ", bold: '"I\'m not sure"', after: ' — that\'s useful signal, not a failure.' },
];

const IMPACTS: ImpactItem[] = [
  { icon: '🗺️', gradient: 'linear-gradient(135deg,#8B5CF6,#A855F7)', title: 'Adapts your roadmap', text: "Reorders what's next around what you actually need." },
  { icon: '🔍', gradient: 'linear-gradient(135deg,#FBBF24,#FB923C)', title: 'Surfaces blind spots', text: 'Finds gentle gaps before they slow you down.' },
  { icon: '🔓', gradient: 'linear-gradient(135deg,#F472B6,#A855F7)', title: 'Unlocks advanced topics', text: "Opens new ground the moment you're ready for it." },
  { icon: '🎯', gradient: 'linear-gradient(135deg,#34D399,#22D3EE)', title: 'Personalizes activities', text: 'Tailors your daily practice to how you learn.' },
];

const MOCK_LEVELS: InterviewLevel[] = [
  { id: 0, label: 'Gentle', level: 'beginner', durationLabel: '~8 min', questionsLabel: 'warm, foundational' },
  { id: 1, label: 'Balanced', level: 'intermediate', durationLabel: '~15 min', questionsLabel: 'a realistic mix' },
  { id: 2, label: 'Challenge', level: 'advanced', durationLabel: '~22 min', questionsLabel: 'deeper, stretch' },
];

@Injectable({ providedIn: 'root' })
export class InterviewsApi {
  getNextInterview(): Observable<NextInterview | null> {
    return of(null);
  }

  getConfidenceTrend(): Observable<ConfidenceTrend | null> {
    return of(null);
  }

  getReadiness(): Observable<Readiness | null> {
    return of(null);
  }

  getHistory(): Observable<TalkCard[]> {
    return of([]);
  }

  getObservations(): Observable<Observation[]> {
    return of([]);
  }

  getReviewTopics(): Observable<ReviewTopic[]> {
    return of([]);
  }

  getTips(): Observable<Tip[]> {
    return of(TIPS).pipe(delay(SIMULATED_LATENCY_MS));
  }

  getImpacts(): Observable<ImpactItem[]> {
    return of(IMPACTS).pipe(delay(SIMULATED_LATENCY_MS));
  }

  getMockLevels(): Observable<InterviewLevel[]> {
    return of(MOCK_LEVELS).pipe(delay(SIMULATED_LATENCY_MS));
  }

  start(domain: string, level: string): Observable<StartedInterview> {
    return of({ id: `iv-${Date.now()}`, domain, level, status: 'IN_PROGRESS', questions: [] }).pipe(delay(SIMULATED_LATENCY_MS));
  }

  submit(interviewId: string, _answers: AnswerInput[]): Observable<InterviewResult> {
    return of({ id: `res-${Date.now()}`, interviewId, score: 0, passed: false, weaknesses: [], recommendations: [] }).pipe(delay(SIMULATED_LATENCY_MS));
  }
}
