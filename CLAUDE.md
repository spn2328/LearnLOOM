# LearnLOOM — The Fake Hero (Claude Code guide)

Thai M.6 organic-chemistry detective-story learning site. Series "The Fake Hero" (1 Chapter = 1 series, EP.01–EP.06).
Production = browser-only Vite demo on Vercel (`pnpm build:demo` → `dist-demo`), https://learnloom-murex.vercel.app/
Owner: spn2328 (push rights). Language: UI/content Thai; keep code comments/commits English.

## Read first (only these, in order)
1. `docs/fake-hero/state.md` — current status, last release, known gaps. Read the **top table + last 2 sections** only.
2. `docs/fake-hero/roadmap.md` — phased plan; find the active phase.
3. Use project skills instead of re-deriving process: `lf-content`, `lf-verify`, `lf-ui-guard`, `lf-ship`.

## Commands (Windows PowerShell, Node 26, pnpm 11.25.0)
- `pnpm install --frozen-lockfile`
- `pnpm test` (source checks) · `node scripts/test-fake-hero.mjs` (EP.01 answer keys) — CI runs both (`.github/workflows/fake-hero-demo.yml`)
- `pnpm typecheck` · `pnpm build:demo` · dev demo: `pnpm exec vite --config vite.demo.config.ts`
- Full-stack (`pnpm build`/`pnpm dev`, Cloudflare D1) is legacy — do not touch unless asked.

## Code map (files are minified into very long lines — NEVER Read whole; Grep for an id, then Read with offset/limit)
| Path | Role |
|---|---|
| `demo/main.tsx` | Entry. Default renders `LearnloomApp`; `?standalone` renders `FakeHero` alone |
| `components/learnloom-app.tsx` | Original cream/green dashboard shell + sidebar views (`fakehero`, `courses`, `skills`, `notebook`, `certificates`) |
| `features/fake-hero/content/episode01.ts` | **EP.01 content**: `lessons` (C01–C05), `checkpoint`, `checkpointReasons` |
| `features/fake-hero/components/FakeHero.tsx` | C01 flow: Scene 01–03, S01, L01, A03, Q01/Q01-E, Path B, RC01 (storage `learnloom-fake-hero-v1`) |
| `features/fake-hero/components/EpisodeContinuation.tsx` | C02–C05, Scene 04–09, S02, Recheck, Checkpoint (10 pts), Transfer, Report |
| `features/fake-hero/components/LearningHub.tsx` | Chapter library, My Progress, Notebook, Certificates (reads localStorage) |
| `features/fake-hero/styles/fake-hero.css` | Feature-scoped CSS |
| `app/globals.css` (57KB) | Global theme — protected, see `lf-ui-guard` |
| `lib/content.ts`, `components/{lesson,reports,support}.tsx` | Legacy M.1 curriculum (still used by old Home/My Skills panels) |
| `scripts/test-fake-hero.mjs` | Verifies question bank / answer keys |

## Source of truth (local only, gitignored)
`docs/sources/*.pdf` = owner's latest story/question + web-spec PDFs.
`docs/sources/*.extracted.md` = machine text extract; **Thai tone marks are dropped** → use only to locate a page (`<!-- page N -->`), then Read that PDF page to quote exact wording.

## Hard rules
- Never change question text, choices, answer keys or story dialogue confirmed from the PDF. Report suspected errors to the owner instead.
- Never change the look (palette, Itim font, layout, sidebar) unless the owner explicitly asks.
- First attempt is recorded separately from assisted/recheck attempts; never overwrite it.
- No real student data in the repo; nicknames only. Don't claim cloud sync / offline / dashboard / device tests that weren't actually done.
- "Code written" ≠ "tested". Report only verified results.
- Work on a branch + PR; never push to `main` directly unless the owner says so in chat.
