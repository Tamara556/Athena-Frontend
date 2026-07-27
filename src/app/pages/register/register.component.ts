import { Component, inject, signal } from '@angular/core';
import { TourService } from '../../shared/tour/tour.service';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { Session } from '../../core/session';
import { errorMessage } from '../../core/errors';

type FieldState = 'valid' | 'invalid' | '';
type UnameKind = '' | 'checking' | 'free' | 'taken';

/**
 * Athena account creation. Markup + styles are a 1:1 port of the static design;
 * the original vanilla script (live field validation, password strength meter,
 * username availability, terms gate) is reimplemented here, and submit calls the
 * real backend (POST /auth/register) — which returns a JWT and signs the user in.
 */
@Component({
  selector: 'app-register',
  imports: [RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly api = inject(Api);
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly tour = inject(TourService);

  // field values
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly email = signal('');
  readonly username = signal('');
  readonly password = signal('');
  readonly confirm = signal('');

  // optional profile picture
  readonly imageFile = signal<File | null>(null);
  readonly imagePreview = signal<string | null>(null);
  readonly imageError = signal('');
  // Mirror the backend: PNG, JPEG, JPG or GIF, up to 5 MB.
  private readonly IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
  private readonly IMAGE_MAX_BYTES = 5 * 1024 * 1024;

  // field states
  readonly firstState = signal<FieldState>('');
  readonly lastState = signal<FieldState>('');
  readonly emailState = signal<FieldState>('');
  readonly userState = signal<FieldState>('');
  readonly pwState = signal<FieldState>('');
  readonly confirmState = signal<FieldState>('');
  readonly emailMsgShow = signal(false);
  readonly confirmMsgShow = signal(false);
  readonly termsInvalid = signal(false);

  // password strength
  readonly pwRules = signal({ len: false, upper: false, lower: false, num: false, special: false });
  readonly pwScore = signal(0);

  // username availability
  readonly unameKind = signal<UnameKind>('');
  readonly unameText = signal('');
  private unameOk = false;
  private unameTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly TAKEN = ['athena', 'admin', 'test', 'user', 'root', 'demo', 'support'];

  // form-level
  readonly pwVisible = signal(false);
  readonly errorShown = signal(false);
  readonly errorText = signal('Please complete the highlighted fields to continue.');
  readonly successShown = signal(false);
  readonly loading = signal(false);
  readonly submitLabel = signal('Create Account');

  // social demo
  readonly googleLoading = signal(false);
  readonly githubLoading = signal(false);

  private readonly emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private terms = false;

  private val(e: Event): string {
    return (e.target as HTMLInputElement).value;
  }

  private hideAlerts(): void {
    this.errorShown.set(false);
    this.successShown.set(false);
  }

  togglePw(): void {
    this.pwVisible.update((v) => !v);
  }

  // ---- names ----
  vName(which: 'first' | 'last', value: string): boolean {
    const ok = value.trim().length >= 1;
    const state: FieldState = value === '' ? '' : ok ? 'valid' : 'invalid';
    (which === 'first' ? this.firstState : this.lastState).set(state);
    return ok;
  }

  onFirstInput(e: Event): void {
    this.firstName.set(this.val(e));
    this.hideAlerts();
    if (this.firstState() === 'invalid') this.vName('first', this.firstName());
  }

  onLastInput(e: Event): void {
    this.lastName.set(this.val(e));
    this.hideAlerts();
    if (this.lastState() === 'invalid') this.vName('last', this.lastName());
  }

  // ---- email ----
  vEmail(value: string): boolean {
    const v = value.trim();
    if (v === '') {
      this.emailState.set('');
      this.emailMsgShow.set(false);
      return false;
    }
    const ok = this.emailRe.test(v);
    this.emailState.set(ok ? 'valid' : 'invalid');
    this.emailMsgShow.set(!ok);
    return ok;
  }

  onEmailInput(e: Event): void {
    this.email.set(this.val(e));
    this.hideAlerts();
    if (this.emailState() === 'invalid' || this.emailRe.test(this.email().trim())) this.vEmail(this.email());
  }

  // ---- username availability ----
  onUserInput(e: Event): void {
    this.username.set(this.val(e));
    this.hideAlerts();
    this.unameOk = false;
    const v = this.username().trim();
    if (this.unameTimer) clearTimeout(this.unameTimer);

    if (v.length < 3) {
      this.unameKind.set('');
      this.unameText.set('');
      this.userState.set(v === '' ? '' : 'invalid');
      return;
    }
    this.unameKind.set('checking');
    this.unameText.set('Checking availability…');
    this.userState.set('');
    this.unameTimer = setTimeout(() => {
      const taken = this.TAKEN.includes(v.toLowerCase());
      if (taken) {
        this.unameKind.set('taken');
        this.unameText.set('That username is already taken');
        this.userState.set('invalid');
        this.unameOk = false;
      } else {
        this.unameKind.set('free');
        this.unameText.set('“' + v + '” is available');
        this.userState.set('valid');
        this.unameOk = true;
      }
    }, 700);
  }

  // ---- password strength + live requirements ----
  private computeRules(v: string) {
    return {
      len: v.length >= 8,
      upper: /[A-Z]/.test(v),
      lower: /[a-z]/.test(v),
      num: /[0-9]/.test(v),
      special: /[^A-Za-z0-9]/.test(v),
    };
  }

  vPw(): boolean {
    const v = this.password();
    const r = this.computeRules(v);
    this.pwRules.set(r);
    const score = Object.values(r).filter(Boolean).length;
    this.pwScore.set(v === '' ? 0 : score);
    const allOk = score === 5;
    if (v === '') this.pwState.set('');
    else this.pwState.set(allOk ? 'valid' : this.pwState() === 'invalid' ? 'invalid' : '');
    if (this.confirm()) this.vConfirm(this.confirm());
    return allOk;
  }

  onPwInput(e: Event): void {
    this.password.set(this.val(e));
    this.hideAlerts();
    this.vPw();
  }

  // ---- confirm match ----
  vConfirm(value: string): boolean {
    if (value === '') {
      this.confirmState.set('');
      this.confirmMsgShow.set(false);
      return false;
    }
    const ok = value === this.password();
    this.confirmState.set(ok ? 'valid' : 'invalid');
    this.confirmMsgShow.set(!ok);
    return ok;
  }

  onConfirmInput(e: Event): void {
    this.confirm.set(this.val(e));
    this.hideAlerts();
    this.vConfirm(this.confirm());
  }

  // ---- profile picture (optional) ----
  onImageChange(e: Event): void {
    this.hideAlerts();
    this.imageError.set('');
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;

    if (!this.IMAGE_TYPES.includes(file.type)) {
      this.imageError.set('Choose a PNG, JPEG, JPG or GIF image.');
      input.value = '';
      return;
    }
    if (file.size > this.IMAGE_MAX_BYTES) {
      this.imageError.set('Image must be 5 MB or smaller.');
      input.value = '';
      return;
    }

    const prev = this.imagePreview();
    if (prev) URL.revokeObjectURL(prev);
    this.imageFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
  }

  removeImage(): void {
    const prev = this.imagePreview();
    if (prev) URL.revokeObjectURL(prev);
    this.imageFile.set(null);
    this.imagePreview.set(null);
    this.imageError.set('');
  }

  // ---- terms ----
  onTerms(e: Event): void {
    this.terms = (e.target as HTMLInputElement).checked;
    if (this.terms) this.termsInvalid.set(false);
  }

  // ---- submit ----
  onSubmit(): void {
    this.hideAlerts();

    const okFirst = this.vName('first', this.firstName()) && this.firstName().trim() !== '';
    const okLast = this.vName('last', this.lastName()) && this.lastName().trim() !== '';
    const okEmail = this.vEmail(this.email()) && this.email().trim() !== '';
    const okPw = this.vPw();
    const okConf = this.vConfirm(this.confirm()) && this.confirm() !== '';
    const okTerms = this.terms;

    // force invalid display on empty/short fields too
    if (this.firstName().trim() === '') this.firstState.set('invalid');
    if (this.lastName().trim() === '') this.lastState.set('invalid');
    if (this.email().trim() === '') {
      this.emailState.set('invalid');
      this.emailMsgShow.set(true);
    }
    if (this.password() === '') this.pwState.set('invalid');
    if (this.confirm() === '') {
      this.confirmState.set('invalid');
      this.confirmMsgShow.set(true);
    }
    if (this.username().trim().length < 3) this.userState.set('invalid');
    if (!okTerms) this.termsInvalid.set(true);

    const allValid = okFirst && okLast && okEmail && okPw && okConf && this.unameOk && okTerms;
    if (!allValid) {
      this.errorText.set(
        !okTerms
          ? 'Please accept the Terms of Service and Privacy Policy.'
          : 'Please complete the highlighted fields to continue.',
      );
      this.errorShown.set(true);
      return;
    }

    // call the real backend — register returns a JWT (auto sign-in).
    // multipart/form-data so the optional avatar rides along; omit it to keep the default.
    const form = new FormData();
    form.append('firstName', this.firstName().trim());
    form.append('lastName', this.lastName().trim());
    form.append('username', this.username().trim());
    form.append('email', this.email().trim());
    form.append('password', this.password());
    const image = this.imageFile();
    if (image) form.append('image', image, image.name);

    this.loading.set(true);
    this.api
      .register(form)
      .subscribe({
        next: (auth) => {
          this.session.set(auth);
          this.successShown.set(true);
          this.submitLabel.set('Account created');
          this.tour.markPending(); // first-run tour will fire when /roadmap loads
          setTimeout(() => this.router.navigateByUrl('/onboarding'), 900);
        },
        error: (err) => {
          this.loading.set(false);
          const msg = errorMessage(err);
          this.errorText.set(msg);
          this.errorShown.set(true);
          if (err?.status === 409) {
            if (/username/i.test(msg)) {
              this.userState.set('invalid');
              this.unameKind.set('taken');
              this.unameText.set('That username is already taken');
              this.unameOk = false;
            } else if (/email/i.test(msg)) {
              this.emailState.set('invalid');
              this.emailMsgShow.set(true);
            }
          }
        },
      });
  }

  // ---- social (demo loading) ----
  social(provider: 'google' | 'github'): void {
    const flag = provider === 'google' ? this.googleLoading : this.githubLoading;
    if (flag()) return;
    flag.set(true);
    setTimeout(() => flag.set(false), 1600);
  }
}
