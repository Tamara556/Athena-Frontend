import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, finalize, map, tap } from 'rxjs';
import { Session } from '../../core/session';
import { SettingsApi } from './settings.api';
import { Account, DEFAULT_SEGS, DEFAULT_TOGS, Segs, SettingsBundle, Togs } from './settings.models';

@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private readonly api = inject(SettingsApi);
  private readonly session = inject(Session);

  readonly loaded = signal(false);
  readonly saving = signal(false);
  readonly account = signal<Account | null>(null);
  readonly dialogBusy = signal(false);
  readonly segs = signal<Segs>({ ...DEFAULT_SEGS });
  readonly togs = signal<Togs>({ ...DEFAULT_TOGS });

  private savedSegs: Segs = { ...DEFAULT_SEGS };
  private savedTogs: Togs = { ...DEFAULT_TOGS };

  readonly dirty = computed(() => !shallowEqual(this.segs(), this.savedSegs) || !shallowEqual(this.togs(), this.savedTogs));

  load(): void {
    this.api.getSettings().subscribe({
      next: (bundle) => {
        this.apply(bundle);
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
  }

  loadAccount(): void {
    this.api.getAccount().subscribe({ next: (account) => this.account.set(account), error: () => undefined });
  }

  updateProfile(firstName: string, lastName: string): Observable<Account> {
    return this.runAccount(this.api.updateProfile(firstName, lastName),
      (account) => this.session.updateName(`${account.firstName} ${account.lastName}`.trim()));
  }

  changeEmail(newEmail: string, currentPassword: string): Observable<Account> {
    return this.runAccount(this.api.changeEmail(newEmail, currentPassword));
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    this.dialogBusy.set(true);
    return this.api.changePassword(currentPassword, newPassword).pipe(finalize(() => this.dialogBusy.set(false)));
  }

  uploadAvatar(file: File): Observable<Account> {
    return this.runAccount(this.api.uploadAvatar(file), () => this.session.refreshAvatar());
  }

  private runAccount(request: Observable<Account>, onSuccess?: (account: Account) => void): Observable<Account> {
    this.dialogBusy.set(true);
    return request.pipe(
      tap((account) => {
        this.account.set(account);
        onSuccess?.(account);
      }),
      finalize(() => this.dialogBusy.set(false)),
    );
  }

  selectSeg(group: string, value: string): void {
    if (this.segs()[group] === value) {
      return;
    }
    this.segs.update((current) => ({ ...current, [group]: value }));
  }

  toggle(key: string): void {
    this.togs.update((current) => ({ ...current, [key]: !current[key] }));
  }

  discard(): void {
    this.segs.set({ ...this.savedSegs });
    this.togs.set({ ...this.savedTogs });
  }

  save(): Observable<void> {
    this.saving.set(true);
    return this.api.updateSettings(this.toBundle()).pipe(
      tap({
        next: (bundle) => {
          this.apply(bundle);
          this.saving.set(false);
        },
        error: () => this.saving.set(false),
      }),
      map(() => undefined),
    );
  }

  private apply(bundle: SettingsBundle): void {
    const segs: Segs = {
      availability: bundle.learning.availability,
      difficulty: bundle.learning.difficulty,
      style: bundle.learning.style,
      tone: bundle.experience.tone,
    };
    const togs: Togs = {
      motivational: bundle.experience.motivational,
      reflection: bundle.experience.reflection,
      adaptive: bundle.experience.adaptive,
      dailyReminder: bundle.notifications.dailyReminder,
      weeklySummary: bundle.notifications.weeklySummary,
      interviewReminders: bundle.notifications.interviewReminders,
      milestones: bundle.notifications.milestones,
      personalize: bundle.privacy.personalize,
      shareAnon: bundle.privacy.shareAnon,
    };
    this.segs.set(segs);
    this.togs.set(togs);
    this.savedSegs = { ...segs };
    this.savedTogs = { ...togs };
  }

  private toBundle(): SettingsBundle {
    const segs = this.segs();
    const togs = this.togs();
    return {
      learning: { availability: segs['availability'], difficulty: segs['difficulty'], style: segs['style'] },
      experience: { tone: segs['tone'], motivational: togs['motivational'], reflection: togs['reflection'], adaptive: togs['adaptive'] },
      notifications: {
        dailyReminder: togs['dailyReminder'],
        weeklySummary: togs['weeklySummary'],
        interviewReminders: togs['interviewReminders'],
        milestones: togs['milestones'],
      },
      privacy: { personalize: togs['personalize'], shareAnon: togs['shareAnon'] },
    };
  }
}

function shallowEqual<T>(a: Record<string, T>, b: Record<string, T>): boolean {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((key) => a[key] === b[key]);
}
