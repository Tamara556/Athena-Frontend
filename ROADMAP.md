# Roadmap

Built only from evidence in this repository — what's verifiably mock/placeholder,
explicitly-flagged gaps, and recommendations surfaced while writing
`docs/Architecture.md`, `docs/API-Integration.md`, `docs/Security.md`, and
`docs/Deployment.md`. Nothing here is invented.

## Completed

- **Auth & guarded routing** — login, registration with avatar upload, 2FA verification.
- **Onboarding & Roadmap** — goal wizard, AI assessment, roadmap visualization.
- **Daily Journey** — the full adaptive daily-plan lifecycle, wired to the real backend.
- **Learning Sessions** — the full lesson player, wired to the real backend, with
  optional live YouTube search.
- **Achievements** — real badge catalogue + earned badges.
- **Knowledge Graph** — real skill-mastery visualization.
- **Streaks** — real activity data.
- **Settings & account security** — real account management, 2FA, devices, login
  activity, data export.
- **Theming & i18n** — light/dark/pink themes, 4-language dictionary-based translation.
- **First-run guided tour**.
- **Open-source release preparation** — README rewrite, `docs/` knowledge base, GitHub
  community health files (this change).

## In Progress

Nothing is currently mid-implementation as far as this repository's state shows — the
gaps below are all "not started," not "partially done," except where noted.

## Planned (recommended, not implemented)

Surfaced while documenting the codebase — recommendations, not commitments:

- **Wire Progress and Interviews to real backend data.** Both features are fully
  mock/placeholder today (`docs/API-Integration.md`); `interview-service` already
  exists on the backend, so Interviews is the more immediately actionable of the two.
- **Add `GET /ai/insights/me` on the backend.** The frontend already calls it
  (`features/athena-insights/insights.api.ts`) and gracefully falls back to an empty
  state — the frontend side of this integration is done and waiting.
- **Complete Knowledge Graph and Profile.** Evolution timeline and recommendation cards
  (Knowledge Graph), and narrative/direction/insights/milestones (Profile), have no
  backend contract yet — see `docs/Architecture.md` §3 for the exact fields.
- **Silent token refresh.** The backend's `POST /auth/refresh` is never called; every
  session currently ends at the access-token TTL with a forced re-login
  (`docs/Security.md` §3).
- **Test coverage.** Zero `.spec.ts` files exist despite Karma/Jasmine being fully
  configured (`docs/Development.md`). Highest-value starting points: the auth
  interceptor, `Session`, and the `*.api.ts` seam contracts.
- **CI.** No GitHub Actions workflow builds this repository on push/PR
  (`docs/Deployment.md`), unlike the backend's `ci.yml`.
- **Linting/formatting.** No ESLint or Prettier configuration exists yet
  (`docs/Development.md`).
- **Environment-specific `apiBase`.** Both `environment.ts` and `environment.prod.ts`
  currently point at `http://localhost:8080` — a real deployment needs at least a
  staging/production split (`docs/Deployment.md`).
- **A Content-Security-Policy** for whatever the eventual deployment target is
  (`docs/Security.md` §6).
- **GitHub Discussions, labels, and a Projects board** — process recommendations, see
  `CONTRIBUTING.md`'s closing section.
