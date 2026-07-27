import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  ConfidenceQuote,
  FuturePrediction,
  GrowthHighlight,
  Milestone,
  Observation,
  Reflection,
  ReflectionPrompt,
  TransformView,
} from './progress.models';

const SIMULATED_LATENCY_MS = 500;

const EMPTY_TRANSFORM: TransformView = { startLabel: '', nowLabel: '', rows: [] };

const PROMPTS: ReflectionPrompt[] = [
  { label: 'What are you most proud of?', placeholder: 'What accomplishment are you most proud of?' },
  { label: 'What would Day-One you think?', placeholder: 'What would the version of you from Day One think if they saw you today?' },
  { label: 'What surprised you most?', placeholder: 'What surprised you most about your growth?' },
];

@Injectable({ providedIn: 'root' })
export class ProgressApi {
  getTransform(): Observable<TransformView> {
    return of(EMPTY_TRANSFORM);
  }

  getHighlights(): Observable<GrowthHighlight[]> {
    return of([]);
  }

  getJourney(): Observable<ConfidenceQuote[]> {
    return of([]);
  }

  getObservations(): Observable<Observation[]> {
    return of([]);
  }

  getMilestones(): Observable<Milestone[]> {
    return of([]);
  }

  getFuture(): Observable<FuturePrediction[]> {
    return of([]);
  }

  getPrompts(): Observable<ReflectionPrompt[]> {
    return of(PROMPTS).pipe(delay(SIMULATED_LATENCY_MS));
  }

  getReflections(): Observable<Reflection[]> {
    return of<Reflection[]>([]);
  }

  saveReflection(prompt: string, text: string): Observable<Reflection> {
    return of({ prompt, text, savedAt: new Date().toISOString() }).pipe(delay(SIMULATED_LATENCY_MS));
  }
}
