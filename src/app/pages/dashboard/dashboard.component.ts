import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { DailyPlanResponse, RoadmapResponse } from '../../core/api.types';
import { Session } from '../../core/session';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(Api);
  protected readonly session = inject(Session);

  roadmap = signal<RoadmapResponse | null>(null);
  plan = signal<DailyPlanResponse | null>(null);
  roadmapMsg = signal('Loading…');
  planMsg = signal('Loading…');

  ngOnInit(): void {
    if (!this.session.isLoggedIn()) return;
    this.api.roadmap().subscribe({
      next: (r) => this.roadmap.set(r),
      error: () => this.roadmapMsg.set('No roadmap yet — complete onboarding first.'),
    });
    this.api.dailyPlan().subscribe({
      next: (p) => this.plan.set(p),
      error: () => this.planMsg.set('No daily plan yet — complete onboarding first.'),
    });
  }
}
