import { NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { Theme, ThemeService } from '../../core/theme';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <div class="theme-dd" [class.open]="open()">
      <button class="theme-trigger" type="button" (click)="toggle()" aria-haspopup="listbox" [attr.aria-expanded]="open()" title="Theme">
        @switch (theme()) {
          @case ('light') { <ng-container [ngTemplateOutlet]="sun"></ng-container> }
          @case ('dark') { <ng-container [ngTemplateOutlet]="moon"></ng-container> }
          @case ('pink') { <ng-container [ngTemplateOutlet]="heart"></ng-container> }
        }
        <svg class="chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      @if (open()) {
        <div class="theme-menu" role="listbox">
          <button class="theme-opt" type="button" role="option" [class.on]="theme() === 'light'" [attr.aria-selected]="theme() === 'light'" (click)="select('light')">
            <ng-container [ngTemplateOutlet]="sun"></ng-container><span class="theme-opt-label">Light</span>@if (theme() === 'light') { <svg class="tick" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
          </button>
          <button class="theme-opt" type="button" role="option" [class.on]="theme() === 'dark'" [attr.aria-selected]="theme() === 'dark'" (click)="select('dark')">
            <ng-container [ngTemplateOutlet]="moon"></ng-container><span class="theme-opt-label">Dark</span>@if (theme() === 'dark') { <svg class="tick" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
          </button>
          <button class="theme-opt" type="button" role="option" [class.on]="theme() === 'pink'" [attr.aria-selected]="theme() === 'pink'" (click)="select('pink')">
            <ng-container [ngTemplateOutlet]="heart"></ng-container><span class="theme-opt-label">Baby Pink</span>@if (theme() === 'pink') { <svg class="tick" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> }
          </button>
        </div>
      }
    </div>

    <ng-template #sun><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></ng-template>
    <ng-template #moon><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg></ng-template>
    <ng-template #heart><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-6.7-4.2-9.3-8.4C1.1 9.7 2.6 6 6 6c1.9 0 3.2 1.1 4 2.2C10.8 7.1 12.1 6 14 6c3.4 0 4.9 3.7 3.3 6.6C18.7 16.8 12 21 12 21z"/></svg></ng-template>
  `,
  imports: [NgTemplateOutlet],
  styles: [`
    .theme-dd{position:relative;flex-shrink:0}
    .theme-trigger{display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 10px;border-radius:12px;border:1px solid var(--line);background:var(--glass);color:var(--ink-soft);cursor:pointer;transition:box-shadow .25s,border-color .25s,color .2s}
    .theme-trigger:hover{color:var(--ink);box-shadow:var(--shadow-sm)}
    .theme-dd.open .theme-trigger{border-color:rgba(139,92,246,.4);box-shadow:0 0 0 4px rgba(139,92,246,.1);color:var(--ink)}
    .chev{color:var(--ink-faint);transition:transform .25s}
    .theme-dd.open .chev{transform:rotate(180deg)}

    .theme-menu{position:absolute;top:calc(100% + 8px);right:0;min-width:184px;z-index:200;display:flex;flex-direction:column;gap:2px;padding:6px;border-radius:var(--r-md);background:var(--glass-strong);backdrop-filter:blur(22px) saturate(1.5);-webkit-backdrop-filter:blur(22px) saturate(1.5);border:1px solid var(--line);box-shadow:var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,.5);transform-origin:top right;animation:themeMenu .34s cubic-bezier(.34,1.56,.64,1)}
    @keyframes themeMenu{0%{opacity:0;transform:translateY(-14px) scale(.86)}60%{opacity:1}100%{opacity:1;transform:translateY(0) scale(1)}}
    .theme-opt{display:flex;align-items:center;gap:11px;width:100%;padding:9px 11px;border:none;border-radius:10px;background:none;cursor:pointer;color:var(--ink);text-align:left;transition:background .18s;opacity:0;animation:themeOpt .42s cubic-bezier(.2,.9,.3,1) forwards}
    .theme-opt:nth-child(1){animation-delay:.05s}.theme-opt:nth-child(2){animation-delay:.1s}.theme-opt:nth-child(3){animation-delay:.15s}
    @keyframes themeOpt{0%{opacity:0;transform:translateY(9px)}100%{opacity:1;transform:none}}
    .theme-opt:hover{background:rgba(139,92,246,.09)}
    .theme-opt svg:first-child{color:var(--ink-soft);flex-shrink:0}
    .theme-opt-label{flex:1;font-family:var(--display);font-weight:600;font-size:13.5px}
    .theme-opt.on{background:rgba(139,92,246,.12)}
    .theme-opt.on svg:first-child{color:var(--violet)}
    .tick{color:var(--violet);flex-shrink:0}
  `],
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly theme = this.themeService.theme;
  readonly open = signal(false);

  toggle(): void {
    this.open.update((value) => !value);
  }

  select(theme: Theme): void {
    this.themeService.set(theme);
    this.open.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.open() && !this.host.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.open.set(false);
  }
}
