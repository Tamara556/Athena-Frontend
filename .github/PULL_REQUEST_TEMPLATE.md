## What changed
<!-- Summarize the change. Link the issue this addresses, if any. -->

## Why
<!-- The motivation — what problem this solves or what it enables. -->

## Affected feature(s)/page(s)
<!-- e.g. daily-journey, settings, docs/ -->

## How this was tested
<!-- npm run build? Manual testing against a local Athena-Backend? Which browser?
     Be specific — "tested locally" isn't enough for a reviewer to trust. -->

## Checklist
- [ ] `npm run build` passes locally
- [ ] If this changes a feature's mock/real data status, `docs/API-Integration.md` is
      updated in this PR
- [ ] User-facing strings added go through `core/i18n.ts` for all four languages, not
      just English (or there's a good reason not to)
- [ ] No secrets or API keys included in the diff
