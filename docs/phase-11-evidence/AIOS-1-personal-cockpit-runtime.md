# AIOS-1 Personal Learner Cockpit Runtime

Date: 2026-06-02
Status: implemented

## Why

The repository had a learner-facing cockpit preview under `docs/product/`, but the real learner runtime still depended on separate commands such as `daily`, `home`, `weekly`, and `export`.

The AI-native English Learning Operating System needs one daily product surface generated from the learner's local state.

## What Changed

- Added learner-root `cockpit-state.json`.
- Added learner-root `cockpit.html`.
- Added `node scripts/english-learning-harness.mjs cockpit`.
- Connected cockpit generation to:
  - daily mission selection,
  - Speaking Skill OS backlog and skill evidence,
  - due review and phrase vault,
  - text/voice/image interaction events,
  - 7-day and 30-day journey summaries,
  - weekly mirror and pilot report pointers.

## Verification

```bash
node scripts/personal-learner-cockpit-smoke.mjs
```

The smoke creates a fixture learner, runs diagnosis plus text/voice/image sessions, writes a weekly mirror, generates the personal cockpit, and verifies:

- `cockpit-state.json` exists.
- `cockpit.html` exists.
- 7-day and 30-day windows count the same three sessions.
- text, voice, and image modalities appear in journey evidence.
- Speaking Skill OS backlog is represented.
- rendered HTML includes product sections and interactive disclosure controls.
- engineering terms such as PR, issue, GitHub, and smoke status do not leak into the learner product surface.

## Claim Boundary

This proves local personal cockpit mechanics and evidence aggregation. It does not prove real learner outcome improvement, live realtime voice, or generated-media learning gains.
