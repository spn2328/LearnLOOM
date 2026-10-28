# LearnLOOM

## Vercel demo

`vercel.json` builds the browser-only demo with `pnpm build:demo` into
`dist-demo`. No database, authentication provider, API routes, or secrets are
required for this deployment. The original full-stack build remains available
with `pnpm build`.

The demo supports a learner nickname, original story/questions, local progress,
learning reports, molecule models, and backup export/import. Progress is stored
under `learnloom-demo-v1` in this browser only; clearing browser data removes it.
Use nicknames, not real student personal information. Teacher login, real
classrooms, cross-device synchronization and classroom messaging are not active.
The persistent demo banner makes these limits explicit; teacher registration and
online sign-in are disabled. Guide text describing online services belongs to the
full product, not the demo. No existing learner database is imported or changed.

## GitHub import and optimization — 2026-10-28

Imported from `LearnLOOM_Complete_Website.zip`. This archive contains the original
36 two-part evidence items, not a separately revised question manuscript.
Question wording, answers, scoring rules and story text were preserved.

- Lossless WebP images and WOFF2 fonts: 6,718,523 → 4,675,978 bytes (30.4% smaller).
  Image RGBA pixels were verified identical to the source PNGs; no resizing.
- The Three.js viewer now loads on demand. Lightweight 2D models remain available
  without loading Three.js. Offline preparation explicitly downloads the viewer.
- Updated the offline asset cache version and added source checks.

Verification for this import: `pnpm test`, `pnpm typecheck`, and `pnpm build`
passed. The production build still warns about a large chunk; no Lighthouse
score, physical-device test, or authenticated classroom acceptance test is claimed.

### Run locally

Use Node.js 24 and pnpm 11.25.0 (the checked-in lockfile).

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm dev
```

The dev server uses port 5173 and local Cloudflare bindings. For full data flows,
apply the checked-in SQL migrations to the configured D1 database. Deployment
needs a Cloudflare-compatible server, D1, and the existing Sites authentication
integration or a deliberate authentication replacement. Uploading this repository
does not deploy the website. GitHub Pages alone cannot run its API and database.
Never publish local database files, credentials or learner data.

To repeat asset conversion from original PNG/TTF files, install Python packages
`Pillow fonttools brotli`, then run `python3 scripts/optimize-assets.py`.

Thai M.1 chemistry learning site: ห้องเก็บสารไร้ป้าย — คดีที่ตาเปล่าตัดสินไม่ได้.

## Experience

Tap or click the story scene to reveal a line, then advance. Keyboard navigation, read-aloud, reading settings, three chapters, 36 two-part evidence items, adaptive support, activities, a Three.js molecule viewer with 2D fallback, breaks, learner history, teacher classrooms and scoped chat.

Registered identities use Sites ChatGPT sign-in. Nickname profiles use a browser-specific secure cookie. No email/password account service is provisioned. Teacher data is limited to classrooms owned by that identity. The export creates a genuine four-sheet XLSX file. Automatic cloud Excel updates are not connected.

D1 is the durable data source. Device storage is an offline replica/outbox. Run revision checks detect conflicts; first submitted answers are frozen and re-scored on the server. Service worker preparation downloads the learning assets. Offline speech requires an installed Thai voice.

## Validation — 2026-09-19

- TypeScript checks and production compilation passed.
- Verified all 36 item IDs, phase counts, two-format independent evidence, transfer evidence, incomplete/assisted exclusions, three score levels, paired comparison and break thresholds.
- Generated XLSX opened with openpyxl: four sheets, Thai text, escaped input and calculated scores.
- Internal browser: nickname setup, dashboard, tap-to-advance story, six opening questions with no interim feedback, break choices/timer, return to learning, notebook, CO2 atom labels, saved progress and refresh/resume.
- D1 held six distinct first answers after the opening sequence.
- Preview browser disables WebGL; the 2D fallback was verified. 3D uses actual Three.js orbit/pan/zoom controls but GPU interaction requires a supporting browser.
- Responsive styles are implemented. A physical mobile device was not tested.
- WebMCP registration is feature-detected; validation was unavailable because this preview browser did not expose modelContext.
- Offline reload and authenticated multi-account classroom flows still require acceptance testing in HTTPS deployment with real accounts. No such results are claimed.

## Limits and next acceptance checks

This is a working educational prototype, not a validated efficacy study. Learning levels are evidence rules, not permanent learner labels. Read-aloud depends on available browser voices. Guides currently use written and interactive steps, not recorded demonstration videos. Test classroom membership, teacher exports and offline reconnection with the intended student devices before classroom use.

## Development

Use the existing pnpm lockfile and Sites scripts. Generate migrations after schema changes. The logical DB binding is declared in .openai/hosting.json. Do not commit local database contents, credentials or device caches.
