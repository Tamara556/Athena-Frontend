import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { Session } from '../../core/session';
import { ProfileApi } from './profile.api';
import { fullName, initials, sortMilestones, styleBullets } from './profile.logic';
import {
  AthenaInsight,
  LearningDirection,
  LearningPreferences,
  Milestone,
  ProfileIdentity,
  ProfileNarrative,
} from './profile.models';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly api = inject(ProfileApi);
  private readonly session = inject(Session);

  readonly identity = signal<ProfileIdentity | null>(null);
  readonly narrative = signal<ProfileNarrative | null>(null);
  readonly direction = signal<LearningDirection | null>(null);
  readonly preferences = signal<LearningPreferences | null>(null);
  readonly insights = signal<AthenaInsight[]>([]);
  readonly milestones = signal<Milestone[]>([]);
  readonly loaded = signal(false);
  readonly dialogBusy = signal(false);

  readonly avatarUrl = this.session.image;
  readonly initials = computed(() => {
    const identity = this.identity();
    return identity ? initials(identity.firstName, identity.lastName) : '';
  });
  readonly styleBullets = computed(() => {
    const preferences = this.preferences();
    return preferences ? styleBullets(preferences.style) : [];
  });
  readonly sortedMilestones = computed(() => sortMilestones(this.milestones()));

  load(): void {
    this.api.getIdentity().subscribe({
      next: (identity) => {
        this.identity.set(identity);
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
    this.api.getPreferences().subscribe({ next: (value) => this.preferences.set(value), error: () => undefined });
    this.api.getNarrative().subscribe({ next: (value) => this.narrative.set(value), error: () => undefined });
    this.api.getDirection().subscribe({ next: (value) => this.direction.set(value), error: () => undefined });
    this.api.getInsights().subscribe({ next: (value) => this.insights.set(value), error: () => undefined });
    this.api.getMilestones().subscribe({ next: (value) => this.milestones.set(value), error: () => undefined });
  }

  updateProfile(firstName: string, lastName: string): Observable<ProfileIdentity> {
    return this.run(this.api.updateProfile(firstName, lastName), (identity) => {
      this.identity.set(identity);
      this.session.updateName(fullName(identity));
    });
  }

  uploadAvatar(file: File): Observable<ProfileIdentity> {
    return this.run(this.api.uploadAvatar(file), (identity) => {
      this.identity.set(identity);
      this.session.refreshAvatar();
    });
  }

  updateDirection(direction: LearningDirection): Observable<LearningDirection> {
    return this.run(this.api.updateDirection(direction), (value) => this.direction.set(value));
  }

  updateAvailability(availability: string): Observable<LearningPreferences> {
    return this.run(this.api.updateAvailability(availability), (value) => this.preferences.set(value));
  }

  private run<T>(request: Observable<T>, onSuccess: (value: T) => void): Observable<T> {
    this.dialogBusy.set(true);
    return request.pipe(tap(onSuccess), finalize(() => this.dialogBusy.set(false)));
  }
}
