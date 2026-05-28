# M2-1 Learner Model Baseline and Skill Memory

Date: 2026-05-28
Issue: #25
Decision: continue

## Why

The M1 harness could persist sessions, vocabulary, and review items, but it did not remember conversation skill evidence. That made the product look like a logging wrapper instead of an adaptive speaking practice harness.

## What changed

- Added `learner-model.json` to the learner store.
- Created and validates the schema from `docs/DATA-CONTRACTS.md`.
- Migrates missing learner model files during setup/health/session/context without changing existing progress totals.
- Updates starts, follow-ups, clarification, repair, and soft-disagreement evidence during session persistence.
- Persists learner model evidence into each session artifact.
- Adds learner model summary to context output.
- Includes learner model in setup repair backup/recreate flow.

## Verification

Commands run:

```bash
node scripts/phase2-learner-model-smoke.mjs
node scripts/phase1-command-wrapper-smoke.mjs
node scripts/phase1-vocabulary-history-smoke.mjs
node scripts/phase1-scenario-loop-smoke.mjs
node scripts/phase1-setup-recovery-smoke.mjs
node scripts/phase1-stop-finalization-smoke.mjs
node scripts/phase1-persona-fixture-smoke.mjs
node scripts/phase1-full-flow-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Result: all passed.

Key learner model smoke evidence:

```json
{
  "status": "pass",
  "updatedSkills": ["starts", "repair", "soft_disagreement"],
  "learnerModel": {
    "starts": 1,
    "repair": 1,
    "averageUtteranceWords": 10,
    "repairPhraseCount": 1
  },
  "migration": {
    "learnerModelCreated": true,
    "preservedAttendance": 2
  }
}
```

## Remaining Boundary

The current evidence detection is deterministic text/scenario heuristics. That is enough for M2-1 baseline memory, but M2-3 and M2-4 must improve how memory affects scenario selection and tutor policy quality.
