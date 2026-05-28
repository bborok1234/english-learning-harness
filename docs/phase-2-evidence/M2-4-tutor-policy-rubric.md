# M2-4 Tutor Policy Rubric Enforcement

Date: 2026-05-28
Issue: #28
Decision: continue

## Why

The tutor policy existed as a document, but policy failures were not isolated into executable checks. That left the product vulnerable to becoming a grammar judge, a false-confidence generator, or a generic chatbot.

## What changed

- Added `scripts/lib/tutor-policy-rubric.mjs`.
- Added stable violation codes for prohibited claims, mini mirror shape, Korean dead-end, correction ladder order, and overcorrection.
- Updated Korean fallback response to bridge back to a small English phrase.
- Updated assistant follow-up ordering so small repair prompts precede natural recasts.
- Integrated the rubric into the persona fixture harness.
- Added negative fixture smoke for each major violation class.

## Verification

Commands run:

```bash
node scripts/phase2-tutor-policy-smoke.mjs
node scripts/phase1-persona-fixture-smoke.mjs
node scripts/phase1-scenario-loop-smoke.mjs
node scripts/phase2-scenario-planner-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Result: all passed.

Key tutor policy smoke evidence:

```json
{
  "status": "pass",
  "negativeViolations": [
    "prohibited_claim",
    "mini_mirror_missing_field",
    "korean_dead_end",
    "correction_ladder_order",
    "overcorrection"
  ]
}
```

## Remaining Boundary

This proves deterministic policy enforcement against fixtures. It does not prove human tutor quality in open-ended conversation.
