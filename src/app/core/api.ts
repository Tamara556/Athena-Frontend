import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AssessmentAnswer,
  AuthResponse,
  DailyPlanResponse,
  GoalQuestions,
  LoginRequest,
  OnboardingStart,
  RoadmapResponse,
  TwoFactorVerifyRequest,
} from './api.types';

export const API_BASE = environment.apiBase;

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);

  register(body: FormData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/register`, body);
  }

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/login`, body);
  }

  verifyTwoFactor(body: TwoFactorVerifyRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/2fa/verify`, body);
  }

  startOnboarding(): Observable<OnboardingStart> {
    return this.http.post<OnboardingStart>(`${API_BASE}/ai/onboarding/start`, {});
  }

  submitGoal(goal: string): Observable<GoalQuestions> {
    return this.http.post<GoalQuestions>(`${API_BASE}/ai/onboarding/goal`, { goal });
  }

  submitAssessment(answers: AssessmentAnswer[]): Observable<RoadmapResponse> {
    return this.http.post<RoadmapResponse>(`${API_BASE}/ai/onboarding/assessment`, { answers });
  }

  roadmap(): Observable<RoadmapResponse> {
    return this.http.get<RoadmapResponse>(`${API_BASE}/ai/roadmaps/me`);
  }

  completePhase(index: number): Observable<RoadmapResponse> {
    return this.http.post<RoadmapResponse>(`${API_BASE}/ai/roadmaps/me/phases/${index}/complete`, {});
  }

  dailyPlan(): Observable<DailyPlanResponse> {
    return this.http.get<DailyPlanResponse>(`${API_BASE}/ai/daily-plans/me`);
  }
}
