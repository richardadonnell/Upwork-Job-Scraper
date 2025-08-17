---
description: "Scoped Copilot instructions for storage.js (config API & migrations)"
applyTo: "upwork-job-scraper/storage.js"
---

# storage.js — file-scoped rules

Purpose: keep storage APIs stable and migrations safe.

Quick rules
- Persistent config: store in `chrome.storage.sync.searchWebhookPairs`.
- Runtime data: `chrome.storage.local.scrapedJobs`, `scrapingLock`, `activityLog`.
- Do NOT rename or remove storage keys unless adding a `migrateStorage()` change here.
- All public functions (`getAllPairs`, `getEnabledPairs`, `addPair`, `updatePair`, `removePair`, `migrateStorage`) should return Promises and throw on invalid inputs.

Contracts
- `getAllPairs()` — returns array of pair objects (id, name, searchUrl, webhookUrl, enabled, createdAt).
- `getEnabledPairs()` — filters `getAllPairs()` by `enabled === true`.
- `addPair(name, searchUrl, webhookUrl)` — validates via `validatePair()` and persists.
- `updatePair(id, updates)` — must throw if id not found.
- `migrateStorage()` — only run migration when no pairs exist; preserve existing data otherwise.

Edge cases & expectations
- Validation: `validatePair()` should set sane defaults (default searchUrl) and ensure strings.
- Migration: when adding a migration, include a deterministic path and remove old keys after migration.
- Concurrency: use `chrome.storage.sync.get`/`set` in atomic patterns; avoid read-modify-write races where possible.

PR checklist (file-specific)
- If changing storage shape, add `migrateStorage()` changes and document steps in PR description.
- Include a manual verification: call `addPair()` and `getAllPairs()` and confirm persistence across reloads.

Manual verification
1. In extension console, run:

```javascript
await globalThis.addPair('Test','https://www.upwork.com/nx/search/jobs/?q=node','');
console.log(await globalThis.getAllPairs());
```

2. Confirm `chrome.storage.sync.searchWebhookPairs` contains the new pair.
