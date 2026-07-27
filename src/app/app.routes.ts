import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  // Public — anyone (signed in or not) can see these.
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },

  // Guests only — a signed-in user is redirected to /roadmap.
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent) },

  // Signed-in only — guests are redirected to /login.
  { path: 'onboarding', canActivate: [authGuard], loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.OnboardingComponent) },
  { path: 'roadmap', canActivate: [authGuard], loadComponent: () => import('./pages/roadmap/roadmap.component').then(m => m.RoadmapComponent) },
  { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'daily-journey', canActivate: [authGuard], loadComponent: () => import('./features/daily-journey/daily-journey.component').then(m => m.DailyJourneyComponent) },
  { path: 'knowledge-graph', canActivate: [authGuard], loadComponent: () => import('./features/knowledge-graph/knowledge-graph.component').then(m => m.KnowledgeGraphComponent) },
  { path: 'interviews', canActivate: [authGuard], loadComponent: () => import('./features/interviews/interviews.component').then(m => m.InterviewsComponent) },
  { path: 'achievements', canActivate: [authGuard], loadComponent: () => import('./features/achievements/achievements.component').then(m => m.AchievementsComponent) },
  { path: 'streaks', canActivate: [authGuard], loadComponent: () => import('./features/streaks/streaks.component').then(m => m.StreaksComponent) },
  { path: 'progress', canActivate: [authGuard], loadComponent: () => import('./features/progress/progress.component').then(m => m.ProgressComponent) },
  { path: 'athena-insights', canActivate: [authGuard], loadComponent: () => import('./features/athena-insights/athena-insights.component').then(m => m.AthenaInsightsComponent) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'settings', canActivate: [authGuard], loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) },
  { path: 'learning/current', canActivate: [authGuard], loadComponent: () => import('./features/learning-session/daily-learning-session.component').then(m => m.DailyLearningSessionComponent) },
  { path: 'learning/:id', canActivate: [authGuard], loadComponent: () => import('./features/learning-session/daily-learning-session.component').then(m => m.DailyLearningSessionComponent) },

  { path: '**', redirectTo: '' },
];
