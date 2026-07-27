import { Component, HostListener, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { ThemeToggleComponent } from '../../shared/theme-toggle/theme-toggle.component';
import { LangSelectComponent } from '../../shared/lang-select/lang-select.component';
import { InsightTextComponent } from './insight-text.component';
import { InsightsStore } from './insights.store';
import { TranslatePipe } from '../../shared/translate.pipe';

@Component({
  selector: 'app-athena-insights',
  standalone: true,
  imports: [SidebarComponent, ThemeToggleComponent, LangSelectComponent, InsightTextComponent, TranslatePipe],
  templateUrl: './athena-insights.component.html',
})
export class AthenaInsightsComponent implements OnInit {
  private readonly sidebar = viewChild(SidebarComponent);
  private readonly store = inject(InsightsStore);

  readonly scrolled = signal(false);
  readonly showEmpty = signal(false);

  readonly loaded = this.store.loaded;
  readonly profile = this.store.profile;
  readonly greetingName = this.store.greetingName;
  readonly emptyState = computed(() => this.showEmpty() || this.store.newLearner());

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

  private revealAll(): void {
    document.querySelectorAll('.ai-root .reveal, .ai-root .letter').forEach((el) => el.classList.add('in'));
  }
}
