# M5-3 Before/After Transcript Review Rubric

Date: 2026-05-29
Issue: #64

## Decision

Continue.

M5 needs a stable way to compare Day 0 and Day 7 transcript samples without drifting into fluency, level, or guarantee claims. M5-3 adds a deterministic rubric for observable behavior only.

## Implementation

- Added `scripts/lib/transcript-review-rubric.mjs`.
- Added `scripts/phase5-transcript-rubric-smoke.mjs`.
- Added `docs/M5-TRANSCRIPT-REVIEW-RUBRIC.md`.
- The rubric compares:
  - voluntary output,
  - clarification markers,
  - repair markers,
  - saved phrase reuse,
  - comfort proxy.
- The rubric rejects:
  - missing baseline/final samples,
  - mismatched prompt sets,
  - native-speaker, fluency, level, guarantee, or real-world proof claims.

## Verification

Run:

```bash
node scripts/phase5-transcript-rubric-smoke.mjs
node scripts/phase5-evidence-export-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- positive fixture returns `decision: "continue"`;
- positive fixture has at least three pass signals;
- negative unsupported-claim fixture fails with `unsupported_claim`;
- mismatched prompt fixture fails with `prompt_set_mismatch`;
- missing sample fixture fails with `missing_sample`.

## Claim Boundary

This evaluates transcript evidence quality. It does not certify fluency, level, or real-world speaking ability.
