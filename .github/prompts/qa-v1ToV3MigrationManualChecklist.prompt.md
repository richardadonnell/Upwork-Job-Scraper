## Manual QA Checklist: v1 → v3 Migration + Webhook Compatibility

Use this checklist before releasing `3.x` publicly.

### Preconditions
- Test build installed from current branch.
- A test profile with seeded legacy v1 storage keys (`searchWebhookPairs`, `jobScrapingEnabled`, `checkFrequency`, `schedule`, `notificationsEnabled`, `scrapedJobs`).
- At least two webhook endpoints available (or request bins): one for `legacy-v1`, one for `v3`.

### A. One-time migration behavior
- [ ] First extension startup after update triggers migration and does not crash background worker.
- [ ] Legacy targets appear under Search Targets with expected names/search URLs/webhook URLs.
- [ ] Legacy schedule/frequency/master toggle/notifications are preserved in v3 settings.
- [ ] Legacy job history appears in Job History tab (capped and ordered correctly).
- [ ] Migration does not re-run on browser restart (idempotent behavior confirmed).

### B. Webhook payload compatibility modes
- [ ] Imported target defaults to `legacy-v1` payload mode.
- [ ] New target defaults to `v3` payload mode.
- [ ] Test webhook for `legacy-v1` sends array payload shape expected by v1 automations.
- [ ] Test webhook for `v3` sends envelope payload with `status`, `targetName`, `jobs`, `timestamp`.
- [ ] Switching payload mode persists after refresh/reopen.

### C. Scrape + dedupe behavior
- [ ] Manual scrape runs successfully with migrated settings.
- [ ] Previously migrated legacy jobs are not immediately re-sent as new jobs.
- [ ] Newly discovered jobs are appended once and added to seen IDs.

### D. Error-path checks
- [ ] Webhook non-2xx responses are treated as failures and logged.
- [ ] Invalid webhook URL/test endpoint reports clear failure in UI.
- [ ] Alarm scheduling still works after migration (scheduled scrape triggers).

### E. Release gate checks
- [ ] Release is prepared as update to the same Chrome Web Store listing (same extension ID continuity).
- [ ] README migration/compatibility notes are present and accurate.
- [ ] `npm run compile` passes in `app-v3`.

### Sign-off
- QA owner:
- Date:
- Result: PASS / FAIL
- Notes:
