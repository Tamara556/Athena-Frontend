import { Injectable, inject } from '@angular/core';
import { Observable, delay, map, of, switchMap } from 'rxjs';
import { SettingsApi } from '../settings/settings.api';
import { Account } from '../settings/settings.models';
import {
  AthenaInsight,
  LearningDirection,
  LearningPreferences,
  Milestone,
  ProfileIdentity,
  ProfileNarrative,
} from './profile.models';

const SIMULATED_LATENCY_MS = 400;

@Injectable({ providedIn: 'root' })
export class ProfileApi {
  private readonly settings = inject(SettingsApi);

  getIdentity(): Observable<ProfileIdentity> {
    return this.settings.getAccount().pipe(map((account) => toIdentity(account)));
  }

  getPreferences(): Observable<LearningPreferences> {
    return this.settings.getSettings().pipe(map((bundle) => toPreferences(bundle.learning)));
  }

  getNarrative(): Observable<ProfileNarrative | null> {
    return of(null);
  }

  getDirection(): Observable<LearningDirection | null> {
    return of(null);
  }

  getInsights(): Observable<AthenaInsight[]> {
    return of([]);
  }

  getMilestones(): Observable<Milestone[]> {
    return of([]);
  }

  updateProfile(firstName: string, lastName: string): Observable<ProfileIdentity> {
    return this.settings.updateProfile(firstName, lastName).pipe(map((account) => toIdentity(account)));
  }

  uploadAvatar(file: File): Observable<ProfileIdentity> {
    return this.settings.uploadAvatar(file).pipe(map((account) => toIdentity(account)));
  }

  updateDirection(direction: LearningDirection): Observable<LearningDirection> {
    return of({ ...direction }).pipe(delay(SIMULATED_LATENCY_MS));
  }

  updateAvailability(availability: string): Observable<LearningPreferences> {
    return this.settings.getSettings().pipe(
      switchMap((bundle) =>
        this.settings.updateSettings({ ...bundle, learning: { ...bundle.learning, availability } }),
      ),
      map((bundle) => toPreferences(bundle.learning)),
    );
  }
}

function toIdentity(account: Account): ProfileIdentity {
  return {
    userId: account.userId,
    firstName: account.firstName,
    lastName: account.lastName,
    title: '',
    joinedAt: '',
    imageName: account.imageName,
  };
}

function toPreferences(learning: { availability: string; difficulty: string; style: string }): LearningPreferences {
  return { availability: learning.availability, difficulty: learning.difficulty, style: learning.style };
}
