# Changelog

All notable changes to this project are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project has not yet made a
tagged `1.0.0` release (see [`SUPPORTED_VERSIONS.md`](SUPPORTED_VERSIONS.md)).

Unlike the companion [`Athena-Backend`](https://github.com/Tamara556/Athena-Backend)
repository, this repository's entire history to date is a **single commit**
(`init commit`, 2026-07-27) — there is no incremental git history to reconstruct
version-by-version entries from. This entry describes what that commit contains as a
whole; future entries should be added incrementally from here.

## [Unreleased]
- Documentation overhaul: rewritten `README.md`, new `docs/` knowledge base
  (`Architecture.md`, `Project-Structure.md`, `API-Integration.md`, `Development.md`,
  `Deployment.md`, `Security.md`, `Theming-and-i18n.md`, `Contributing.md`,
  `OSS-READINESS-REPORT.md`), GitHub community health files, issue/PR templates.

## 2026-07-27 — Initial commit
The application as first committed, covering:
- **Auth**: login, registration (with optional avatar upload), 2FA verification,
  guarded routing (`authGuard`/`guestGuard`).
- **Onboarding & Roadmap**: goal-capture wizard, AI-generated assessment, roadmap
  visualization with phase completion.
- **Daily Journey**: full adaptive daily-plan UI — block lifecycle, check-ins,
  reflections, plan adjustment.
- **Learning Sessions**: per-node lesson player (reading, video, practice, quiz),
  with optional live YouTube search integration.
- **Knowledge Graph**: skill-mastery visualization.
- **Achievements**: badge catalogue + earned badges with presentation metadata.
- **Streaks**: activity heatmap and stats.
- **Settings**: account management, 2FA, device sessions, login activity, data export.
- **Interviews, Progress, Athena Insights, Profile narrative**: UI built against typed
  mock/placeholder data pending matching backend contracts (see
  `docs/API-Integration.md`).
- **Platform**: Signals-based theming (light/dark/pink) and 4-language i18n
  (English/Armenian/Russian/Korean), first-run guided tour.
