import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../../core/api';
import { LearningSession, LearningSessionSummary } from './learning-session.models';

/** Talks to the backend learning-sessions endpoints. JWT is added by the existing interceptor. */
@Injectable({ providedIn: 'root' })
export class LearningSessionApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${API_BASE}/learning-sessions`;

  getCurrent(): Observable<LearningSession> {
    return this.http.get<LearningSession>(`${this.base}/current`);
  }

  getById(id: string): Observable<LearningSession> {
    return this.http.get<LearningSession>(`${this.base}/${id}`);
  }

  start(id: string): Observable<LearningSession> {
    return this.http.post<LearningSession>(`${this.base}/${id}/start`, {});
  }

  complete(id: string): Observable<LearningSession> {
    return this.http.post<LearningSession>(`${this.base}/${id}/complete`, {});
  }

  /** Seeds the lookahead buffer from the latest roadmap and returns the current session. */
  generate(): Observable<LearningSession> {
    return this.http.post<LearningSession>(`${this.base}/generate`, {});
  }

  upcoming(): Observable<LearningSessionSummary[]> {
    return this.http.get<LearningSessionSummary[]>(`${this.base}/upcoming`);
  }
}
