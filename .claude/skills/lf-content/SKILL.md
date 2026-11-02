---
name: lf-content
description: Add or edit The Fake Hero lesson content (scenes, concepts C01–C05, questions Q/Q-E, adaptive paths R/D/RC, checkpoint, transfer) while preserving the owner's source wording. Use for any chemistry/story/question change or when adding a new Episode.
---

# Edit Fake Hero content

## Where content lives
- EP.01 data: `features/fake-hero/content/episode01.ts` — `lessons[]` (one per concept C01–C05), `checkpoint[]`, `checkpointReasons[]`.
  Type: `Question={id,prompt,choices,answer}`; `Lesson={scene,title,story,concept,models,activity,main,reason,practice,recheck,note}`.
- C01 is hard-coded in `features/fake-hero/components/FakeHero.tsx` (S01, A03, Q01, Path B, RC01).
- Answer keys are asserted in `scripts/test-fake-hero.mjs` — update it together with any key/ID change.
- New episode → new file `features/fake-hero/content/episodeNN.ts` with the same types; unlock it in `LearningHub.tsx`.

## Finding source text cheaply
1. Grep the id (e.g. `Q03`, `R02`, `Scene 05`) in `docs/sources/เนื้อเรื่องและคำถามล่าสุด.extracted.md` → note `<!-- page N -->`.
2. Read only that page of the PDF (`Read` with `pages: "N"`) to copy exact Thai wording (the extract drops tone marks).
3. Grep the same id in `episode01.ts` and Read only that line range.

## Rules
- Copy question/choices/answers/dialogue verbatim from the PDF. Do not "improve" wording. If something looks wrong (chemistry, typo, conflicting names like เจฟ/เต), stop and ask the owner; the owner already confirmed **เจฟ**.
- Content Claude drafts itself (e.g. `checkpointReasons`) must be labelled as drafted and listed for teacher review in `state.md`.
- Keep first-attempt vs assisted/recheck separation in data and scoring.
- Chemistry formulas use Unicode subscripts (CH₄, CO₂, Na₂CO₃) as in existing data.
- Adaptive feedback must not claim a definitive diagnosis; rule-based paths are "suggestions".

## Done when
`lf-verify` passes and the change + any items needing teacher review are recorded via `lf-ship`.
