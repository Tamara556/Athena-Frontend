# Contributing (developer mechanics)

For branch naming, commit style, PR process, and code of conduct, see the root
[`CONTRIBUTING.md`](../CONTRIBUTING.md). This page covers only the repo-specific
mechanics of building and testing changes.

## Setup

```bash
npm install
npm start          # http://localhost:4200
```

You'll want `Athena-Backend` running locally too (`docker compose up --build` in that
repo) for anything beyond the mock-backed features — see `docs/API-Integration.md` for
which features need it.

## Adding a feature

Follow the existing shape (`docs/Project-Structure.md` §`features/`):
1. `features/<name>/<name>.models.ts` — view-model types.
2. `features/<name>/<name>.api.ts` (or `-api.service.ts`) — the **only** file that talks
   to `HttpClient`. If the backend endpoint doesn't exist yet, return `of(...)`/`of(null)`
   with the same `Observable<T>` shape you'll use once it does (see
   `docs/Architecture.md` §3 and `docs/Development.md`).
3. `features/<name>/<name>.store.ts` (Signals) and/or `.logic.ts` (pure functions) if the
   component needs non-trivial state or computation — keep it out of the component class
   when it's not directly view-related.
4. `features/<name>/<name>.component.ts` — standalone, `@if`/`@for` control flow, styled
   with plain CSS keyed off `[data-theme]` for theme support (`docs/Theming-and-i18n.md`).
5. Register the route in `app.routes.ts` with the appropriate guard (`authGuard` for
   anything requiring sign-in).
6. Add sidebar entry + i18n keys (`core/i18n.ts`) if the feature needs navigation/UI text
   in more than English — add one key per language, all four (`en`/`hy`/`ru`/`ko`).

## Swapping a feature from mock to real

When the corresponding backend endpoint ships: change only the feature's `*.api.ts` to
call `HttpClient` against `API_BASE`, keeping the exact same method signature. Nothing
else in the feature needs to change — that's the point of the seam (see
`docs/Architecture.md` §3). Update `docs/API-Integration.md`'s status table in the same
PR so the doc doesn't silently go stale.

## Testing expectations

There is no existing test suite to match style against (`docs/Development.md`) — if
you're the first to add tests for an area, favor testing the `*.api.ts` seam (mock
`HttpClient`, assert the emitted shape) and `core/` singletons
(`auth.interceptor.ts`, `session.ts`) first, since they're both high-leverage and
currently completely uncovered.

## Running the build before a PR

```bash
npm run build
```

There is no CI to catch a broken build yet (`docs/Deployment.md`) — running this
locally before opening a PR is the only check today.

## Recommended repository setup (not yet enabled)

Mirrors the recommendation already made for `Athena-Backend`:
- **GitHub Discussions** for design questions, separate from Issues.
- **Labels**: `bug`, `enhancement`, `documentation`, `good first issue`, `help wanted`,
  and one `area:<feature-name>` label per feature folder.
- **GitHub Projects** board tracking `ROADMAP.md`.
- **Branch protection on `master`** once there's a CI check to require.
- **CI** (`docs/Deployment.md` §"Recommended next steps") — the first thing to add,
  since branch protection has nothing to require without it.
