# AIOS-12 Varied Pilot Day Missions Evidence

Date: 2026-06-02
Issue: #179

## Decision

Continue.

The owner/self pilot should not ask the same clarification prompt for every practice day. A five-day pilot needs to sample different speaking actions so the final audit can judge whether the harness supports broader conversation behavior, not one repeated phrase.

## What Changed

- Added five daily pilot missions:
  - Day 1: clarification,
  - Day 2: repair,
  - Day 3: image/scene description,
  - Day 4: soft disagreement,
  - Day 5: follow-up.
- `pilot-status` and `pilot-next` now expose the relevant daily mission for the next incomplete pilot day.
- The learner cockpit active pilot card now follows the same day mission sequence.
- Day 1 keeps the existing usual-place clarification prompt so the current real pilot next action remains stable.

## Verification

Passed:

```bash
node scripts/phase15-owner-pilot-varied-day-missions-smoke.mjs
node scripts/phase15-owner-pilot-next-card-smoke.mjs
node scripts/phase15-owner-pilot-capture-smoke.mjs
node scripts/phase9-pilot-prompt-ux-smoke.mjs
```

The varied-day smoke verifies the first five fixture pilot days expose distinct learner-facing titles and examples, then become ready for final sample after five completed days.

## Claim Boundary

This proves varied pilot day prompt mechanics. It does not run the real owner/self pilot and does not prove learning outcomes.
