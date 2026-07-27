import { Injectable, computed, signal } from '@angular/core';
import { API_BASE } from './api';
import { AuthResponse } from './api.types';

/** Holds the JWT and identity, persisted in localStorage so a refresh keeps you logged in. */
@Injectable({ providedIn: 'root' })
export class Session {
  readonly token = signal<string | null>(localStorage.getItem('athena_token'));
  readonly userId = signal<string | null>(localStorage.getItem('athena_userId'));
  /** Id of this browser's device session, so "Manage devices" can mark the current one. */
  readonly sessionId = signal<string | null>(localStorage.getItem('athena_sessionId'));
  readonly name = signal<string | null>(localStorage.getItem('athena_name'));
  /** Avatar URL when the user uploaded a picture; null falls back to initials. */
  readonly image = signal<string | null>(localStorage.getItem('athena_image'));
  readonly isLoggedIn = computed(() => !!this.token());

  set(auth: AuthResponse): void {
    this.token.set(auth.accessToken);
    this.userId.set(auth.userId);
    this.sessionId.set(auth.sessionId ?? null);
    if (auth.sessionId) localStorage.setItem('athena_sessionId', auth.sessionId);
    else localStorage.removeItem('athena_sessionId');

    // Full name (first + last); fall back to username, then a single name part.
    const fullName = [auth.firstName, auth.lastName].filter(Boolean).join(' ').trim();
    const display = fullName || auth.username || null;
    this.name.set(display);

    // The picture lives in a private bucket, so point at the backend that streams it.
    const imageUrl = auth.imageName ? `${API_BASE}/auth/users/${auth.userId}/image` : null;
    this.image.set(imageUrl);

    localStorage.setItem('athena_token', auth.accessToken);
    localStorage.setItem('athena_userId', auth.userId);
    if (display) localStorage.setItem('athena_name', display);
    if (imageUrl) localStorage.setItem('athena_image', imageUrl);
    else localStorage.removeItem('athena_image');
  }

  updateName(name: string): void {
    this.name.set(name || null);
    if (name) {
      localStorage.setItem('athena_name', name);
    } else {
      localStorage.removeItem('athena_name');
    }
  }

  refreshAvatar(): void {
    const userId = this.userId();
    if (!userId) {
      return;
    }
    const imageUrl = `${API_BASE}/auth/users/${userId}/image?t=${Date.now()}`;
    this.image.set(imageUrl);
    localStorage.setItem('athena_image', imageUrl);
  }

  clear(): void {
    this.token.set(null);
    this.userId.set(null);
    this.sessionId.set(null);
    this.name.set(null);
    this.image.set(null);
    localStorage.removeItem('athena_token');
    localStorage.removeItem('athena_userId');
    localStorage.removeItem('athena_sessionId');
    localStorage.removeItem('athena_name');
    localStorage.removeItem('athena_image');
  }
}
