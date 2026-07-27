import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE } from '../../core/api';
import { Account, SettingsBundle } from './settings.models';

export interface LoginActivity {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface TwoFactorStatus {
  enabled: boolean;
  phoneNumber: string | null;
}

/** Returned after a setup/send-code call: the masked number the code was texted to. */
export interface TwoFactorSetup {
  phoneNumber: string;
}

export interface Device {
  id: string;
  deviceLabel: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastSeenAt: string;
  current: boolean;
}

@Injectable({ providedIn: 'root' })
export class SettingsApi {
  private readonly http = inject(HttpClient);
  private readonly settingsBase = `${API_BASE}/users/me/settings`;
  private readonly accountBase = `${API_BASE}/account`;

  getSettings(): Observable<SettingsBundle> {
    return this.http.get<SettingsBundle>(this.settingsBase);
  }

  getLoginActivity(): Observable<LoginActivity[]> {
    return this.http.get<LoginActivity[]>(`${this.accountBase}/login-activity`);
  }

  getTwoFactorStatus(): Observable<TwoFactorStatus> {
    return this.http.get<TwoFactorStatus>(`${this.accountBase}/2fa`);
  }

  setupTwoFactor(phoneNumber: string): Observable<TwoFactorSetup> {
    return this.http.post<TwoFactorSetup>(`${this.accountBase}/2fa/setup`, { phoneNumber });
  }

  enableTwoFactor(code: string): Observable<TwoFactorStatus> {
    return this.http.post<TwoFactorStatus>(`${this.accountBase}/2fa/enable`, { code });
  }

  sendDisableCode(): Observable<TwoFactorSetup> {
    return this.http.post<TwoFactorSetup>(`${this.accountBase}/2fa/send-code`, {});
  }

  disableTwoFactor(code: string): Observable<TwoFactorStatus> {
    return this.http.post<TwoFactorStatus>(`${this.accountBase}/2fa/disable`, { code });
  }

  exportData(): Observable<Blob> {
    return this.http.get(`${this.accountBase}/export`, { responseType: 'blob' });
  }

  getDevices(currentSessionId: string | null): Observable<Device[]> {
    let params = new HttpParams();
    if (currentSessionId) {
      params = params.set('current', currentSessionId);
    }
    return this.http.get<Device[]>(`${this.accountBase}/devices`, { params });
  }

  revokeDevice(id: string): Observable<void> {
    return this.http.post<void>(`${this.accountBase}/devices/${id}/revoke`, {});
  }

  revokeOtherDevices(currentSessionId: string | null): Observable<void> {
    let params = new HttpParams();
    if (currentSessionId) {
      params = params.set('current', currentSessionId);
    }
    return this.http.post<void>(`${this.accountBase}/devices/revoke-others`, {}, { params });
  }

  updateSettings(bundle: SettingsBundle): Observable<SettingsBundle> {
    return this.http.put<SettingsBundle>(this.settingsBase, bundle);
  }

  getAccount(): Observable<Account> {
    return this.http.get<Account>(`${this.accountBase}/me`);
  }

  updateProfile(firstName: string, lastName: string): Observable<Account> {
    return this.http.patch<Account>(`${this.accountBase}/profile`, { firstName, lastName });
  }

  changeEmail(newEmail: string, currentPassword: string): Observable<Account> {
    return this.http.post<Account>(`${this.accountBase}/email`, { newEmail, currentPassword });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.accountBase}/password`, { currentPassword, newPassword });
  }

  uploadAvatar(file: File): Observable<Account> {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<Account>(`${this.accountBase}/image`, form);
  }
}
