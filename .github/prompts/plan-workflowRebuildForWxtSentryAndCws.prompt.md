## Plan: Rebuild Release Workflows + Harden Env/Secrets (Detailed)

This plan assumes we fully discard existing workflows and replace them with a minimal, best-practice pipeline aligned to WXT, GitHub Actions, Sentry, and Chrome Web Store API guidance. We keep runtime Sentry enabled in production, use tag-only releases, upload-only to CWS (manual publish in dashboard), and enforce environment-gated production secrets. The key simplification is to avoid chained `workflow_run` orchestration and move to a direct two-workflow model with strict permissions and clear responsibilities.

**Steps**
1. **Security reset first**
   - Rotate any Sentry tokens previously exposed in local/shared context.
   - Replace local values in `.env` and update GitHub secrets before enabling new release workflow.

2. **Delete legacy workflow chain**
   - Remove [`.github/workflows/zip-on-pr.yml`](.github/workflows/zip-on-pr.yml).
   - Remove [`.github/workflows/auto-release.yml`](.github/workflows/auto-release.yml).
   - Remove [`.github/workflows/sentry-publish.yml`](.github/workflows/sentry-publish.yml).
   - This eliminates duplicate build/upload paths and fragile workflow-run dependencies.

3. **Create new Workflow A: CI Validate**
   - Add [`.github/workflows/ci-validate.yml`](.github/workflows/ci-validate.yml).
   - Trigger on `pull_request` to `main` (optionally also `push` to `main`).
   - Run from repo root with `working-directory: app-v3` for build steps.
   - Execute: install, compile, build, zip.
   - Upload zip artifact with short retention (3–7 days) for review convenience.
   - Set least privilege permissions (`contents: read`).
   - Do not expose production secrets in this workflow.

4. **Create new Workflow B: Release + Publish**
   - Add [`.github/workflows/release-publish.yml`](.github/workflows/release-publish.yml).
   - Trigger only on tag push `v*`.
   - Bind to GitHub Environment (for example `production`) with required reviewers.
   - Build once, then reuse outputs for all release actions (no re-build per step).
   - Create/update GitHub release and attach zip artifact.
   - Upload sourcemaps to Sentry in this same workflow (single source of truth).
   - Perform Chrome Web Store API upload-only step (no publish endpoint call).

5. **Align Sentry upload ownership**
   - Keep runtime Sentry initialization in app code as-is.
   - Ensure CI workflow is authoritative for sourcemap upload.
   - In [app-v3/wxt.config.ts](app-v3/wxt.config.ts), keep build behavior stable for local production debugging while avoiding conflicting “second uploader” logic.
   - Keep release naming deterministic and consistent with runtime tagging (`upwork-job-scraper@version`).

6. **Standardize env var contract**
   - Runtime/public extension config (safe in bundle): `WXT_SENTRY_DSN`, `WXT_SENTRY_ENVIRONMENT`, `WXT_SENTRY_RELEASE`, `WXT_SENTRY_TRACES_SAMPLE_RATE`, `WXT_SENTRY_ENABLE_LOGS`.
   - CI secrets only: `SENTRY_AUTH_TOKEN`, `CWS_CLIENT_ID`, `CWS_CLIENT_SECRET`, `CWS_REFRESH_TOKEN`.
   - CI non-sensitive vars: `SENTRY_ORG`, `SENTRY_PROJECT`, `CWS_EXTENSION_ID`.
   - Document in [`.env.example`](.env.example) and [README.md](README.md).

7. **Harden GitHub Actions security posture**
   - Pin all third-party actions to full commit SHA.
   - Set explicit `permissions` per job; default deny write where not needed.
   - Add `concurrency` on release workflow to prevent overlapping releases.
   - Never echo secrets; mask derived sensitive values.
   - Keep artifacts short-lived and avoid storing sensitive data in artifacts/caches.

8. **Implement CWS upload-only with official API flow**
   - Use OAuth refresh-token exchange in workflow runtime.
   - Upload built zip to CWS item ID.
   - Stop at upload response; do not call publish endpoint.
   - Keep manual publish/review step in CWS dashboard until confidence is high.

9. **Update project docs and runbook**
   - Extend [README.md](README.md) with:
     - new workflow architecture,
     - required secrets/variables,
     - release process (`v*` tag flow),
     - CWS upload-only behavior,
     - rollback and token-rotation instructions.
   - Keep operational guidance short and checklist-driven.

10. **Rollout safely**
   - First run: dry release tag in a test path (or temporary extension ID) to validate full CI.
   - Confirm Sentry release/sourcemap symbolication.
   - Confirm CWS upload appears correctly in dashboard.
   - Then promote as standard release process.

**Verification**
- PR pipeline passes compile/build/zip on [`.github/workflows/ci-validate.yml`](.github/workflows/ci-validate.yml) with no production secrets.
- Tag pipeline executes gated approval, builds once, creates release artifact, uploads sourcemaps, uploads extension package to CWS draft.
- Runtime Sentry events map to the same release used by sourcemap upload.
- Workflow logs show no secret leakage and permissions remain least-privilege.
- Existing legacy workflows are fully removed and no longer trigger.

**Decisions locked in**
- Legacy workflows are fully scrapped.
- Production release trigger is tag-only (`v*`).
- CWS mode is upload-only (manual publish in dashboard).
- All third-party actions are SHA-pinned.
- Production secrets are environment-scoped with required reviewer gate.
