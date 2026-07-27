import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { AuthResponse } from '../../core/api.types';
import { Session } from '../../core/session';
import { errorMessage } from '../../core/errors';

type FieldState = 'valid' | 'invalid' | '';

/**
 * Athena sign-in. The backend accepts email OR username as the login, so the
 * frontend does no format validation — it only checks the fields aren't empty and
 * lets the backend authenticate. On success it stores the session and goes to /roadmap.
 */
@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly api = inject(Api);
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  readonly pwVisible = signal(false);
  readonly loginState = signal<FieldState>('');
  readonly pwState = signal<FieldState>('');
  readonly loading = signal(false);
  readonly errorShown = signal(false);
  readonly errorText = signal('That login and password don’t match. Try again.');
  readonly successShown = signal(false);
  readonly submitLabel = signal('Sign in');
  readonly googleLoading = signal(false);
  readonly githubLoading = signal(false);

  readonly twoFactorStep = signal(false);
  private readonly challengeToken = signal('');

  togglePw(): void {
    this.pwVisible.update((v) => !v);
  }

  private hideAlerts(): void {
    this.errorShown.set(false);
    this.successShown.set(false);
  }

  // No format checks — login can be an email or a username. Just clear errors as the user types.
  onLoginInput(value: string): void {
    this.hideAlerts();
    if (this.loginState() === 'invalid' && value.trim() !== '') this.loginState.set('');
  }

  onPwInput(value: string): void {
    this.hideAlerts();
    if (this.pwState() === 'invalid' && value !== '') this.pwState.set('');
  }

  onSubmit(login: string, password: string): void {
    this.hideAlerts();

    this.loginState.set(login.trim() === '' ? 'invalid' : '');
    this.pwState.set(password === '' ? 'invalid' : '');
    if (login.trim() === '' || password === '') {
      this.errorText.set('Enter your email or username and password.');
      this.errorShown.set(true);
      return;
    }

    this.loading.set(true);
    this.api.login({ login: login.trim(), password }).subscribe({
      next: (auth) => {
        if (auth.twoFactorRequired && auth.challengeToken) {
          this.challengeToken.set(auth.challengeToken);
          this.twoFactorStep.set(true);
          this.submitLabel.set('Verify');
          this.loading.set(false);
          return;
        }
        this.completeSignIn(auth);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorText.set(errorMessage(err));
        this.errorShown.set(true);
        this.loginState.set('invalid');
        this.pwState.set('invalid');
      },
    });
  }

  onVerify(code: string): void {
    this.hideAlerts();
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      this.errorText.set('Enter the 6-digit code we texted to your phone.');
      this.errorShown.set(true);
      return;
    }
    this.loading.set(true);
    this.api.verifyTwoFactor({ challengeToken: this.challengeToken(), code: trimmed }).subscribe({
      next: (auth) => this.completeSignIn(auth),
      error: (err) => {
        this.loading.set(false);
        this.errorText.set(errorMessage(err));
        this.errorShown.set(true);
      },
    });
  }

  cancelTwoFactor(): void {
    this.twoFactorStep.set(false);
    this.challengeToken.set('');
    this.submitLabel.set('Sign in');
    this.hideAlerts();
  }

  private completeSignIn(auth: AuthResponse): void {
    this.session.set(auth);
    this.successShown.set(true);
    this.submitLabel.set('Signed in');
    this.router.navigateByUrl('/roadmap');
  }

  // social buttons (demo loading)
  social(provider: 'google' | 'github'): void {
    const flag = provider === 'google' ? this.googleLoading : this.githubLoading;
    if (flag()) return;
    flag.set(true);
    setTimeout(() => flag.set(false), 1600);
  }
}
