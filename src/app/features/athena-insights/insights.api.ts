import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { API_BASE } from '../../core/api';
import { InsightsProfile } from './insights.models';

const EMPTY_PROFILE: InsightsProfile = {
  generatedAt: '',
  letter: { eyebrow: '', salutation: true, title: '', dateLabel: null, signTagline: '', paragraphs: [] },
  learningStyle: { best: [], harder: [] },
  patterns: [],
  strengths: [],
  explorations: [],
  evolution: { segments: [] },
  potential: [],
  futureLetter: { eyebrow: '', salutation: false, title: '', dateLabel: null, signTagline: '', paragraphs: [] },
};

@Injectable({ providedIn: 'root' })
export class InsightsApi {
  private readonly http = inject(HttpClient);

  getInsights(): Observable<InsightsProfile> {
    return this.http.get<InsightsProfile>(`${API_BASE}/ai/insights/me`).pipe(catchError(() => of(EMPTY_PROFILE)));
  }
}
