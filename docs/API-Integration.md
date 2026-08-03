# API Integration

This app talks to exactly one backend: the [`Tamara556/Athena-Backend`](https://github.com/Tamara556/Athena-Backend)
gateway, `environment.apiBase` (`http://localhost:8080` in both `environment.ts` and
`environment.prod.ts` — see `docs/Deployment.md`). Every call goes through
`core/auth.interceptor.ts`, which attaches `Authorization: Bearer <token>` to any
request whose URL starts with `API_BASE`, and clears the session + redirects to
`/login` on a `401`.

The backend's own contract reference is `Athena-Backend`'s `docs/API.md` /
`docs/Backend.md` — this document maps **this app's** consumption of it, file by file,
and is the authoritative real-vs-mock inventory (summarized in
`docs/Architecture.md` §3).

## Core (`core/api.ts` — `Api` class)

| Method | Endpoint |
|---|---|
| `register()` | `POST /auth/register` (multipart — optional avatar) |
| `login()` | `POST /auth/login` |
| `verifyTwoFactor()` | `POST /auth/2fa/verify` |
| `startOnboarding()` | `POST /ai/onboarding/start` |
| `submitGoal()` | `POST /ai/onboarding/goal` |
| `submitAssessment()` | `POST /ai/onboarding/assessment` |
| `roadmap()` | `GET /ai/roadmaps/me` |
| `completePhase()` | `POST /ai/roadmaps/me/phases/{index}/complete` |
| `dailyPlan()` | `GET /ai/daily-plans/me` |

## Settings (`features/settings/settings.api.ts` — `SettingsApi`, real)

| Method | Endpoint |
|---|---|
| `getSettings()` / `updateSettings()` | `GET`/`PUT /users/me/settings` |
| `getAccount()` | `GET /account/me` |
| `updateProfile()` | `PATCH /account/profile` |
| `changeEmail()` | `POST /account/email` |
| `changePassword()` | `POST /account/password` |
| `uploadAvatar()` | `POST /account/image` (multipart) |
| `getLoginActivity()` | `GET /account/login-activity` |
| `getDevices()` / `revokeDevice()` / `revokeOtherDevices()` | `GET /account/devices`, `POST /account/devices/{id}/revoke`, `POST /account/devices/revoke-others` |
| `getTwoFactorStatus()` / `setupTwoFactor()` / `enableTwoFactor()` / `sendDisableCode()` / `disableTwoFactor()` | `GET /account/2fa`, `POST /account/2fa/setup\|enable\|send-code\|disable` |
| `exportData()` | `GET /account/export` (blob download) |

`features/profile/profile.api.ts` delegates its identity/preferences reads and writes to
`SettingsApi` rather than calling the backend directly — see `docs/Architecture.md` §3
for what else in Profile is still mock.

## Streaks (`features/streaks/streaks.api.ts` — `StreaksApi`, real)
`getActivity()` → `GET /progress/streaks`

## Daily Journey (`features/daily-journey/daily-journey-api.service.ts`, real)
All of `/daily-journey/**` — `today()`, `why()`, `startDay()`, `adjustPlan()`,
`adjustTime()`, `startBlock()`, block `progress()`/`complete()`/`skip()`/`relink()`,
weakness `strengthen()`, `checkin()`, and reflection `save()`/`skip()` — a full 1:1
mapping to the backend's Daily Journey lifecycle.

## Learning Session (`features/learning-session/learning-session-api.service.ts`, real)
`getCurrent()`, `getById()`, `start()`, `complete()`, `generate()`, `upcoming()` map to
`/learning-sessions/**`. A separate `youtube-search.service.ts` optionally calls the
**YouTube Data API v3 directly from the browser** (not through the gateway) when
`environment.youtubeApiKey` is set, to embed a real video for each lesson's "watching"
stage; with no key configured it degrades gracefully (search queries only, no embed).

## Knowledge Graph (`features/knowledge-graph/knowledge-graph.api.ts`, partial)
`getVisualization()` → `GET /ai/knowledge-graph/me/visualization` (real, mapped into a
2D layout client-side by `knowledge-graph.layout.ts`). `getEvolution()`,
`getOpportunities()`, `getAccelerators()`, `applyRecommendation()` are all
placeholders (`of(null)`/`of([])`) — no backend contract for a mastery-evolution
timeline or recommendation-application endpoint exists yet.

## Achievements (`features/achievements/badges.api.ts`, partial)
`getBadges()` combines two real calls — `GET /badges` (catalogue) and `GET /badges/me`
(earned) — with client-side presentation metadata (`PRESENTATION` map: rarity, color,
animation, XP) that has no backend equivalent by design (see the analogous note in
`Athena-Backend`'s `docs/Frontend.md`). AI-suggestion and per-badge numeric-progress
sub-fields are still placeholders (`of([])`) — `ai-service` has a
`POST /ai/badges/suggest` endpoint, but this page doesn't call it yet.

## Athena Insights (`features/athena-insights/insights.api.ts`, wired but backend-missing)
`getInsights()` calls `GET /ai/insights/me` and falls back to a typed empty profile on
any error (`catchError`). **This endpoint does not exist in `Athena-Backend` today** —
confirmed against every `ai-service` controller. The frontend is ready the moment the
backend adds it; until then this page always shows its empty state in practice.

## Progress (`features/progress/progress.api.ts`, mock)
Every data getter (`getTransform`, `getHighlights`, `getJourney`, `getObservations`,
`getMilestones`, `getFuture`, `getReflections`) returns an empty `of(...)`. Only the
reflection prompts (`getPrompts()`) and the (client-only) `saveReflection()` return
real static/simulated data. No backend endpoint for a narrative "growth story" exists.

## Interviews (`features/interviews/interviews.api.ts`, mock)
Every data getter returns `of(null)`/`of([])`; static content (`TIPS`, `IMPACTS`,
`MOCK_LEVELS`) is served with a simulated latency (`delay(420)`) to keep loading-state
UI exercised. `interview-service` and `ai-service`'s interview endpoints exist on the
backend (`POST /interviews/start`, `/interviews/{id}/submit`, etc. — see
`Athena-Backend`'s `docs/Backend.md`) but this page has not been wired to them.

## Error handling

`core/errors.ts`'s `errorMessage()` is the shared translator from `HttpErrorResponse`
to a display string: a `status: 0` gets a specific "can't reach the gateway" message
(useful when the backend simply isn't running locally), a body matching the backend's
uniform `ApiError` shape (`{message: string}`) surfaces that message directly, and
anything else falls back to `"{status} {statusText}"`.
