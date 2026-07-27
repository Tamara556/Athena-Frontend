import { Component, HostListener, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';
import { LangSelectComponent } from '../../shared/lang-select/lang-select.component';
import { Session } from '../../core/session';
import { I18nService } from '../../core/i18n';
import { TranslatePipe } from '../../shared/translate.pipe';
import { Device, LoginActivity, SettingsApi, TwoFactorSetup } from './settings.api';
import { SettingsStore } from './settings.store';
import { validateAvatar, validateEmail, validateName, validatePassword, validateRequired } from './settings.validation';

type DialogKind = 'profile' | 'email' | 'password';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [SidebarComponent, ThemeToggleComponent, LangSelectComponent, TranslatePipe],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  private readonly sidebar = viewChild(SidebarComponent);
  private readonly store = inject(SettingsStore);
  private readonly session = inject(Session);
  private readonly api = inject(SettingsApi);
  private readonly i18n = inject(I18nService);

  /** Short helper for translating a key from component code (toasts, labels). */
  private t(key: string): string {
    return this.i18n.translate(key);
  }

  readonly activityShow = signal(false);
  readonly activityLoading = signal(false);
  readonly activityError = signal(false);
  readonly activity = signal<LoginActivity[]>([]);

  readonly devicesShow = signal(false);
  readonly devicesLoading = signal(false);
  readonly devicesError = signal(false);
  readonly devices = signal<Device[]>([]);
  readonly deviceBusy = signal<string | null>(null);

  readonly tfaShow = signal(false);
  readonly tfaLoading = signal(false);
  readonly tfaBusy = signal(false);
  readonly tfaEnabled = signal(false);
  /** Non-null once a code has been texted — this drives the switch to the code-entry step. */
  readonly tfaSetup = signal<TwoFactorSetup | null>(null);
  readonly tfaError = signal<string | null>(null);
  readonly tfaCode = signal('');
  readonly tfaPhone = signal('');
  /** Masked number the account is enrolled with (when 2FA is already on). */
  readonly tfaEnrolledPhone = signal<string | null>(null);

  readonly loaded = this.store.loaded;
  readonly saving = this.store.saving;
  readonly dirty = this.store.dirty;
  readonly segs = this.store.segs;
  readonly togs = this.store.togs;
  readonly account = this.store.account;
  readonly dialogBusy = this.store.dialogBusy;

  readonly scrolled = signal(false);
  readonly modalShow = signal(false);
  readonly toastShow = signal(false);
  readonly toastTitle = signal('');
  readonly toastSub = signal('');

  readonly dialog = signal<DialogKind | null>(null);
  readonly formError = signal<string | null>(null);
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly newEmail = signal('');
  readonly emailPassword = signal('');
  readonly currentPassword = signal('');
  readonly newPassword = signal('');

  readonly displayName = computed(() => {
    const account = this.account();
    return account ? `${account.firstName} ${account.lastName}`.trim() : this.session.name() ?? 'Your account';
  });
  readonly email = computed(() => this.account()?.email ?? '');
  readonly initials = computed(() => this.displayName()
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join(''));
  readonly avatarUrl = this.session.image;

  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      if (this.store.loaded()) {
        setTimeout(() => this.revealAll(), 40);
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => this.revealAll(), 60);
    this.store.load();
    this.store.loadAccount();
  }

  openDrawer(): void {
    this.sidebar()?.openDrawer();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  selectSeg(group: string, val: string): void {
    this.store.selectSeg(group, val);
  }

  toggle(key: string): void {
    this.store.toggle(key);
  }

  save(): void {
    this.store.save().subscribe({
      next: () => this.showToast(this.t('settings.toast.saved.t'), this.t('settings.toast.saved.s')),
      error: () => this.showToast(this.t('settings.toast.saveErr.t'), this.t('settings.toast.err.s')),
    });
  }

  discard(): void {
    this.store.discard();
  }

  openDialog(kind: DialogKind): void {
    this.formError.set(null);
    const account = this.account();
    if (kind === 'profile') {
      this.firstName.set(account?.firstName ?? '');
      this.lastName.set(account?.lastName ?? '');
    } else if (kind === 'email') {
      this.newEmail.set('');
      this.emailPassword.set('');
    } else {
      this.currentPassword.set('');
      this.newPassword.set('');
    }
    this.dialog.set(kind);
  }

  closeDialog(): void {
    this.dialog.set(null);
  }

  submit(): void {
    const kind = this.dialog();
    if (kind === 'profile') {
      this.submitProfile();
    } else if (kind === 'email') {
      this.submitEmail();
    } else if (kind === 'password') {
      this.submitPassword();
    }
  }

  submitProfile(): void {
    const error = validateName(this.firstName()) ?? validateName(this.lastName());
    if (error) {
      this.formError.set(error);
      return;
    }
    this.store.updateProfile(this.firstName().trim(), this.lastName().trim()).subscribe({
      next: () => this.finishDialog(this.t('settings.toast.profile.t'), this.t('settings.toast.profile.s')),
      error: (err) => this.formError.set(this.errMsg(err)),
    });
  }

  submitEmail(): void {
    const error = validateEmail(this.newEmail()) ?? validateRequired(this.emailPassword());
    if (error) {
      this.formError.set(error);
      return;
    }
    this.store.changeEmail(this.newEmail().trim(), this.emailPassword()).subscribe({
      next: () => this.finishDialog(this.t('settings.toast.email.t'), this.t('settings.toast.email.s')),
      error: (err) => this.formError.set(this.errMsg(err)),
    });
  }

  submitPassword(): void {
    const error = validateRequired(this.currentPassword()) ?? validatePassword(this.newPassword());
    if (error) {
      this.formError.set(error);
      return;
    }
    this.store.changePassword(this.currentPassword(), this.newPassword()).subscribe({
      next: () => this.finishDialog(this.t('settings.toast.password.t'), this.t('settings.toast.password.s')),
      error: (err) => this.formError.set(this.errMsg(err)),
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    const error = validateAvatar(file);
    if (error) {
      this.showToast(this.t('settings.toast.uploadErr.t'), error);
      return;
    }
    this.store.uploadAvatar(file).subscribe({
      next: () => this.showToast(this.t('settings.toast.photo.t'), this.t('settings.toast.photo.s')),
      error: (err) => this.showToast(this.t('settings.toast.uploadErr.t'), this.errMsg(err)),
    });
  }

  openDevices(): void {
    this.devicesShow.set(true);
    this.loadDevices();
  }

  closeDevices(): void {
    this.devicesShow.set(false);
  }

  private loadDevices(): void {
    this.devicesLoading.set(true);
    this.devicesError.set(false);
    this.api.getDevices(this.session.sessionId()).subscribe({
      next: (list) => {
        this.devices.set(list);
        this.devicesLoading.set(false);
      },
      error: () => {
        this.devicesError.set(true);
        this.devicesLoading.set(false);
      },
    });
  }

  revokeDevice(device: Device): void {
    if (this.deviceBusy()) {
      return;
    }
    this.deviceBusy.set(device.id);
    this.api.revokeDevice(device.id).subscribe({
      next: () => {
        this.deviceBusy.set(null);
        if (device.current) {
          // Signed out the device we're on — end the local session too.
          this.session.clear();
          window.location.href = '/login';
          return;
        }
        this.devices.update((list) => list.filter((d) => d.id !== device.id));
        this.showToast(this.t('settings.toast.deviceOut.t'), this.t('settings.toast.deviceOut.s'));
      },
      error: () => {
        this.deviceBusy.set(null);
        this.showToast(this.t('settings.toast.signoutErr.t'), this.t('settings.toast.err.s'));
      },
    });
  }

  revokeOtherDevices(): void {
    if (this.deviceBusy()) {
      return;
    }
    this.deviceBusy.set('others');
    this.api.revokeOtherDevices(this.session.sessionId()).subscribe({
      next: () => {
        this.deviceBusy.set(null);
        this.devices.update((list) => list.filter((d) => d.current));
        this.showToast(this.t('settings.toast.signoutOthers.t'), this.t('settings.toast.signoutOthers.s'));
      },
      error: () => {
        this.deviceBusy.set(null);
        this.showToast(this.t('settings.toast.signoutErr.t'), this.t('settings.toast.err.s'));
      },
    });
  }

  hasOtherDevices(): boolean {
    return this.devices().some((d) => !d.current);
  }

  openLoginActivity(): void {
    this.activityShow.set(true);
    this.activityLoading.set(true);
    this.activityError.set(false);
    this.api.getLoginActivity().subscribe({
      next: (list) => {
        this.activity.set(list);
        this.activityLoading.set(false);
      },
      error: () => {
        this.activityError.set(true);
        this.activityLoading.set(false);
      },
    });
  }

  closeActivity(): void {
    this.activityShow.set(false);
  }

  deviceLabel(userAgent: string | null): string {
    if (!userAgent) {
      return this.t('settings.common.unknownDevice');
    }
    const browser = /Edg/.test(userAgent) ? 'Edge'
      : /Chrome/.test(userAgent) ? 'Chrome'
      : /Firefox/.test(userAgent) ? 'Firefox'
      : /Safari/.test(userAgent) ? 'Safari'
      : 'Browser';
    const os = /Windows/.test(userAgent) ? 'Windows'
      : /Mac OS X|Macintosh/.test(userAgent) ? 'macOS'
      : /Android/.test(userAgent) ? 'Android'
      : /iPhone|iPad|iOS/.test(userAgent) ? 'iOS'
      : /Linux/.test(userAgent) ? 'Linux'
      : '';
    return os ? `${browser} on ${os}` : browser;
  }

  formatWhen(iso: string): string {
    const date = new Date(iso);
    return Number.isNaN(date.getTime())
      ? ''
      : date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  readonly exporting = signal(false);

  downloadData(): void {
    if (this.exporting()) {
      return;
    }
    this.exporting.set(true);
    this.api.exportData().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'athena-data-export.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
        this.showToast(this.t('settings.toast.dataReady.t'), this.t('settings.toast.dataReady.s'));
      },
      error: () => {
        this.exporting.set(false);
        this.showToast(this.t('settings.toast.exportErr.t'), this.t('settings.toast.exportErr.s'));
      },
    });
  }

  openTwoFactor(): void {
    this.tfaShow.set(true);
    this.tfaLoading.set(true);
    this.tfaError.set(null);
    this.tfaSetup.set(null);
    this.tfaCode.set('');
    this.tfaPhone.set('');
    this.tfaEnrolledPhone.set(null);
    this.api.getTwoFactorStatus().subscribe({
      next: (status) => {
        this.tfaEnabled.set(status.enabled);
        this.tfaEnrolledPhone.set(status.phoneNumber);
        this.tfaLoading.set(false);
      },
      error: () => {
        this.tfaError.set('Could not load two-factor status.');
        this.tfaLoading.set(false);
      },
    });
  }

  closeTwoFactor(): void {
    this.tfaShow.set(false);
  }

  /** Step 1 (enable): text a code to the phone number the user entered. */
  startTwoFactorSetup(phone: string): void {
    const trimmed = phone.trim();
    if (!/^\+?[0-9]{8,15}$/.test(trimmed)) {
      this.tfaError.set('Enter a valid phone number (8–15 digits, optional +).');
      return;
    }
    this.tfaBusy.set(true);
    this.tfaError.set(null);
    this.api.setupTwoFactor(trimmed).subscribe({
      next: (setup) => {
        this.tfaSetup.set(setup);
        this.tfaCode.set('');
        this.tfaBusy.set(false);
      },
      error: (err) => {
        this.tfaError.set(this.errMsg(err));
        this.tfaBusy.set(false);
      },
    });
  }

  /** Step 1 (disable): text a fresh code to the enrolled phone. */
  startTwoFactorDisable(): void {
    this.tfaBusy.set(true);
    this.tfaError.set(null);
    this.api.sendDisableCode().subscribe({
      next: (setup) => {
        this.tfaSetup.set(setup);
        this.tfaCode.set('');
        this.tfaBusy.set(false);
      },
      error: (err) => {
        this.tfaError.set(this.errMsg(err));
        this.tfaBusy.set(false);
      },
    });
  }

  confirmEnable(code: string): void {
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      this.tfaError.set('Enter the 6-digit code we texted you.');
      return;
    }
    this.tfaBusy.set(true);
    this.tfaError.set(null);
    this.api.enableTwoFactor(trimmed).subscribe({
      next: () => {
        this.tfaEnabled.set(true);
        this.tfaSetup.set(null);
        this.tfaCode.set('');
        this.tfaBusy.set(false);
        this.tfaShow.set(false);
        this.showToast(this.t('settings.toast.twofaOn.t'), this.t('settings.toast.twofaOn.s'));
      },
      error: (err) => {
        this.tfaError.set(this.errMsg(err));
        this.tfaBusy.set(false);
      },
    });
  }

  confirmDisable(code: string): void {
    const trimmed = code.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      this.tfaError.set('Enter the 6-digit code we texted you to turn it off.');
      return;
    }
    this.tfaBusy.set(true);
    this.tfaError.set(null);
    this.api.disableTwoFactor(trimmed).subscribe({
      next: () => {
        this.tfaEnabled.set(false);
        this.tfaSetup.set(null);
        this.tfaCode.set('');
        this.tfaBusy.set(false);
        this.tfaShow.set(false);
        this.showToast(this.t('settings.toast.twofaOff.t'), this.t('settings.toast.twofaOff.s'));
      },
      error: (err) => {
        this.tfaError.set(this.errMsg(err));
        this.tfaBusy.set(false);
      },
    });
  }

  openModal(): void {
    this.modalShow.set(true);
  }

  closeModal(): void {
    this.modalShow.set(false);
  }

  confirmDelete(): void {
    this.closeModal();
    this.showToast(this.t('settings.toast.historyCleared.t'), this.t('settings.toast.historyCleared.s'));
  }

  showToast(title: string, sub: string): void {
    this.toastTitle.set(title);
    this.toastSub.set(sub);
    this.toastShow.set(true);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastShow.set(false), 3000);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.closeModal();
    this.closeDialog();
    this.closeActivity();
    this.closeTwoFactor();
    this.closeDevices();
  }

  private finishDialog(title: string, sub: string): void {
    this.closeDialog();
    this.showToast(title, sub);
  }

  private errMsg(err: unknown): string {
    const candidate = err as { error?: { message?: string }; message?: string };
    return candidate?.error?.message ?? candidate?.message ?? this.t('settings.err.generic');
  }

  private revealAll(): void {
    document.querySelectorAll('.set-root .reveal:not(.in)').forEach((el) => el.classList.add('in'));
  }
}
