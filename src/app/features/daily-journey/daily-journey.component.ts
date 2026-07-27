import { Component, HostListener, OnInit, computed, inject, signal, viewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';
import { LangSelectComponent } from '../../shared/lang-select/lang-select.component';
import { DailyJourneyApiService } from './daily-journey-api.service';
import { AdjustAction, BlockType, BlockView, Confidence, DailyJourney, Difficulty, WhyReasoning } from './daily-journey.models';
import { I18nService } from '../../core/i18n';
import { TranslatePipe } from '../../shared/translate.pipe';

const BLOCK_ICON: Record<BlockType, string> = {
  READING: '📖', PRACTICE: '💻', VIDEO: '🎥', QUIZ: '🧠', SPEAKING: '🎤', REVIEW: '🗂', DRILL: '⚡',
};
const DIFF_COLOR: Record<Difficulty, string> = { EASY: '#34D399', MODERATE: '#FBBF24', CHALLENGING: '#FB7185' };
const CONFIDENCE: Confidence[] = ['CONFIDENT', 'UNSURE', 'NEED_HELP'];
const RING = 2 * Math.PI * 65;

@Component({
  selector: 'app-daily-journey',
  standalone: true,
  imports: [SidebarComponent, ThemeToggleComponent, LangSelectComponent, TranslatePipe],
  templateUrl: './daily-journey.component.html',
})
export class DailyJourneyComponent implements OnInit {
  private readonly sidebar = viewChild(SidebarComponent);
  private readonly api = inject(DailyJourneyApiService);
  private readonly i18n = inject(I18nService);

  private t(key: string, params?: Record<string, string | number>): string {
    return this.i18n.translate(key, params);
  }

  readonly journey = signal<DailyJourney | null>(null);
  readonly why = signal<WhyReasoning | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly busy = signal(false);

  readonly scrolled = signal(false);
  readonly editingTime = signal(false);
  readonly adjustOpen = signal(false);
  readonly mentorPending = signal(false);
  readonly toast = signal<{ show: boolean; title: string; sub: string }>({ show: false, title: '', sub: '' });
  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly ringDash = RING;

  readonly mission = computed(() => this.journey()?.mission ?? null);
  readonly blocks = computed(() => this.journey()?.blocks ?? []);
  readonly progress = computed(() => this.journey()?.progress ?? { completed: 0, total: 0 });
  readonly adjustments = computed(() => this.journey()?.adjustments ?? []);
  readonly weaknesses = computed(() => this.journey()?.weaknesses ?? []);
  readonly reflection = computed(() => this.journey()?.reflection ?? null);
  readonly lastCheckin = computed(() => this.journey()?.lastCheckin ?? null);
  readonly mentorReply = computed(() => this.lastCheckin()?.reply ?? null);
  readonly mentorSel = computed(() => {
    const confidence = this.lastCheckin()?.confidence;
    return confidence ? CONFIDENCE.indexOf(confidence) : null;
  });

  readonly remaining = computed(() => this.blocks().filter(b => b.status === 'UPCOMING' || b.status === 'CURRENT').length);
  readonly currentBlock = computed(() => this.blocks().find(b => b.status === 'CURRENT') ?? null);

  readonly dateLabel = computed(() => {
    const date = this.journey()?.date;
    if (!date) {
      return '';
    }
    return new Date(`${date}T00:00:00`).toLocaleDateString(this.i18n.lang(), { weekday: 'long', month: 'long', day: 'numeric' });
  });
  readonly ringOffset = computed(() => {
    const p = this.progress();
    return RING * (1 - (p.total ? p.completed / p.total : 0));
  });
  readonly dayPercent = computed(() => {
    const p = this.progress();
    return p.total ? Math.round((p.completed / p.total) * 100) : 0;
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.today().subscribe({
      next: journey => {
        this.journey.set(journey);
        this.loading.set(false);
        setTimeout(() => this.reveal(), 60);
        this.loadWhy();
      },
      error: err => {
        this.error.set(this.errMsg(err));
        this.loading.set(false);
      },
    });
  }

  begin(): void {
    this.apply(this.api.startDay());
    this.showToast(this.t('dj.toast.started'), this.mission()?.title ?? '');
  }

  toggleAdjust(): void {
    this.adjustOpen.update(open => !open);
  }

  adjust(action: AdjustAction): void {
    this.adjustOpen.set(false);
    this.apply(this.api.adjustPlan(action));
    this.showToast(this.t('dj.toast.planUpdated'), this.t(action === 'REGENERATE' ? 'dj.toast.rebuilding' : 'dj.toast.adjusted'));
  }

  editTime(): void {
    this.editingTime.set(true);
  }

  saveTime(value: string): void {
    this.editingTime.set(false);
    const minutes = parseInt(value, 10);
    if (!minutes || minutes < 15) {
      return;
    }
    this.apply(this.api.adjustTime(minutes));
  }

  meta(type: BlockType): { icon: string; label: string } {
    return { icon: BLOCK_ICON[type], label: this.t('dj.block.' + type.toLowerCase()) };
  }

  diffColor(difficulty: Difficulty): string {
    return DIFF_COLOR[difficulty];
  }

  diffLabel(difficulty: Difficulty): string {
    return this.t('dj.diff.' + difficulty.toLowerCase());
  }

  durationLabel(block: BlockView): string {
    const dur = `${block.durationMinutes} ${this.t('dj.min')}`;
    return block.status === 'COMPLETED' ? `${this.t('dj.done')} · ${dur}` : dur;
  }

  fmtMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins}m`;
    }
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
  }

  startBlock(block: BlockView): void {
    this.apply(this.api.startBlock(block.id));
    this.showToast(this.t('dj.toast.opened'), `${block.title} · ${block.durationMinutes} ${this.t('dj.min')}`);
  }

  completeBlock(block: BlockView): void {
    this.apply(this.api.complete(block.id));
  }

  skipBlock(block: BlockView): void {
    this.apply(this.api.skip(block.id, null));
  }

  relinkBlock(block: BlockView): void {
    this.apply(this.api.relink(block.id));
    this.showToast(this.t('dj.toast.addedBack'), this.t('dj.toast.addedBackSub', { title: block.title }));
  }

  strengthen(knowledgeNodeId: string): void {
    this.apply(this.api.strengthen(knowledgeNodeId));
    this.showToast(this.t('dj.toast.drill'), this.t('dj.toast.drillSub'));
  }

  continueMission(): void {
    document.querySelector('.dj-root .blocks')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  pickMentor(index: number): void {
    this.mentorPending.set(true);
    this.api.checkin(CONFIDENCE[index], this.currentBlock()?.id ?? null).subscribe({
      next: journey => {
        this.journey.set(journey);
        this.mentorPending.set(false);
      },
      error: err => {
        this.mentorPending.set(false);
        this.showToast(this.t('dj.toast.couldNotSave'), this.errMsg(err));
      },
    });
  }

  saveReflection(hardest: string, clicked: string, adjust: string): void {
    this.apply(this.api.saveReflection(hardest, clicked, adjust));
    this.showToast(this.t('dj.toast.reflSaved'), this.t('dj.toast.reflSavedSub'));
  }

  skipReflection(): void {
    this.apply(this.api.skipReflection());
    this.showToast(this.t('dj.toast.noWorries'), this.t('dj.toast.reflSkipped'));
  }

  relTime(iso: string): string {
    const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
    if (mins < 1) {
      return this.t('dj.rel.justNow');
    }
    if (mins < 60) {
      return this.t('dj.rel.minAgo', { n: mins });
    }
    const hours = Math.round(mins / 60);
    if (hours < 24) {
      return this.t('dj.rel.hrAgo', { n: hours });
    }
    return this.t('dj.rel.dayAgo', { n: Math.round(hours / 24) });
  }

  openDrawer(): void {
    this.sidebar()?.openDrawer();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  private loadWhy(): void {
    this.api.why().subscribe({ next: reasoning => this.why.set(reasoning), error: () => undefined });
  }

  private apply(request: Observable<DailyJourney>): void {
    this.busy.set(true);
    request.subscribe({
      next: journey => {
        this.journey.set(journey);
        this.busy.set(false);
      },
      error: err => {
        this.busy.set(false);
        this.showToast(this.t('dj.toast.wrong'), this.errMsg(err));
      },
    });
  }

  private reveal(): void {
    document.querySelectorAll('.dj-root .reveal').forEach(el => el.classList.add('in'));
  }

  private errMsg(err: unknown): string {
    const candidate = err as { error?: { message?: string }; message?: string };
    return candidate?.error?.message ?? candidate?.message ?? this.t('dj.err.generic');
  }

  private showToast(title: string, sub: string): void {
    this.toast.set({ show: true, title, sub });
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.update(t => ({ ...t, show: false })), 3400);
  }
}
