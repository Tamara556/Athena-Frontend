# Deployment

## What exists today

**Nothing beyond a local build.** There is no CI workflow (no `.github/workflows/` at
all before this pass), no hosting configuration, no Dockerfile, and no deployed
environment. `npm run build` produces a static `dist/` bundle — treat everything below
as a recommendation, not documentation of an existing pipeline.

## Environments

`angular.json`'s `fileReplacements` swaps `environments/environment.ts` for
`environments/environment.prod.ts` on a production build. Today they're identical in
substance — both point `apiBase` at `http://localhost:8080` and leave `youtubeApiKey`
empty:

```ts
export const environment = {
  production: true,
  apiBase: 'http://localhost:8080',
  youtubeApiKey: '',
};
```

**This means a production build still points at a local backend.** Before deploying
anywhere, `environment.prod.ts`'s `apiBase` needs to point at the real gateway URL for
that environment — this is the one required change, and it isn't automated by anything
in this repository today.

## Recommended next steps (not implemented — tracked in `ROADMAP.md`)

1. **CI** — a GitHub Actions workflow running `npm ci && npm run build` (and `npm test`
   once tests exist) on every push/PR, mirroring `Athena-Backend`'s `ci.yml`.
2. **Environment-specific `apiBase`** — at minimum a staging/production split; ideally
   sourced from a build-time variable rather than a committed file, so the same build
   artifact isn't tied to one backend URL.
3. **Static hosting** — this is a static SPA build (`dist/`); any static host (Netlify,
   Vercel, S3+CloudFront, an Nginx container) works. None is configured yet.
4. **A Dockerfile**, if the deployment target is containers rather than a static host —
   `Athena-Backend`'s per-service Dockerfiles are a reasonable two-stage-build model to
   follow (build stage compiles, runtime stage serves the static output via e.g. Nginx).
5. **Linting/formatting in CI** once ESLint/Prettier are added (see `docs/Development.md`).
6. **A CSP header** appropriate for the deployment target, given the localStorage token
   storage noted in `docs/Security.md`.
