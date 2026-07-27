import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../../core/api';
import { AdjustAction, Confidence, DailyJourney, WhyReasoning } from './daily-journey.models';

@Injectable({ providedIn: 'root' })
export class DailyJourneyApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE}/daily-journey`;

  today(): Observable<DailyJourney> {
    return this.http.get<DailyJourney>(`${this.base}/today`);
  }

  why(): Observable<WhyReasoning> {
    return this.http.get<WhyReasoning>(`${this.base}/today/why`);
  }

  startDay(): Observable<DailyJourney> {
    return this.http.post<DailyJourney>(`${this.base}/today/start`, {});
  }

  adjustPlan(action: AdjustAction): Observable<DailyJourney> {
    return this.http.post<DailyJourney>(`${this.base}/today/adjust`, { action });
  }

  adjustTime(availableMinutes: number): Observable<DailyJourney> {
    return this.http.post<DailyJourney>(`${this.base}/today/time`, { availableMinutes });
  }

  startBlock(blockId: string): Observable<DailyJourney> {
    return this.http.post<DailyJourney>(`${this.base}/blocks/${blockId}/start`, {});
  }

  progress(blockId: string, percent: number): Observable<DailyJourney> {
    return this.http.post<DailyJourney>(`${this.base}/blocks/${blockId}/progress`, { percent });
  }

  complete(blockId: string): Observable<DailyJourney> {
    return this.http.post<DailyJourney>(`${this.base}/blocks/${blockId}/complete`, {});
  }

  skip(blockId: string, reason: string | null): Observable<DailyJourney> {
    return this.http.post<DailyJourney>(`${this.base}/blocks/${blockId}/skip`, { reason });
  }

  relink(blockId: string): Observable<DailyJourney> {
    return this.http.post<DailyJourney>(`${this.base}/blocks/${blockId}/relink`, {});
  }

  strengthen(knowledgeNodeId: string): Observable<DailyJourney> {
    return this.http.post<DailyJourney>(`${this.base}/weaknesses/${knowledgeNodeId}/strengthen`, {});
  }

  checkin(confidence: Confidence, blockId: string | null): Observable<DailyJourney> {
    return this.http.post<DailyJourney>(`${this.base}/checkin`, { confidence, blockId });
  }

  saveReflection(hardestPart: string, whatClicked: string, adjustRequest: string): Observable<DailyJourney> {
    return this.http.post<DailyJourney>(`${this.base}/reflection`, { hardestPart, whatClicked, adjustRequest });
  }

  skipReflection(): Observable<DailyJourney> {
    return this.http.post<DailyJourney>(`${this.base}/reflection/skip`, {});
  }
}
