## Plan: Sentry v3 Post-Refactor Triage

This DRAFT prioritizes fixes by frequency and blast radius from your production `firstRelease:upwork-job-scraper@3.0.1-main.5` issue set. The issues cluster into three root-cause patterns: (1) scrape tab lifecycle races in the background pipeline, (2) webhook transport/auth failures (including `Failed to fetch` and `403` variants), and (3) options-page runtime invalidation plus unsafe settings-shape assumptions. The plan focuses on hardening existing flows in-place (no UX expansion), using the current WXT/TypeScript architecture and typed storage wrappers.

**Grouped Root-Cause Patterns**
- **P0 — Background tab lifecycle/race**: `JAVASCRIPT-9T`, `JAVASCRIPT-9G`, `JAVASCRIPT-9H`
- **P0 — Webhook transport/auth failure family**: `JAVASCRIPT-9J`, `JAVASCRIPT-9F`, `JAVASCRIPT-9M`, `JAVASCRIPT-9N`, `JAVASCRIPT-9S`, `JAVASCRIPT-9R`
- **P1 — Options context invalidation + state-shape guards**: `JAVASCRIPT-9Q`, `JAVASCRIPT-9P`, `JAVASCRIPT-9K`

**Steps**
1. Lock down tab/frame lifecycle in `scrapeTarget` (`create → load → inject → close`) with deterministic guards around `tab/window/frame` availability and timeout cleanup in `app-v3/utils/scraper.ts` (L123-L234) (`scrapeTarget`, `waitForTabComplete`, injection/removal path).
2. Normalize transient browser/runtime failures into typed, non-crashing outcomes (instead of hard-fail throws) for `No current window`, `Frame ... removed`, and timeout branches in `app-v3/utils/scraper.ts` (L153-L224) (`waitForTabComplete`, executeScript branch).
3. Unify webhook error handling into one classification path (`network`, `http_4xx`, `http_5xx`, `policy`) and apply it to both issue webhook and success webhook sends in `app-v3/utils/scraper.ts` (L287-L444) (`sendIssueWebhookIfNeeded`, `processTargetResult` webhook block).
4. Align options-page “Test webhook” behavior with background webhook classification so `403` and fetch failures produce actionable, consistent diagnostics in `app-v3/components/SearchTargetsPage.tsx` (L68-L116) (`testWebhook`) and existing status rendering path.
5. Add strict runtime guards for settings shape before array methods (`searchTargets.some`) and fail-safe normalization on load/watch paths in `app-v3/components/OptionsApp.tsx` (L156-L232) (`loadSettings`, storage watcher, array checks).
6. Reinforce storage defaults/migration invariants so malformed legacy or partial settings cannot propagate invalid arrays in `app-v3/utils/storage.ts` (L24-L167) (`DEFAULT_SETTINGS`, normalizers/migration helpers).
7. Add targeted Sentry context tags for pipeline stage (`tab_create`, `tab_wait`, `inject`, `webhook_send`, `options_test`) in `app-v3/utils/sentry.ts` and call sites to reduce future ambiguity without changing UX.
8. Re-run Sentry MCP verification query and compare 7-day frequency deltas by cluster before/after release.

**Verification**
- Type-check: `cd app-v3 && npm run compile`
- Manual extension checks:
  - Trigger manual scrape repeatedly with multiple targets to validate no crashes in tab lifecycle paths.
  - Validate webhook behavior for reachable endpoint, blocked endpoint, and `403` endpoint.
  - Open/refresh options during extension reload/update scenarios to confirm no `context invalidated` crash and no `.some` undefined errors.
- Sentry MCP post-release checks:
  - Re-run the same release/environment query.
  - Confirm event-frequency drop for `9T/9G/9H`, `9J/9F/9M/9N/9S/9R`, and `9Q/9P/9K`.

**Decisions**
- Prioritize P0 clusters first because they account for the highest recurring event volume and affect core scrape/delivery reliability.
- Treat `Failed to fetch` + `HTTP 403` as one transport/auth family with variant surface errors.
- Keep scope surgical to existing files and contracts in `app-v3`, with no new UI surfaces.
