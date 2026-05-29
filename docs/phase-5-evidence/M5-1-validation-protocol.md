# M5-1 Seven-Day Validation Protocol

Date: 2026-05-29
Issue: #62

## Decision

Continue.

M5 needs a protocol before export, rubric, persona fixtures, or real learner claims. The protocol fixes the evidence lanes, day schedule, before/after prompt categories, pass/pivot thresholds, and privacy handoff.

## Implementation

- Added `docs/M5-SEVEN-DAY-VALIDATION-PROTOCOL.md`.
- The protocol separates persona fixture evidence from real learner pilot evidence.
- The protocol defines Day 0 through Day 7 artifacts.
- The protocol defines comparable prompt categories for before/after review.
- The protocol defines continue/split/pivot/research/kill-claim thresholds.
- The protocol records privacy and local-data handoff boundaries.

## Verification

Review against:

```bash
docs/LEARNING-ENGINE.md
docs/PRODUCT-ROADMAP.md
docs/ADAPTIVE-EXECUTION-PLAN.md
```

Expected evidence:

- protocol requires at least Day 0, five daily sessions, and Day 7 final sample for a minimum valid pilot;
- protocol measures return behavior, voluntary output, repair, phrase reuse, comfort, and friction;
- protocol does not claim fluency, generalized efficacy, or guaranteed improvement;
- dashboard next target moves to #63.

## Claim Boundary

This defines validation criteria. It does not produce persona fixture evidence, real learner evidence, or learning-impact proof.
