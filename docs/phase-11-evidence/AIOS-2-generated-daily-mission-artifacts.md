# AIOS-2 Generated Daily Mission Artifacts

Date: 2026-06-02
Status: implemented

## Why

The personal cockpit can now show learner progress, but the larger AI-native OS goal also requires the harness to generate fresh learning scenes and artifacts that lead back into speaking evidence.

## What Changed

- Added `node scripts/english-learning-harness.mjs mission`.
- Added learner-root mission artifacts under `artifacts/missions/`.
- Each generated mission writes:
  - `daily-mission-YYYY-MM-DD.json`
  - `daily-mission-YYYY-MM-DD.html`
- Mission artifacts are generated from the current Speaking Skill OS item or daily scenario.
- Mission artifacts include:
  - a concrete learner-facing scene,
  - required learner action,
  - transfer test,
  - text-first start command,
  - optional voice transcript command,
  - optional image information-gap command,
  - image/voice prompt material,
  - claim boundary.
- The personal cockpit now points to the latest generated mission artifact.

## Verification

```bash
node scripts/generated-daily-mission-smoke.mjs
```

The smoke creates a learner, seeds a Speaking Skill OS backlog item, generates a mission, renders the HTML, runs a `today` session from the generated mission example, and verifies the personal cockpit links the generated mission plus the resulting interaction evidence.

## Claim Boundary

This proves generated mission artifact mechanics only. It does not prove learning outcomes, generated-world retention, or realtime voice.
