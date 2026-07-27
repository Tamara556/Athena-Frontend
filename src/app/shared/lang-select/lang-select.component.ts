import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { I18nService, LANGS, Lang } from '../../core/i18n';

@Component({
  selector: 'app-lang-select',
  standalone: true,
  template: `
    <div class="lang" [class.open]="open()">
      <button class="lang-trigger" type="button" (click)="toggle()" aria-haspopup="listbox" [attr.aria-expanded]="open()" title="Language">
        <svg class="globe" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>
        <span class="lang-code">{{ current().short }}</span>
        <svg class="chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      @if (open()) {
        <div class="lang-menu" role="listbox">
          @for (l of langs; track l.code) {
            <button class="lang-opt" type="button" role="option" [class.on]="l.code === lang()" [attr.aria-selected]="l.code === lang()" (click)="select(l.code)">
              <span class="lang-opt-short">{{ l.short }}</span>
              <span class="lang-opt-label">{{ l.label }}</span>
              @if (l.code === lang()) {
                <svg class="tick" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .lang{position:relative;flex-shrink:0}
    .lang-trigger{display:inline-flex;align-items:center;gap:7px;height:36px;padding:0 10px;border-radius:12px;border:1px solid var(--line);background:var(--glass);color:var(--ink-soft);cursor:pointer;transition:box-shadow .25s,border-color .25s,color .2s}
    .lang-trigger:hover{color:var(--ink);box-shadow:var(--shadow-sm)}
    .lang.open .lang-trigger{border-color:rgba(139,92,246,.4);box-shadow:0 0 0 4px rgba(139,92,246,.1);color:var(--ink)}
    .lang-code{font-family:var(--display);font-weight:600;font-size:13px;color:var(--ink);letter-spacing:.02em}
    .globe{flex-shrink:0}
    .chev{color:var(--ink-faint);transition:transform .25s}
    .lang.open .chev{transform:rotate(180deg)}

    .lang-menu{position:absolute;top:calc(100% + 8px);right:0;min-width:184px;z-index:200;display:flex;flex-direction:column;gap:2px;padding:6px;border-radius:var(--r-md);background:var(--glass-strong);backdrop-filter:blur(22px) saturate(1.5);-webkit-backdrop-filter:blur(22px) saturate(1.5);border:1px solid var(--line);box-shadow:var(--shadow-lg), inset 0 1px 0 rgba(255,255,255,.5);transform-origin:top right;animation:langMenu .34s cubic-bezier(.34,1.56,.64,1)}
    @keyframes langMenu{0%{opacity:0;transform:translateY(-14px) scale(.86)}60%{opacity:1}100%{opacity:1;transform:translateY(0) scale(1)}}
    .lang-opt{display:flex;align-items:center;gap:11px;width:100%;padding:9px 11px;border:none;border-radius:10px;background:none;cursor:pointer;color:var(--ink);text-align:left;transition:background .18s;opacity:0;animation:langOpt .42s cubic-bezier(.2,.9,.3,1) forwards}
    .lang-opt:nth-child(1){animation-delay:.05s}.lang-opt:nth-child(2){animation-delay:.1s}.lang-opt:nth-child(3){animation-delay:.15s}.lang-opt:nth-child(4){animation-delay:.2s}
    @keyframes langOpt{0%{opacity:0;transform:translateY(9px)}100%{opacity:1;transform:none}}
    .lang-opt:hover{background:rgba(139,92,246,.09)}
    .lang-opt-short{font-family:var(--mono);font-size:10px;letter-spacing:.06em;color:var(--ink-faint);min-width:26px}
    .lang-opt-label{flex:1;font-family:var(--display);font-weight:600;font-size:13.5px}
    .lang-opt.on{background:rgba(139,92,246,.12)}
    .lang-opt.on .lang-opt-short{color:var(--violet)}
    .tick{color:var(--violet);flex-shrink:0}
  `],
})
export class LangSelectComponent {
  private readonly i18n = inject(I18nService);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly lang = this.i18n.lang;
  readonly langs = LANGS;
  readonly open = signal(false);

  current(): { code: Lang; label: string; short: string } {
    return LANGS.find((entry) => entry.code === this.lang()) ?? LANGS[0];
  }

  toggle(): void {
    this.open.update((value) => !value);
  }

  select(lang: Lang): void {
    this.i18n.set(lang);
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
