## Plan: v1→v3 Migration Execution Checklist

This is the execution-ready checklist with measurable acceptance criteria for each implementation step. It keeps scope fixed to your approved path: one-time settings/history migration + per-target legacy webhook compatibility, with v3 as default.

**Step 1 — Release Identity Gate**
- Work: Verify extension update path assumptions in app-v3/wxt.config.ts and release process docs in README.md.
- Acceptance criteria:
  - Same Chrome Web Store listing/extension ID is explicitly confirmed in docs.
  - A short “migration depends on same extension ID” note exists in release notes/docs.
  - No migration code starts before this is confirmed.

**Step 2 — Migration Orchestrator (One-Time + Idempotent)**
- Work: Add a background-start migration orchestrator hook in app-v3/entrypoints/background.ts, with a marker key in storage.
- Acceptance criteria:
  - Migration runs on update/startup path before first scrape cycle.
  - Marker prevents repeated re-import on worker restarts.
  - On failure, extension still loads and logs a clear prefixed error.

**Step 3 — Settings Import (v1 → v3)**
- Work: Map legacy settings from KEEP-DO-NOT-DELETE/last-public-release/upwork-job-scraper/storage.js into v3 settings model in app-v3/utils/storage.ts and app-v3/utils/types.ts.
- Acceptance criteria:
  - searchWebhookPairs maps into searchTargets with valid IDs/names/URLs.
  - jobScrapingEnabled, checkFrequency, schedule, notificationsEnabled map correctly.
  - Imported values pass existing v3 normalization/migrations and persist after restart.

**Step 4 — History + Dedupe Import**
- Work: Convert legacy scrapedJobs into v3 jobHistory and deterministic seenJobIds.
- Acceptance criteria:
  - Imported history is capped to v3 max and sorted consistently with current behavior.
  - Deterministic UID strategy prevents immediate duplicate re-sends after first v3 scrape.
  - Import is repeat-safe (re-running does not multiply entries).

**Step 5 — Per-Target Payload Format Field**
- Work: Extend target schema/defaults/migrations in app-v3/utils/types.ts and app-v3/utils/storage.ts to include per-target payload format (v3 default, legacy-v1 optional).
- Acceptance criteria:
  - Existing users upgrade without schema errors.
  - New targets default to v3.
  - Old targets without the field are normalized to v3.

**Step 6 — Webhook Sender Branching**
- Work: Branch payload generation in app-v3/utils/scraper.ts based on target format.
- Acceptance criteria:
  - v3 mode sends current envelope unchanged.
  - legacy-v1 mode sends v1-compatible shape expected by existing automations.
  - Non-2xx handling and issue notifications still function in both modes.

**Step 7 — Settings UI Control (Per Target)**
- Work: Add a minimal per-target format toggle/control in app-v3/components/SearchTargetsPage.tsx, including test webhook behavior.
- Acceptance criteria:
  - User can switch each target between v3 and legacy-v1.
  - Selection persists after save/reload.
  - Test webhook sends payload matching selected format.

**Step 8 — Documentation + Operator Guidance**
- Work: Document migration behavior and compatibility mode in README.md and payload examples in app-v3/utils/types.ts (or docs location you prefer).
- Acceptance criteria:
  - Docs clearly state default v3 behavior and legacy option purpose.
  - Docs include a concise migration note for v1 users.
  - Troubleshooting notes cover duplicate prevention and payload mode mismatch.

**Step 9 — Verification Pass (Blocking)**
- Work: Run targeted validation and manual QA before release.
- Acceptance criteria:
  - cd app-v3 && npm run compile passes.
  - Seeded v1 storage snapshot migrates exactly once on first run.
  - At least one target verified in each mode (v3, legacy-v1) with expected payload shape.
  - Alarm scheduling and manual scrape both work post-migration.

If helpful, next I can turn this into a release checklist artifact with owner/status columns (e.g., Todo/In Progress/Done) so you can track execution in order.
