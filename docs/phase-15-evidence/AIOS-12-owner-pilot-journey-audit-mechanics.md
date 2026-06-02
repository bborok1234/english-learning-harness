# AIOS-12 Owner/Self Pilot Journey Audit Mechanics

Date: 2026-06-02
Issue: #179

## Decision

Continue.

The real owner/self pilot should not close from fixture data. This work adds the audit mechanics needed to judge a real pilot once actual owner/self transcripts are collected.

## What Changed

- `practice` now exposes the generated mission asset deck top action in command JSON.
- `pilot-day` now records the day's pilot mission metadata, learner coaching summary, mission, scene, asset deck, next asset action, learner report, cockpit, session artifact, and friction note.
- `pilot-finish` now writes `product_journey_audit` into the pilot report.
- Pilot Markdown reports now show pilot action metadata, learner coaching next phrase, asset deck paths, next asset ids, evidence completeness, friction-note count, and the product decision.

## Verified Behavior

`scripts/phase15-owner-pilot-journey-audit-smoke.mjs` runs a five-day fixture pilot and verifies:

- all five days use the Codex-operated `practice` flow;
- each day preserves pilot action metadata, learner coaching next phrase, mission, scene, asset deck, top asset action, learner report, and cockpit links;
- the final pilot report records a governance decision from the allowed decision set;
- the final cockpit still exposes the latest next asset action;
- product report text avoids engineering leaks and unsupported outcome claims.

## Verification

Passed:

```bash
node scripts/phase15-owner-pilot-journey-audit-smoke.mjs
```

## Claim Boundary

This proves owner/self pilot audit mechanics with fixture data only. It does not prove real learner outcomes, retention, realtime voice efficacy, generated-media learning gains, or that the actual owner/self pilot has been completed.
