# Security

This document describes the frontend's **current implementation**. For the backend
security model it depends on (JWT issuance, gateway validation, 2FA), see
`Athena-Backend`'s `docs/Security.md`. To report a vulnerability, see
[`SECURITY.md`](../SECURITY.md).

## 1. Token storage

The access token, user id, device-session id, display name, and avatar URL are stored in
**`localStorage`** (`core/session.ts`), read into Signals at app construction. This is a
deliberate simplicity/XSS-exposure tradeoff common to SPAs without a BFF layer — a
successful XSS attack against this app could exfiltrate the token. There is no
`httpOnly` cookie option today because there's no server-rendered component in this
architecture to set one.

## 2. Request authentication

`core/auth.interceptor.ts` attaches `Authorization: Bearer <token>` to every request
whose URL starts with `environment.apiBase` — it does not touch requests to other
origins (e.g. the optional direct YouTube Data API call in
`features/learning-session/youtube-search.service.ts`, which carries its own API key
instead).

## 3. Session termination

Any `401` response from an authenticated request clears the session
(`Session.clear()`) and redirects to `/login`. There is **no silent token refresh** —
the backend's `POST /auth/refresh` exists but is never called from this codebase, so a
session ends at the access token's TTL (15 minutes by backend default) with no attempt
to extend it transparently. This is a real UX cost (frequent forced re-logins) traded
for simplicity; see `ROADMAP.md`.

## 4. Route guards

`authGuard` / `guestGuard` (`core/auth.guard.ts`) gate navigation based on
`Session.isLoggedIn()` — a purely client-side check. This prevents accidental
navigation to the wrong state, not a security boundary: the actual authorization
boundary is the backend gateway rejecting unauthenticated requests, exactly as designed
(a client-side guard can never be trusted as the sole gate).

## 5. Two-factor authentication & account security UI

`features/settings` provides the UI for the backend's 2FA (setup/enable/disable),
device-session management (list/revoke/revoke-others), login-activity review, and
self-service data export — all real HTTP calls, no client-side secret handling beyond
passing through what the user types (verification codes, phone numbers) to the backend.

## 6. Known gaps

- **No silent refresh** (§3) — sessions are shorter-lived than they need to be.
- **No Content-Security-Policy** configured in this repository (no meta tag, no
  documented server header expectation) — worth adding before a public deployment,
  especially given the localStorage token exposure noted in §1.
- **No automated dependency/CVE scanning** in this repository (there's no CI at all
  yet — see `docs/Deployment.md`).
- **No test coverage** for the auth flow or interceptor behavior (zero `.spec.ts` files
  anywhere in the repo) — the 401-clears-session behavior and the anti-double-header
  logic in the interceptor are exactly the kind of logic that benefits most from a unit
  test and currently have none.
