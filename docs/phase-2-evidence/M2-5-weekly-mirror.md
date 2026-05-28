# M2-5 Weekly Mirror From Local Evidence

Date: 2026-05-28
Issue: #29
Decision: continue

## Why

The harness had daily session artifacts and review mechanics, but no weekly reflection. A learner needs a calm, evidence-backed summary of what they communicated, reused, repaired, and should practice next.

## What changed

- Added `weekly` command.
- Added `artifacts/weekly/weekly-mirror-YYYY-MM-DD.json`.
- Weekly mirror reads only local artifacts, progress, learner model, vocabulary, and review queue.
- Output includes communicated themes, saved phrases, reused phrases, repair attempts, skill evidence, and next focus.
- Output includes a claim boundary and avoids level ranking or guaranteed real-world transfer claims.

## Verification

Commands run:

```bash
node scripts/phase2-weekly-mirror-smoke.mjs
node scripts/phase2-learner-model-smoke.mjs
node scripts/phase2-review-vault-smoke.mjs
node scripts/phase2-scenario-planner-smoke.mjs
node scripts/phase2-tutor-policy-smoke.mjs
node scripts/phase1-command-wrapper-smoke.mjs
node scripts/phase1-persona-fixture-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
node scripts/phase1-vocabulary-history-smoke.mjs
```

Result: all passed.

Key weekly mirror smoke evidence:

```json
{
  "status": "pass",
  "sessionCount": 3,
  "communicatedThemeCount": 3,
  "savedPhraseCount": 3,
  "reusedPhraseCount": 1,
  "repairAttemptCount": 1,
  "nextFocus": {
    "skill": "follow_ups",
    "reason": "Lowest local evidence count (1)."
  }
}
```

## Remaining Boundary

This proves local weekly reflection generation. It does not prove measured language improvement or real-world transfer.
