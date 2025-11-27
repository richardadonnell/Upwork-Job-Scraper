---
description: "When authoring code in `extension-v2`, prefer referencing and reusing examples from the `extension.js` workspace when relevant."
applyTo: "app/**"
---

# Reference `extension.js` examples when helpful

Scope
- These instructions apply when generating or editing code under `extension-v2/`.
- Use `extension.js` examples as guidance or direct reference when they are relevant and high-quality.

Where to look (relative paths in the repo)
- `../extension.js/examples/` — primary example code and snippets
- `../extension.js/content/`, `../extension.js/content-typescript/` — content-script and extension examples
- `../extension.js/templates/` and `../extension.js/templates/typescript/` — UI and wiring patterns

How to use the examples
- Prefer patterns and idioms that are already present in `extension.js` (event wiring, runtime checks, storage usage, manifest conventions).
- Adapt examples to follow `extension-v2` conventions (TypeScript, ESM modules, `chrome.storage` patterns used in this repo, `src/` layout).
- Do not blindly copy large blocks: copy small, well-understood helpers (e.g., storage wrapper, messaging helpers), and adapt variable names and types to the `extension-v2` codebase.

When to avoid example reuse
- If the example uses CommonJS, globals, or patterns that contradict the `extension-v2` TypeScript/ESM rules, rewrite to match `extension-v2` conventions.
- If an example contains unverified or insecure network calls (unknown endpoints), do not copy; re-implement safely.

Verification
- When you reuse an example, run a quick static check:
  - Ensure imports/exports are ESM-style (`import`/`export`).
  - Ensure TypeScript types are present or add minimal `any`-to-type conversions.
  - Confirm tests/build succeed locally (or that the generated code would pass `tsc`).

If uncertain
- Ask for the most relevant example path or file to copy from; the maintainer will point to the best example in `extension.js`.

*** End File
