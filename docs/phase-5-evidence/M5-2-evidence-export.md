# M5-2 Seven-Day Evidence Export

Date: 2026-05-29
Issue: #63

## Decision

Continue.

The seven-day protocol needs a compact review artifact. M5-2 adds an explicit export path so reviewers do not need to inspect scattered local JSON, journals, weekly mirrors, and learner home files manually.

## Implementation

- Added `export` command to `scripts/english-learning-harness.mjs`.
- The command writes JSON and Markdown packs under `artifacts/validation/`.
- The pack summarizes sessions, learner word counts, repair evidence, interaction events, review reuse, weekly mirrors, learner home presence, and skill evidence.
- Local learner roots and source media paths are redacted or marked local-only inside the pack.
- Added `scripts/phase5-evidence-export-smoke.mjs`.
- Added the evidence pack contract to `docs/DATA-CONTRACTS.md`.

## Verification

Run:

```bash
node scripts/phase5-evidence-export-smoke.mjs
node scripts/phase3-seven-day-simulation-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- export works from the generated seven-day learner store;
- evidence JSON and Markdown files exist;
- pack includes seven sessions, weekly mirror summary, review queue summary, and interaction event count;
- local learner root is redacted in the JSON pack;
- Markdown does not expose the learner root path;
- unsupported improvement, fluency, or guarantee claims do not appear.

## Claim Boundary

This proves evidence export mechanics for review. It does not prove learning improvement, fluency, or real-world speaking ability.
