# M10-1 Narrative Mission Design Contract

Issue: #143
Status: implemented on PR branch
Decision: continue

## Why

The next product direction is not generic roleplay or worldbuilding. M10 must prove that a narrative mission is a verified transfer wrapper around Speaking Skill OS.

## What Changed

- Added `docs/M10-NARRATIVE-MISSION-PRD.md`.
- Added `docs/M10-NARRATIVE-MISSION-TEST-SPEC.md`.
- Added M10 mission/world/capability contracts to `docs/DATA-CONTRACTS.md`.
- Created M10 execution issues #143-#148.
- Added a planning smoke to prevent M10 from drifting into cosmetic gamification.

## Cross-Review Result

Claude CLI review agreed with the direction only under one constraint:

> Mission win condition must be equivalent to the Speaking Skill OS transfer test.

If story progress can happen without learner output and transfer evidence, the mission is decorative and must be rejected.

## Verification

Expected checks:

```bash
node scripts/phase10-narrative-mission-plan-smoke.mjs
node scripts/phase9-pilot-prompt-ux-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

## Claim Boundary

This is a design contract. It does not implement mission generation and does not prove that narrative immersion improves learning.
