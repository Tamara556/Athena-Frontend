# Local Development

## Prerequisites

- **Node.js** compatible with Angular CLI 20 (Node 20.19+ or 22.12+ — Angular 20's
  supported range).
- The [`Athena-Backend`](https://github.com/Tamara556/Athena-Backend) stack running
  locally (`docker compose up --build` from that repo) so `environment.apiBase`
  (`http://localhost:8080`) has something to talk to — this app has no offline/demo
  mode; every real feature needs the gateway reachable (mock features work without it,
  see `docs/API-Integration.md`).

## Install & run

```bash
npm install
npm start          # ng serve — http://localhost:4200, live reload
```

## Build

```bash
npm run build                                # production build → dist/
npm run watch                                 # development-config build, watching
```

Production builds use `environment.prod.ts` via the `fileReplacements` entry in
`angular.json` (`environments/environment.ts` → `environments/environment.prod.ts`).
Both currently point `apiBase` at `http://localhost:8080` — see `docs/Deployment.md` for
what changes before a real deployment.

Bundle budgets (`angular.json`): **500 kB** warning / **1 MB** error on the initial
bundle, **20 kB** warning / **28 kB** error per component style sheet.

## Testing

```bash
npm test            # ng test — Karma + Jasmine
```

**There are currently zero `.spec.ts` files in this repository**, despite Karma/Jasmine
being fully configured. `npm test` runs successfully but exercises nothing. This is the
single biggest testing gap in the project — see `docs/Architecture.md` §5 and
`ROADMAP.md`. If you're adding tests, the highest-value starting points are:
- `core/auth.interceptor.ts` (401 → session clear → redirect; header attachment only for
  `API_BASE` URLs)
- `core/session.ts` (localStorage round-trip)
- any `*.api.ts` in "partial" or "mock" state (`docs/API-Integration.md`) — asserting the
  `Observable<T>` contract holds regardless of mock/real mode is exactly what makes the
  swap-to-real transition safe later.

There is no configured e2e framework (`ng e2e` is not wired to anything, matching
Angular CLI's current default of not bundling one).

## Linting / formatting

No ESLint/Prettier configuration exists in this repository today (no `.eslintrc*`,
no `.prettierrc*`) — TypeScript's strict mode is the only automated code-quality gate.
Recommended as a future addition, not implemented (see `ROADMAP.md`).

## Working with the mock-swappable API seam

When a backend endpoint you need doesn't exist yet, follow the existing pattern (see
`docs/Architecture.md` §3): keep the feature's `*.api.ts` method signature returning
`Observable<T>`, back it with `of(...)`/`of(null)` for now, and swap the body to a real
`HttpClient` call — with no changes needed anywhere else in the feature — once the
backend contract exists.
