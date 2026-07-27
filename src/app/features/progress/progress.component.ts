import { Component, HostListener, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';
import { LangSelectComponent } from '../../shared/lang-select/lang-select.component';
import { ProgressStore } from './progress.store';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [SidebarComponent, ThemeToggleComponent, LangSelectComponent, TranslatePipe],
  templateUrl: './progress.component.html',
})
export class ProgressComponent implements OnInit {
  private readonly sidebar = viewChild(SidebarComponent);
  private readonly store = inject(ProgressStore);

  readonly scrolled = signal(false);
  readonly showEmpty = signal(false);
  readonly toastShow = signal(false);

  readonly loaded = this.store.loaded;
  readonly transform = this.store.transform;
  readonly highlights = this.store.highlights;
  readonly journey = this.store.journey;
  readonly observations = this.store.observations;
  readonly milestones = this.store.milestones;
  readonly future = this.store.future;
  readonly prompts = this.store.prompts;
  readonly promptIndex = this.store.promptIndex;
  readonly placeholder = this.store.placeholder;
  readonly draft = this.store.draft;
  readonly saving = this.store.saving;

  readonly emptyState = computed(() => this.showEmpty() || this.store.newLearner());

  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => {
      if (this.store.ready()) {
        setTimeout(() => this.revealAll(), 40);
      }
    });
  }

  ngOnInit(): void {
    setTimeout(() => this.revealAll(), 60);
  }

  openDrawer(): void {
    this.sidebar()?.openDrawer();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  selectPrompt(index: number): void {
    this.store.selectPrompt(index);
  }

  onDraft(event: Event): void {
    this.store.setDraft((event.target as HTMLTextAreaElement).value);
  }

  saveReflection(): void {
    this.store.save().subscribe(() => this.showToast());
  }

  private showToast(): void {
    this.toastShow.set(true);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toastShow.set(false), 3000);
  }

  private revealAll(): void {
    document.querySelectorAll('.pg-root .reveal').forEach((el) => el.classList.add('in'));
  }
}
