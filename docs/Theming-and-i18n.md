# Theming & Internationalization

Two small, self-contained app-wide systems, both in `core/` and both exposed in every
page header via `shared/theme-toggle` and `shared/lang-select`.

## Theming (`core/theme.ts` — `ThemeService`)

Three themes: `light` (default), `dark`, `pink`. Implementation is intentionally
minimal — a Signal holding the current theme, an `effect()` that writes it to
`document.documentElement`'s `data-theme` attribute and to `localStorage`
(`athena_theme`) whenever it changes:

```ts
readonly theme = signal<Theme>(readInitial());   // reads localStorage on construction
set(theme: Theme): void { this.theme.set(theme); }
```

All actual color/spacing values live in CSS, keyed off `[data-theme="..."]` selectors —
`ThemeService` only ever flips the attribute. There's no `prefers-color-scheme` media
query fallback; a first-time visitor always sees `light` until they choose otherwise via
`shared/theme-toggle`.

## Internationalization (`core/i18n.ts` — `I18nService`)

Four languages: English (`en`, default), Armenian (`hy`), Russian (`ru`), Korean (`ko`).
Simple dictionary-based translation — no external i18n library (no `ngx-translate`,
no Angular's built-in `$localize`/XLIFF pipeline):

```ts
export type Lang = 'en' | 'hy' | 'ru' | 'ko';
const DICTIONARY: Record<Lang, Record<string, string>> = { en: {...}, hy: {...}, ... };
```

- The current language is a Signal, persisted to `localStorage` (`athena_lang`) the same
  way theme is.
- `shared/translate.pipe.ts` exposes it to templates as `{{ 'key.path' | t }}`, with
  `{placeholder}` interpolation support for dynamic values (e.g.
  `'streaks.currentDesc': "You've returned to Athena for {n} consecutive days..."`).
- Coverage today is **feature-page UI strings** (nav, settings, profile, insights,
  progress, streaks, achievements, interviews, knowledge graph, daily journey, roadmap)
  — sidebar navigation is fully translated across all four languages. Marketing/landing
  copy on `pages/home` and some newer feature copy may still be English-only; treat the
  dictionary as the source of truth for what's covered rather than assuming full
  parity (see `ROADMAP.md`).
- Adding a language means adding one more key to `DICTIONARY` and one entry to `LANGS`
  — no build step or extraction tooling is involved, which keeps the barrier to
  contributing a translation low but also means there's no automated check that a new
  language's key set is complete (a missing key just renders the key path).

## Why this shape

Both systems avoid a third-party dependency for something genuinely small in scope,
keep the persistence mechanism identical (Signal + `effect()` + `localStorage`) so
they're easy to reason about side by side, and expose themselves to templates the same
way (an attribute for theme that pure CSS reacts to, a pipe for i18n that templates call
directly) — consistent with the rest of the app's Signals-first, no-global-store
architecture (`docs/Architecture.md`).
