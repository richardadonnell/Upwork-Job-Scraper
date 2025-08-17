---
description: "Scoped Copilot instructions for webhook.js (validation & POSTs)"
applyTo: "upwork-job-scraper/webhook.js"
---

# webhook.js — file-scoped rules

Purpose: ensure webhook delivery code is robust, secure, and observable.

Quick rules
- Validate webhook URLs with `isValidUrl()` before sending. Reject/skip invalid URLs and log via `addToActivityLog()`.
- Use operation breadcrumbs: `startOperation('sendToWebhook')`, `addOperationBreadcrumb()` and `endOperation()`.
- Use `fetch` for POSTs but wrap with a timeout (AbortController) to avoid hanging service worker.
- Do not include secrets in logs or in the webhook payload. Scrub or redact if necessary.
- On failure, log via `addToActivityLog()` and call `logAndReportError()` so Sentry captures the failure.

sendToWebhook contract
- Signature: `sendToWebhook(webhookUrl, jobs)` returns a Promise.
- Inputs: string `webhookUrl`, array `jobs` (job objects must include `title`, `url`, `scrapedAt`).
- Behavior: POST JSON body, include minimal job + source info, resolve on 2xx, reject on network/HTTP error after logging.
- Retries: caller may retry; keep sendToWebhook single-attempt but record failure details (status, error) in breadcrumbs.

Edge cases & expectations
- Invalid URL: do not attempt network call; log and return a rejected Promise.
- Non-2xx responses: capture status/text and reject with informative error; include breadcrumb.
- Transient network errors: log and reject; do NOT silently swallow errors.

PR checklist (file-specific)
- Add tests or a manual verification step showing successful POST with a mock endpoint.
- Ensure no plaintext secrets are written to logs.
- Keep `addOperationBreadcrumb` calls informative (include job count, first job title).

Manual verification
1. In extension environment, call `sendToWebhook('https://webhook.site/your-id', [{title:'t',url:'u',scrapedAt:Date.now()}])` from console.
2. Verify the endpoint received the payload and `chrome.storage.local.activityLog` contains a success or failure entry.
