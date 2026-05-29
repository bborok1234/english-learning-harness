# M5-4 Target-Persona Seven-Day Validation Fixture

Date: 2026-05-29
Issue: #65

## Decision

Continue.

Before asking real learners to run a seven-day pilot, the four target personas need a controlled M5 rehearsal. This keeps protocol, export, transcript rubric, review reuse, and claim-boundary checks separate from real learner evidence.

## Implementation

- Added `scripts/phase5-persona-validation-smoke.mjs`.
- The smoke runs seven-day validation loops for:
  - 지은,
  - 민호,
  - 수진,
  - 혜원.
- Each persona gets its own learner root.
- Each persona runs seven `today` sessions, review reuse, weekly mirror generation, learner home generation, evidence export, and transcript rubric scoring.
- 재훈 remains excluded from target validation and stays non-target-adjacent redirect/smoke only.

## Verification

Run:

```bash
node scripts/phase5-persona-validation-smoke.mjs
node scripts/phase5-transcript-rubric-smoke.mjs
node scripts/phase5-evidence-export-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- all four target personas produce seven sessions;
- each persona has a weekly mirror with reuse and repair evidence;
- each persona has a generated evidence pack;
- each persona passes transcript rubric with `decision: "continue"`;
- prohibited persona and validation claims do not appear.

## Result Summary

Smoke output shows:

- fixture count: 4;
- personas: `jieun`, `minho`, `sujin`, `hyewon`;
- each persona session count: 7;
- each persona reused review item count: 6;
- each persona rubric decision: `continue`.

## Claim Boundary

Persona fixtures are simulated validation only. They do not prove real learner outcomes.
