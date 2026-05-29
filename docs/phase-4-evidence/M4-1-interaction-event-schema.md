# M4-1 Interaction Event Graph Schema

Date: 2026-05-29
Issue: #50

## Decision

Continue.

M4 needs a shared evidence contract before adding voice, image, or video paths. Otherwise modalities become disconnected media features instead of learning evidence.

## Implementation

- Added `interaction_events` to session artifacts.
- Added `buildInteractionEvents()`, `validateInteractionEvent()`, and `validateInteractionEvents()`.
- Existing text-first sessions now produce `modality: "text"` interaction events.
- Added event data contract documentation.
- Added `scripts/phase4-interaction-event-schema-smoke.mjs`.

Each event records:

- modality,
- scenario,
- learner intent,
- learner output,
- trouble source,
- mediation level,
- repair move,
- retry output,
- saved phrase,
- transfer targets,
- claim boundary.

## Verification

Run:

```bash
node scripts/phase4-interaction-event-schema-smoke.mjs
node scripts/phase1-command-wrapper-smoke.mjs
node scripts/phase3-seven-day-simulation-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- text-first `today` artifact contains a valid interaction event;
- validator rejects unsupported modality;
- validator rejects missing learner output;
- validator rejects missing mediation level;
- validator rejects missing claim boundary;
- validator rejects unsupported fluency/native-speaker claims.

## Claim Boundary

This makes sessions multimodal-ready at the schema level. It does not implement realtime voice, image generation, or video generation.
