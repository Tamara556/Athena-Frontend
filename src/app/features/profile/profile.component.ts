import { Component, HostListener, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';
import { LangSelectComponent } from '../../shared/lang-select/lang-select.component';
import { I18nService } from '../../core/i18n';
import { TranslatePipe } from '../../shared/translate.pipe';
import { ProfileStore } from './profile.store';
import { availabilityLabel, difficultyLabel, emphasize, formatMonthYear, insightIcon } from './profile.logic';
import { AthenaInsight, ProfileDialogKind } from './profile.models';
import { validateAvatar, validateFocus, validateGoal, validateName } from './profile.validation';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [SidebarComponent, ThemeToggleComponent, LangSelectComponent, TranslatePipe],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly sidebar = viewChild(SidebarComponent);
  private readonly avatarInput = viewChild<HTMLInputElement>('avatarInput');
  private readonly store = inject(ProfileStore);
  private readonly router = inject(Router);
  private readonly i18n = inject(I18nService);

  /** Bullet phrases from profile.logic mapped to translation keys. */
  private readonly bulletKeys: Record<string, string> = {
    'Practical exercises': 'profile.bullet.practicalEx',
    'Step-by-step progression': 'profile.bullet.stepByStep',
    'Visual explanations': 'profile.bullet.visualExpl',
    'Diagrams and mental models': 'profile.bullet.diagrams',
    'Worked examples': 'profile.bullet.workedEx',
    'In-depth reading': 'profile.bullet.inDepth',
    'Structured notes': 'profile.bullet.structNotes',
    'First-principles reasoning': 'profile.bullet.firstPrinc',
    'A blend of practice and theory': 'profile.bullet.blend',
  };

  private t(key: string): string {
    return this.i18n.translate(key);
  }

  readonly loaded = this.store.loaded;
  readonly identity = this.store.identity;
  readonly narrative = this.store.narrative;
  readonly direction = this.store.direction;
  readonly preferences = this.store.preferences;
  readonly insights = this.store.insights;
  readonly milestones = this.store.sortedMilestones;
  readonly styleBullets = this.store.styleBullets;
  readonly initials = this.store.initials;
  readonly avatarUrl = this.store.avatarUrl;
  readonly dialogBusy = this.store.dialogBusy;

  readonly scrolled = signal(false);
  readonly showEmpty = signal(false);
  readonly toastShow = signal(false);
  readonly toastTitle = signal('');
  readonly toastSub = signal('');

  readonly dialog = signal<ProfileDialogKind | null>(null);
  readonly formError = signal<string | null>(null);
  readonly firstName = signal('');
  readonly lastName = signal('');
  readonly primaryGoal = signal('');
  readonly currentFocus = signal('');
  readonly nextMilestone = signal('');
  readonly availability = signal('');

  readonly joinedLabel = computed(() => {
    const identity = this.identity();
    return identity ? formatMonthYear(identity.joinedAt) : '';
  });
  readonly whyLabel = computed(() => {
    const narrative = this.narrative();
    return narrative ? formatMonthYear(narrative.whyWrittenAt) : '';
  });

  readonly availabilityOptions: readonly { value: string; label: string }[] = [
    { value: '30m', label: '30 min' },
    { value: '1h', label: '1 hour' },
    { value: '2h', label: '2 hours' },
    { value: '4h', label: '4+ hours' },
  ];

  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      if (this.loaded()) {
        setTimeout(() => this.revealAll(), 40);
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => this.revealAll(), 60);
    this.store.load();
  }

  openDrawer(): void {
    this.sidebar()?.openDrawer();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  availabilityText(value: string): string {
    const translated = this.t('profile.avail.' + value);
    return translated === 'profile.avail.' + value ? availabilityLabel(value) : translated;
  }

  difficultyText(value: string): string {
    const translated = this.t('profile.diff.' + value);
    return translated === 'profile.diff.' + value ? difficultyLabel(value) : translated;
  }

  /** Translate a "how you learn best" bullet phrase (falls back to the phrase itself). */
  bulletText(bullet: string): string {
    const key = this.bulletKeys[bullet];
    return key ? this.t(key) : bullet;
  }

  monthYear(iso: string): string {
    return formatMonthYear(iso);
  }

  icon(kind: string): string {
    return insightIcon(kind);
  }

  parts(insight: AthenaInsight): { before: string; bold: string; after: string } {
    return emphasize(insight);
  }

  pickAvatar(): void {
    this.avatarInput()?.click();
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
      this.toast(this.t('settings.toast.uploadErr.t'), error);
      return;
    }
    this.store.uploadAvatar(file).subscribe({
      next: () => this.toast(this.t('settings.toast.photo.t'), this.t('settings.toast.photo.s')),
      error: (err) => this.toast(this.t('settings.toast.uploadErr.t'), this.errMsg(err)),
    });
  }

  openDialog(kind: ProfileDialogKind): void {
    this.formError.set(null);
    if (kind === 'profile') {
      const identity = this.identity();
      this.firstName.set(identity?.firstName ?? '');
      this.lastName.set(identity?.lastName ?? '');
    } else if (kind === 'goal') {
      const direction = this.direction();
      this.primaryGoal.set(direction?.primaryGoal ?? '');
      this.currentFocus.set(direction?.currentFocus ?? '');
      this.nextMilestone.set(direction?.nextMilestone ?? '');
    } else {
      this.availability.set(this.preferences()?.availability ?? '');
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
    } else if (kind === 'goal') {
      this.submitGoal();
    } else if (kind === 'availability') {
      this.submitAvailability();
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

  submitGoal(): void {
    const error = validateGoal(this.primaryGoal()) ?? validateFocus(this.currentFocus()) ?? validateFocus(this.nextMilestone());
    if (error) {
      this.formError.set(error);
      return;
    }
    this.store
      .updateDirection({
        primaryGoal: this.primaryGoal().trim(),
        currentFocus: this.currentFocus().trim(),
        nextMilestone: this.nextMilestone().trim(),
      })
      .subscribe({
        next: () => this.finishDialog(this.t('profile.toast.goal.t'), this.t('profile.toast.goal.s')),
        error: (err) => this.formError.set(this.errMsg(err)),
      });
  }

  submitAvailability(): void {
    const value = this.availability();
    if (!value) {
      this.formError.set(this.t('profile.err.chooseTime'));
      return;
    }
    this.store.updateAvailability(value).subscribe({
      next: () => this.finishDialog(this.t('profile.toast.avail.t'), this.t('profile.toast.avail.s')),
      error: (err) => this.formError.set(this.errMsg(err)),
    });
  }

  retakeOnboarding(): void {
    this.router.navigate(['/onboarding']);
  }

  toast(title: string, sub: string): void {
    this.toastTitle.set(title);
    this.toastSub.set(sub);
    this.toastShow.set(true);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastShow.set(false), 3000);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.closeDialog();
  }

  private finishDialog(title: string, sub: string): void {
    this.closeDialog();
    this.toast(title, sub);
  }

  private errMsg(err: unknown): string {
    const candidate = err as { error?: { message?: string }; message?: string };
    return candidate?.error?.message ?? candidate?.message ?? this.t('settings.err.generic');
  }

  private revealAll(): void {
    document.querySelectorAll('.pf-root .reveal:not(.in)').forEach((el) => el.classList.add('in'));
  }
}
