import { Component, computed, effect, input, output, signal } from '@angular/core';
import { PracticeActivity, PracticeType } from '../learning-session.models';

type PView = 'code' | 'lang' | 'biz' | 'create' | 'reflect';

const VIEW_BY_TYPE: Record<PracticeType, PView> = {
  CODE_EDITOR: 'code',
  LANGUAGE_EXERCISE: 'lang',
  SCENARIO: 'biz',
  CREATIVE_PROMPT: 'create',
  REFLECTION: 'reflect',
};

interface ConsoleLine {
  html: string;
  delay: number;
}

@Component({
  selector: 'app-practice-section',
  standalone: true,
  styles: [':host{display:contents}'],
  template: `
    <section class="stage" [class.active]="active()" role="tabpanel" aria-label="Practice stage">
      <div class="stage-head">
        <span class="stage-badge sb-practice"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6-6 6 6 6M16 6l6 6-6 6"/></svg></span>
        <div><h2>Practice</h2><p>Athena adapts the workspace to what you're learning.</p></div>
      </div>

      <div class="practice-switch" role="tablist" aria-label="Practice mode">
        <button class="pchip" type="button" [class.on]="view() === 'code'" (click)="view.set('code')"><span class="pemoji">💻</span> Code workspace</button>
        <button class="pchip" type="button" [class.on]="view() === 'lang'" (click)="view.set('lang')"><span class="pemoji">🗣️</span> Language</button>
        <button class="pchip" type="button" [class.on]="view() === 'biz'" (click)="view.set('biz')"><span class="pemoji">📊</span> Business</button>
        <button class="pchip" type="button" [class.on]="view() === 'create'" (click)="view.set('create')"><span class="pemoji">🎨</span> Creative</button>
        <button class="pchip" type="button" [class.on]="view() === 'reflect'" (click)="view.set('reflect')"><span class="pemoji">🧭</span> Reflection</button>
      </div>

      <!-- CODE -->
      <div class="pview" [class.on]="view() === 'code'">
        <div class="workbench">
          <aside class="instr">
            <span class="eyebrow">Challenge</span>
            <h3>{{ p()?.title || 'Build it' }}</h3>
            <p>{{ p()?.description || 'Apply what you just learned in a small hands-on task.' }}</p>
            <ol>
              @if (steps().length) {
                @for (s of steps(); track $index) { <li>{{ s }}</li> }
              } @else {
                <li>Annotate the class as a REST controller.</li>
                <li>Map a GET request to your endpoint.</li>
                <li>Return a list so Spring serializes it to JSON.</li>
              }
            </ol>
            <div class="goal"><b>Goal:</b> a green run with your output.</div>
          </aside>

          <div class="editor" tabindex="0" aria-label="Code editor">
            <div class="editor-bar">
              <span class="traffic"><i></i><i></i><i></i></span>
              <span class="editor-file">TaskController.java</span>
              <span class="editor-actions">
                <button class="ed-btn ed-reset" type="button" (click)="reset()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>Reset</button>
                <button class="ed-btn ed-run" type="button" (click)="run()"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>Run</button>
              </span>
            </div>
            <div class="code">
              <div class="gutter" aria-hidden="true">@for (n of gutter(); track n) { <span>{{ n }}</span> }</div>
              @if (starter()) {
                <pre class="code-body">{{ starter() }}</pre>
              } @else {
<pre class="code-body"><span class="an">&#64;RestController</span>
<span class="kw">public class</span> <span class="ty">TaskController</span> {{ '{' }}

  <span class="an">&#64;GetMapping</span>(<span class="st">"/tasks"</span>)
  <span class="kw">public</span> <span class="ty">List</span>&lt;<span class="ty">Task</span>&gt; <span class="fn">all</span>() {{ '{' }}
    <span class="cm">// Athena: return two tasks to start</span>
    <span class="kw">return</span> <span class="ty">List</span>.<span class="fn">of</span>(
      <span class="kw">new</span> <span class="ty">Task</span>(<span class="st">"Learn IoC"</span>),
      <span class="kw">new</span> <span class="ty">Task</span>(<span class="st">"Ship /tasks"</span>)
    );
  {{ '}' }}
{{ '}' }}</pre>
              }
            </div>
            <div class="console">
              @if (consoleLines()) {
                @for (l of consoleLines(); track $index) {
                  <span class="ln" [style.animation-delay]="l.delay + 's'" [innerHTML]="l.html"></span>
                }
              } @else {
                Press <strong style="color:rgba(255,255,255,.8)">Run</strong> to see your endpoint respond.
              }
            </div>
          </div>
        </div>
      </div>

      <!-- LANGUAGE -->
      <div class="pview" [class.on]="view() === 'lang'">
        <div class="lcard" style="gap:18px">
          <span class="lcard-kind"><span class="kdot" style="background:var(--aqua)"></span>Fill in the blanks</span>
          <p class="fillblank">Yesterday I <input class="blank" placeholder="go → ?" aria-label="verb 1"> to the market and <input class="blank" placeholder="buy → ?" aria-label="verb 2"> fresh bread before it rained.</p>
          <div>
            <span class="lcard-kind" style="margin-bottom:10px;display:inline-flex"><span class="kdot" style="background:var(--violet)"></span>Vocabulary</span>
            <div class="vocab">
              <div class="vcard"><b>diligent</b><span>adj — careful and steady</span></div>
              <div class="vcard"><b>concise</b><span>adj — short and clear</span></div>
              <div class="vcard"><b>nuance</b><span>n — a subtle difference</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- BUSINESS -->
      <div class="pview" [class.on]="view() === 'biz'">
        <div class="scenario">
          <span class="role">Scenario · {{ p()?.title || 'Decision' }}</span>
          <h3>{{ p()?.title || 'Make the call.' }}</h3>
          <p>{{ p()?.description || 'Weigh the trade-offs and choose your first move.' }}</p>
          <div class="decisions">
            <button class="decision" type="button" [class.picked]="picked() === 0" (click)="picked.set(0)"><span class="dk">A</span>Cut the smaller scope and protect quality on the main one.</button>
            <button class="decision" type="button" [class.picked]="picked() === 1" (click)="picked.set(1)"><span class="dk">B</span>Ask the team to push to deliver everything.</button>
            <button class="decision" type="button" [class.picked]="picked() === 2" (click)="picked.set(2)"><span class="dk">C</span>Re-scope with stakeholders today.</button>
          </div>
        </div>
      </div>

      <!-- CREATIVE -->
      <div class="pview" [class.on]="view() === 'create'">
        <div class="prompt-box">
          <div class="quote">{{ p()?.description || 'Create something small from today\\'s idea.' }}</div>
          <div class="by">{{ p()?.title || 'Creative challenge' }}</div>
          <p style="color:var(--ink-soft);font-size:14.5px;margin-bottom:16px">Let it be rough. The point is to make, not to perfect.</p>
          <textarea class="reflect-area" placeholder="I started with…"></textarea>
        </div>
      </div>

      <!-- REFLECTION -->
      <div class="pview" [class.on]="view() === 'reflect'">
        <div class="prompt-box">
          <span class="lcard-kind" style="margin-bottom:12px;display:inline-flex"><span class="kdot" style="background:var(--violet)"></span>Application question</span>
          <div class="quote" style="font-size:18px">{{ p()?.description || 'Where could today\\'s idea help in something you\\'ve built?' }}</div>
          <p style="color:var(--ink-soft);font-size:14px;margin:6px 0 16px">Connect today's idea to something real. Two or three sentences is plenty.</p>
          <textarea class="reflect-area" placeholder="In a project I…"></textarea>
        </div>
      </div>

      <div class="stage-foot">
        <div class="left"><span class="si"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 6-6 6 6 6M16 6l6 6-6 6"/></svg></span><span>Trying counts more than getting it right.</span></div>
        <div class="actions">
          <button class="btn btn-glass" type="button" (click)="back.emit()">Back</button>
          <button class="btn btn-primary" type="button" (click)="complete.emit()">Mark practice complete <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>
        </div>
      </div>
    </section>
  `,
})
export class PracticeSectionComponent {
  readonly practices = input<PracticeActivity[]>([]);
  readonly active = input(false);
  readonly complete = output<void>();
  readonly back = output<void>();

  readonly view = signal<PView>('code');
  readonly picked = signal<number | null>(null);
  readonly consoleLines = signal<ConsoleLine[] | null>(null);

  readonly p = computed<PracticeActivity | null>(() => this.practices()[0] ?? null);
  readonly starter = computed(() => this.p()?.starterContent?.trim() || '');
  readonly steps = computed(() =>
    (this.p()?.instructions || '')
      .split('\n')
      .map((s) => s.replace(/^[-*\d.\s]+/, '').trim())
      .filter((s) => s.length > 0),
  );
  readonly gutter = computed(() => {
    const lines = (this.starter() || ' \n \n \n \n \n \n \n \n \n \n ').split('\n').length;
    return Array.from({ length: Math.max(lines, 11) }, (_, i) => i + 1);
  });

  constructor() {
    effect(() => {
      const first = this.practices()[0];
      this.view.set(first ? VIEW_BY_TYPE[first.practiceType] : 'code');
    });
  }

  run(): void {
    this.consoleLines.set([
      { html: '▸ GET /tasks', delay: 0 },
      { html: '<span class="ok">200 OK</span>  application/json', delay: 0.35 },
      { html: '[', delay: 0.6 },
      { html: '  { "title": "Learn IoC" },', delay: 0.8 },
      { html: '  { "title": "Ship /tasks" }', delay: 1.0 },
      { html: ']', delay: 1.2 },
      { html: '<span class="ok">✓ Endpoint responded with 2 tasks</span> <span class="cursor"></span>', delay: 1.45 },
    ]);
  }

  reset(): void {
    this.consoleLines.set(null);
  }
}
