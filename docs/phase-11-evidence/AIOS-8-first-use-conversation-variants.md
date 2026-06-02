# AIOS-8 First-Use Conversation Variants

## Why

AIOS-6 proved one learner-facing transcript fixture, but one "usual place" prompt is not enough for a daily English learning OS. A first-time Korean learner needs concrete everyday variety without being asked to run commands or understand engineering terms.

## What Changed

- Added first-use variant guidance to `skills/daily-session/SKILL.md`.
- Added `scripts/skill-conversation-variants-smoke.mjs`.
- The new smoke covers office clarification, cafe repair, nearby object description, and lunch soft-disagreement scenes.
- Each variant still runs through the Codex-operated `practice` flow and verifies mission, scene, session, learner report, and cockpit artifacts.

## Verification

```bash
node scripts/skill-conversation-variants-smoke.mjs
node scripts/skill-conversation-simulation-smoke.mjs
node scripts/codex-operated-practice-flow-smoke.mjs
```

## Claim Boundary

This proves local first-use transcript variety and persistence mechanics. It does not prove real learner engagement, retention, fluency, or realtime voice support.
