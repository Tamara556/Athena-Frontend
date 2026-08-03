# Security Policy

For an explanation of the current frontend security implementation (token storage,
session handling, guards, known gaps), see [`docs/Security.md`](docs/Security.md). This
document is about **reporting a vulnerability**, not describing the design.

## Supported Versions

This project has not yet had a `1.0` release; `master` is the only supported line of
development. See [`SUPPORTED_VERSIONS.md`](SUPPORTED_VERSIONS.md) for the full policy.

| Version | Supported |
|---|---|
| `master` (latest commit) | ✅ |
| anything else | ❌ |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for a suspected security vulnerability.**

Use **[GitHub Security Advisories](https://github.com/Tamara556/Athena-Frontend/security/advisories/new)**
to report privately.

Please include:
- A description of the vulnerability and its potential impact.
- Steps to reproduce (a minimal repro is very helpful).
- Which page/feature is affected.

## What to expect

This is a small, actively-developed open source project without a dedicated security
team or a formal SLA. Maintainers will acknowledge new advisories and aim to respond
with an initial assessment as soon as reasonably possible; timelines are best-effort,
not guaranteed. Once a fix is available, a coordinated disclosure timeline will be
agreed upon with the reporter before any public advisory is published.

## Scope

In scope: this repository (the Angular frontend) and its build/deployment
configuration.

Out of scope: the companion backend repository
([`Tamara556/Athena-Backend`](https://github.com/Tamara556/Athena-Backend)) — report
issues there in that repository instead, using its own `SECURITY.md`.
