# Project Structure

Athena Frontend is a single Angular 20 application (standalone components, no
NgModules). This maps the repository layout as it exists today.

```
Athena-Frontend/
├── src/
│   ├── app/
│   │   ├── core/            singleton, app-wide services (see below)
│   │   ├── features/        one folder per in-app feature (see below)
│   │   ├── pages/           routed page shells (see below)
│   │   ├── shared/          reusable, presentation-only components
│   │   ├── app.ts             root component (router outlet)
│   │   ├── app.config.ts      providers: router, HttpClient + auth interceptor
│   │   └── app.routes.ts      the full route table (guards attached per-route)
│   └── environments/          environment.ts / environment.prod.ts (apiBase, youtubeApiKey)
├── public/                    static assets (favicon.svg)
├── docs/                      this documentation set
├── angular.json                build config, budgets, file replacements
├── package.json                 Angular 20, RxJS 7.8, zone.js — no state-management library
└── tsconfig*.json               strict TypeScript
```

## `core/` — app-wide singletons

```
api.ts              Api class — the original core endpoints (auth, onboarding, roadmap, daily plan)
api.types.ts         typed request/response contracts for core.ts
session.ts           Session — signals + localStorage (token, userId, name, image, sessionId)
auth.guard.ts         authGuard (must be signed in) / guestGuard (must NOT be signed in)
auth.interceptor.ts   attaches Bearer token to API_BASE requests; clears session + redirects on 401
errors.ts             errorMessage(err) — turns HttpErrorResponse into a display string
theme.ts               ThemeService — light/dark/pink, persisted, drives [data-theme] on <html>
i18n.ts                 I18nService — en/hy/ru/ko dictionary-based translation
```

## `features/` — one folder per feature, each self-contained

Every feature follows the same internal shape: a `*.component.ts` (view), a `*.api.ts`
or `*-api.service.ts` (the single seam to the backend — see `docs/API-Integration.md`
for which are real HTTP calls and which are still typed placeholders), a
`*.models.ts` (view-model types), and where the view logic is non-trivial, a
`*.store.ts` (Signals-based state) and/or `*.logic.ts` (pure helper functions kept out
of the component for testability).

```
achievements/       badge catalogue + earned badges + AI-suggested badges
athena-insights/     AI-generated learner narrative ("how Athena sees you")
daily-journey/       today's adaptive block-by-block learning plan
interviews/           weekly AI interview overview, prep, and mock practice
knowledge-graph/      skill mastery visualization (nodes/edges/insights)
learning-session/     per-roadmap-node lesson player (reading/watching/practice/quiz)
  └── components/     the four stage components + header/progress/loading/empty states
profile/              identity, learning preferences, AI narrative about the learner
progress/             qualitative "growth story" — highlights, milestones, reflection
settings/              account settings, 2FA, devices, login activity, data export
streaks/               streak/activity heatmap and stats
```

## `pages/` — routed top-level shells

```
home/         public landing page
login/         guestGuard — signed-in users are redirected to /roadmap
register/      guestGuard — multipart registration with optional avatar upload
onboarding/    authGuard — goal → AI assessment wizard
roadmap/       authGuard — the generated learning roadmap
dashboard/     authGuard — post-onboarding landing
```

## `shared/` — reusable, presentation-only

```
sidebar/            main app navigation (feature routes + account)
theme-toggle/        light/dark/pink switcher, present in every page header
lang-select/          language switcher (en/hy/ru/ko), present in every page header
tour/                  first-run guided spotlight tour (tour.service.ts + tour-overlay + tour.steps.ts)
athena-loader/        branded loading indicator
click-spark/            small interaction polish (click feedback)
count-up/                animated number counter
translate.pipe.ts       `| t` pipe wrapping I18nService
```

## Related repository

The backend this app talks to lives in a separate repository,
[`Tamara556/Athena-Backend`](https://github.com/Tamara556/Athena-Backend) — see
`docs/API-Integration.md` for the endpoint-level mapping and that repository's
`docs/API.md` for the authoritative contract.
