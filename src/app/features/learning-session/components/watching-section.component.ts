import { Component, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { WatchingMaterial } from '../learning-session.models';
import { YoutubeSearchService } from '../youtube-search.service';

@Component({
  selector: 'app-watching-section',
  standalone: true,
  styles: [`
    :host{display:contents}
    .video-scrim{position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:24px;
      background:rgba(10,8,20,.72);backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .22s ease}
    .video-scrim.show{opacity:1;pointer-events:auto}
    .video-modal{width:min(920px,100%);background:var(--glass-strong,#fff);border:1px solid var(--line);
      border-radius:18px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.4);transform:translateY(12px) scale(.98);
      transition:transform .24s cubic-bezier(.34,1.56,.64,1)}
    .video-scrim.show .video-modal{transform:none}
    .video-frame{position:relative;width:100%;aspect-ratio:16/9;background:#000}
    .video-frame iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
    .video-msg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:14px;text-align:center;padding:24px;color:#e7e2f0}
    .video-msg p{margin:0;font-family:var(--display);font-weight:600;font-size:15px}
    .video-msg small{color:#a99fc0;font-size:12.5px;max-width:420px;line-height:1.5}
    .video-msg a{color:#fff;font-size:13px;text-decoration:underline}
    .v-spin{width:34px;height:34px;border-radius:50%;border:3px solid rgba(255,255,255,.2);
      border-top-color:#fff;animation:vspin .9s linear infinite}
    @keyframes vspin{to{transform:rotate(360deg)}}
    .video-foot{display:flex;align-items:center;gap:12px;padding:13px 16px}
    .video-foot h4{margin:0;flex:1;min-width:0;font-family:var(--display);font-weight:600;font-size:14.5px;
      color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .video-foot a{font-size:12.5px;color:var(--ink-faint);text-decoration:none;white-space:nowrap}
    .video-foot a:hover{color:var(--ink)}
    .video-foot .x{width:32px;height:32px;border-radius:9px;display:grid;place-items:center;cursor:pointer;
      background:var(--glass);border:1px solid var(--line);color:var(--ink)}
  `],
  template: `
    <section class="stage" [class.active]="active()" role="tabpanel" aria-label="Watching stage">
      <div class="stage-head">
        <span class="stage-badge sb-watch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 9 5 3-5 3V9z" fill="currentColor" stroke="none"/></svg></span>
        <div><h2>Watch &amp; Observe</h2><p>See the concepts in motion. Athena picked the clearest short explainers.</p></div>
      </div>

      <div class="card-grid">
        @for (w of watchings(); track w.id; let i = $index) {
          <article class="lcard" [class.checked]="checked()[i]">
            <button class="thumb" type="button" [attr.aria-label]="'Play: ' + w.title" (click)="play(w)"
                    [style.background-image]="w.videoId ? 'url(https://img.youtube.com/vi/' + w.videoId + '/hqdefault.jpg)' : null"
                    [style.background-size]="'cover'" [style.background-position]="'center'"
                    [style.background-color]="i % 2 === 0 ? null : '#193a44'">
              <span class="glyph"></span>
              <span class="play"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
              <span class="dur">{{ w.estimatedMinutes }} min</span>
            </button>
            <h3>{{ w.title }}</h3>
            <p class="excerpt">{{ w.description }}</p>
            <div class="lcard-foot">
              <span class="src"><span class="savatar">AT</span>Athena Studio</span>
              <label class="checkbox">
                <input type="checkbox" [checked]="checked()[i]" (change)="toggle(i)">
                <span class="box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg></span>Watched
              </label>
            </div>
          </article>
        }
      </div>

      <div class="stage-foot">
        <div class="left"><span class="si"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m10 9 5 3-5 3V9z"/></svg></span><span>Watch at your pace — speed it up if it clicks.</span></div>
        <div class="actions">
          <button class="btn btn-glass" type="button" (click)="back.emit()">Back</button>
          <button class="btn btn-primary" type="button" (click)="complete.emit()">Mark watching complete <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        </div>
      </div>
    </section>

    <div class="video-scrim" [class.show]="!!playing()" role="dialog" aria-modal="true"
         (click)="$event.target === $event.currentTarget && close()">
      @if (playing(); as w) {
        <div class="video-modal">
          <div class="video-frame">
            @if (resolving()) {
              <div class="video-msg"><span class="v-spin"></span><p>Finding the best video…</p></div>
            } @else if (embedUrl(); as url) {
              <iframe [src]="url" title="Video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            } @else {
              <div class="video-msg">
                <p>Couldn’t load this video here</p>
                <small>{{ unavailableReason() }}</small>
                <a [href]="youtubeSearch(w)" target="_blank" rel="noopener">Watch it on YouTube →</a>
              </div>
            }
          </div>
          <div class="video-foot">
            <h4>{{ w.title }}</h4>
            <a [href]="youtubeSearch(w)" target="_blank" rel="noopener">Not playing? Open on YouTube →</a>
            <span class="x" role="button" tabindex="0" aria-label="Close" (click)="close()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </span>
          </div>
        </div>
      }
    </div>
  `,
})
export class WatchingSectionComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly youtube = inject(YoutubeSearchService);

  readonly watchings = input<WatchingMaterial[]>([]);
  readonly active = input(false);
  readonly complete = output<void>();
  readonly back = output<void>();

  readonly checked = signal<boolean[]>([]);
  readonly playing = signal<WatchingMaterial | null>(null);
  readonly resolving = signal(false);
  /** The video id we'll actually embed (from the API search, or the stored id as a fallback). */
  private readonly resolvedId = signal<string | null>(null);

  readonly embedUrl = computed<SafeResourceUrl | null>(() => {
    const id = this.resolvedId();
    if (!id) {
      return null;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`);
  });

  readonly unavailableReason = computed(() =>
    this.youtube.enabled
      ? 'No embeddable video was found for this topic.'
      : 'Add a YouTube Data API key to play videos in-site. For now, watch it on YouTube.');

  toggle(i: number): void {
    const next = [...this.checked()];
    next[i] = !next[i];
    this.checked.set(next);
  }

  play(w: WatchingMaterial): void {
    this.playing.set(w);
    this.resolvedId.set(null);
    this.resolving.set(false);

    // Prefer a live YouTube search (guaranteed real, embeddable) over the model's guessed id.
    if (this.youtube.enabled) {
      this.resolving.set(true);
      this.youtube.searchVideoId(w.videoQuery || w.title).subscribe({
        next: (id) => {
          if (this.playing() !== w) {
            return; // user moved on / closed
          }
          this.resolvedId.set(id ?? w.videoId?.trim() ?? null);
          this.resolving.set(false);
        },
        error: () => {
          if (this.playing() !== w) {
            return;
          }
          this.resolvedId.set(w.videoId?.trim() ?? null);
          this.resolving.set(false);
        },
      });
      return;
    }

    // No API key: best effort with the model-provided id (may be unavailable).
    this.resolvedId.set(w.videoId?.trim() ?? null);
  }

  close(): void {
    this.playing.set(null);
    this.resolving.set(false);
    this.resolvedId.set(null);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.playing()) {
      this.close();
    }
  }

  youtubeSearch(w: WatchingMaterial): string {
    return 'https://www.youtube.com/results?search_query=' + encodeURIComponent(w.videoQuery);
  }
}
