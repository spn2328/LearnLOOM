---
name: lf-ship
description: Branch, commit, update docs/fake-hero/state.md, push and open a PR for LearnLOOM. Use when starting a task (branch) and when finishing one (state + PR).
---

# Ship a change

## Start
```
git fetch origin; git switch main; git pull --ff-only
git switch -c <type>/<short-topic>     # type: feat | fix | content | test | docs | chore
```

## Finish
1. Run `lf-verify`.
2. Update `docs/fake-hero/state.md` — **append** one short section (≤ 12 lines), Thai, dated (พ.ศ.):
   - สิ่งที่ทำ (files changed) · ผลตรวจ (✅/❌/⏳ from lf-verify) · ค้างตรวจ/ต้องให้ครูตรวจ
   - Update the Phase table at top only if a phase status actually changed.
3. Commit (English, imperative): `feat(ep01): add Path A for Q02` — small commits, no `--no-verify`.
4. `git push -u origin HEAD`, then open a PR to `main` (GitHub CLI `gh pr create --fill` if installed; otherwise give the user the compare URL `https://github.com/spn2328/LearnLOOM/compare/main...<branch>`).
5. Vercel builds a preview per PR. Merge only when the owner says so in chat. Production = merge to `main`.

## Never
- Commit `docs/sources/`, `.env*`, local DBs, student data.
- Force-push `main`, or merge without the owner's explicit OK.
