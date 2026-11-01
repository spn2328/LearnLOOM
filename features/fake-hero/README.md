# The Fake Hero — demo implementation

This folder contains an **EP.01 excerpt only** (Scene 01–03, C01), not a completed episode. It is isolated from the original LearnLOOM experience.

## Layout
```text
features/fake-hero/
├── README.md                  # implementation guide
├── components/
│   └── FakeHero.tsx           # interactive pages, branching and local progress
└── styles/
    └── fake-hero.css          # responsive styling
```

## Entry point
`demo/main.tsx` conditionally loads `FakeHero` with `?fake-hero`. Without that query, the existing LearnLOOM app remains the default. The feature imports its own CSS.

## Content fidelity
The confirmed reference is `เนื้อเรื่องและคำถามล่าสุด.pdf`, Scene 01–03 (pages 2–7). Name: **เจฟ**. S01, Q01, Q01-E, R01-1, R01-2 and RC01 options and keys must not be changed without project-owner approval. A02 notebook is a condensed interactive adaptation rather than a verbatim transcript; compare with the manuscript during review.

## Deliberate limitations
- Images, video, timeline scrubbing, drag-and-drop and 3D assets are **not implemented** yet.
- Text-only evidence inspection uses three buttons as a replacement for clickable video hotspots.
- The demo's assist flow currently implements the selected R01 Path B; other incorrect responses share a general support path, not a validated individual diagnosis.
- Progress stays in this browser under `learnloom-fake-hero-v1`; there is no user account or cross-device sync.
- Data and conclusion apply only to C01 in an EP.01 excerpt, not full learning outcomes or an actual environmental investigation.
- Phase 4/5 are deferred.

## Validation required before merge
```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build:demo
```
Then serve the demo and open `/?fake-hero`. Test S01 incorrect/correct, A03 each substance, Q01+reason all routing cases, assisted RC01 correct/incorrect, reset, reload, Thai text and touch interaction. No physical-device/browser/build validation is claimed yet.

The primary plan is in `docs/fake-hero/`; log verified results in `docs/fake-hero/state.md`.
