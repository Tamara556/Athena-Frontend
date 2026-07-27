import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../../core/api';
import { StreakActivity } from './streaks.models';

@Injectable({ providedIn: 'root' })
export class StreaksApi {
  private readonly http = inject(HttpClient);

  getActivity(): Observable<StreakActivity> {
    return this.http.get<StreakActivity>(`${API_BASE}/progress/streaks`);
  }
}
