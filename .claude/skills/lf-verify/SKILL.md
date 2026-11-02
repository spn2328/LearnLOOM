---
name: lf-verify
description: Run LearnLOOM's checks (source, answer keys, typecheck, demo build, E2E) and report results honestly. Use after any code/content change, before a commit or PR, or when asked "does it build/pass".
---

# Verify LearnLOOM

Run in this order and stop at the first failure (PowerShell: chain with `; if ($?) { ... }`):

```
pnpm test
node scripts/test-fake-hero.mjs
pnpm typecheck
pnpm build:demo
pnpm test:e2e        # only once Playwright exists (Phase 3); skip silently if script missing
```

Token rules
- Don't paste full logs. On failure, quote only the first error block (file:line + message).
- `pnpm build:demo` always warns about a large chunk — known, not a failure.

Browser check (when UI/flow changed)
1. Start dev demo: `pnpm exec vite --config vite.demo.config.ts` (background) — or use `.claude/launch.json` entry `demo` with the preview tool.
2. Prefer `read_page`/`get_page_text` over screenshots. Screenshot only to confirm layout.
3. Walk the affected path; check refresh/resume (localStorage `learnloom-fake-hero-v1`) and that first attempt stays recorded.
4. Mobile: resize to 375×812 and tablet 768×1024; reset to desktop afterwards.

Report format (to user and to `docs/fake-hero/state.md`)
- ✅ passed: list commands
- ❌ failed: command + first error
- ⏳ not checked: e.g. physical iPad, real students — say so explicitly. Never mark untested items as passed.
