## Plan: Sentry rollout for WXT MV3 (DRAFT)

Use official Sentry + WXT patterns, not v1 parity. v1 used a vendored SDK and hardcoded DSN in [KEEP-DO-NOT-DELETE/last-public-release/upwork-job-scraper/sentry-init.js](KEEP-DO-NOT-DELETE/last-public-release/upwork-job-scraper/sentry-init.js#L1) and [KEEP-DO-NOT-DELETE/last-public-release/upwork-job-scraper/manifest.json](KEEP-DO-NOT-DELETE/last-public-release/upwork-job-scraper/manifest.json#L7-L11); v3 currently has zero Sentry wiring across [app-v3/entrypoints/background.ts](app-v3/entrypoints/background.ts), [app-v3/entrypoints/upwork-scraper.content.ts](app-v3/entrypoints/upwork-scraper.content.ts), and [app-v3/entrypoints/options/index.tsx](app-v3/entrypoints/options/index.tsx). Per official docs, browser extensions are a shared-environment case, so content-script instrumentation should follow the manual client/scope approach (avoid global-state-heavy defaults) while still giving full context coverage.

**Steps**
1. Add SDK + build tooling in [app-v3/package.json](app-v3/package.json): `@sentry/browser`, `@sentry/react`, `@sentry/vite-plugin` (for sourcemaps/release).
2. Introduce a small Sentry config layer in [app-v3/utils](app-v3/utils) to centralize `release`, `environment`, tags, and helper capture APIs used by all entrypoints.
3. Configure WXT env and manifest updates in [app-v3/wxt.config.ts](app-v3/wxt.config.ts): move `manifest` to function form, read `import.meta.env.WXT_*`, and add Sentry ingest host to `host_permissions`.
4. Wire background initialization early in [app-v3/entrypoints/background.ts](app-v3/entrypoints/background.ts#L5), then replace key `console.error`/catch paths with structured capture in `runScrape`, alarm, and messaging handlers.
5. Wire options React initialization in [app-v3/entrypoints/options/index.tsx](app-v3/entrypoints/options/index.tsx#L8) with React 19 error handlers (`createRoot` error hooks) and route UI catches in [app-v3/components/OptionsApp.tsx](app-v3/components/OptionsApp.tsx#L252-L326) + [app-v3/components/SearchTargetsPage.tsx](app-v3/components/SearchTargetsPage.tsx#L52-L89) through shared capture helpers.
6. Wire content script in [app-v3/entrypoints/upwork-scraper.content.ts](app-v3/entrypoints/upwork-scraper.content.ts#L90) using extension-safe shared-environment setup (manual client/scope, minimal integrations) and capture parser failures currently only logged in the job-tile loop.
7. Add release/source-map pipeline: WXT/Vite plugin config via build hook and CI env (`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`) so production stack traces are symbolicated.
8. Add privacy/ops docs updates in [README.md](README.md) (env vars, what telemetry is sent, local verification path) and keep v1 folder untouched.

**Verification**
- Run `cd app-v3 && npm run compile` for type safety.
- Build extension (`.\build.ps1`) and confirm manifest includes Sentry host permission.
- Trigger one test error per context (background message path, options UI action, content parse failure) and verify events, tags (`context=background|options|content`), and release in Sentry.
- Validate sourcemap symbolication on a minified production error after CI upload.

**Decisions**
- Chosen scope: background + options + content script.
- DSN strategy: build-time `WXT_*` env (public in bundle, standard browser SDK model).
- Source maps: included in phase 1.
- v1 parity: not preserved; adopt official documented patterns (especially extension shared-environment guidance).
