# Contributing to Athena Frontend

Thanks for considering a contribution. This document covers the process; for build/test
mechanics specific to this repo (adding a feature, swapping mock data for a real
endpoint), see [`docs/Contributing.md`](docs/Contributing.md).

By participating in this project you're expected to uphold the
[Code of Conduct](CODE_OF_CONDUCT.md).

## Before you start

- For anything beyond a small fix, open an issue first describing what you want to
  change and why.
- Check `ROADMAP.md` and open issues/PRs to avoid duplicating work already in flight.
- If your change depends on a backend endpoint that doesn't exist yet, check
  [`docs/API-Integration.md`](docs/API-Integration.md) first — it may already be
  tracked as a known gap, and the right move might be building against a typed mock
  (see `docs/Architecture.md` §3) rather than waiting.

## Fork and branch

1. Fork the repository and clone your fork.
2. Create a branch off `master`, named descriptively:
   ```
   feature/<short-description>     new functionality
   fix/<short-description>         bug fix
   docs/<short-description>        documentation only
   chore/<short-description>       tooling, dependencies
   ```

## Commit messages

Write commits that explain **why**, not just what. Keep the summary line under ~72
characters, imperative mood ("Add device revocation UI", not "Added" or "Adds"). Group
related changes into one commit; split unrelated changes into separate commits.

## Coding style

Match the conventions already used throughout the codebase:
- **Standalone components only** — no `NgModule`. Use the new `@if`/`@for` control flow,
  not `*ngIf`/`*ngFor`.
- **Signals for state**, not RxJS subjects/behavior subjects as a state store — RxJS is
  for `HttpClient` and the interceptor, not app-wide state.
- **One `*.api.ts` per feature** is the only place that calls `HttpClient` — components
  and stores never call it directly, and never reach into another feature's API service.
- Plain CSS keyed off `[data-theme="..."]` for theme support — no CSS-in-JS, no
  Tailwind/Material utility classes.
- User-facing strings that appear in more than one place, or on a page already
  translated, go through `core/i18n.ts` (`{{ 'key' | t }}`) with all four language
  entries added together, not just English.
- TypeScript strict mode — no new `any`, no `as any` casts.

## Testing expectations

There is currently no test suite in this repository (`docs/Development.md`) — if you're
adding the first tests for an area, favor the `*.api.ts` seam and `core/` singletons
(highest leverage, currently zero coverage). If you're touching code that later gains
tests, keep it structured so it's testable (pure functions in `.logic.ts`, not buried in
component methods).

## Opening a pull request

- Target `master`.
- Fill in the PR template (`.github/PULL_REQUEST_TEMPLATE.md`) — what changed, why, and
  how you verified it (`npm run build` at minimum, since there's no CI yet).
- Keep PRs focused.
- If you changed a feature's mock/real data status, update
  `docs/API-Integration.md` in the same PR.

## Review process

A maintainer will review for correctness, adherence to the existing architecture
(Signals-only state, the one-API-file-per-feature seam), and consistency with the
existing design system (theming, i18n). Expect feedback rounds on anything non-trivial.

## Reporting bugs / requesting features

Use the issue templates under `.github/ISSUE_TEMPLATE/`. For security vulnerabilities,
**do not** open a public issue — see [`SECURITY.md`](SECURITY.md).

## Recommended repository setup (not yet enabled)

- **GitHub Discussions** for design questions, separate from Issues.
- **GitHub Projects** board mirroring `ROADMAP.md`.
- **Branch protection on `master`** once CI exists to require (see `docs/Deployment.md`
  — CI itself doesn't exist yet either, and is the first thing worth adding).
- **Labels**: `bug`, `enhancement`, `documentation`, `good first issue`, `help wanted`,
  and one `area:<feature-name>` label per feature folder.
