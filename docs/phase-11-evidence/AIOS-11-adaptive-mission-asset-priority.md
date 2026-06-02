# AIOS-11 Adaptive Mission Asset Priority Evidence

Date: 2026-06-02
Issue: #176

## Decision

Continue.

AIOS-11 turns the generated mission asset deck from a static list into a learner-state-aware next-action surface. The deck now ranks assets from local evidence and exposes the top action to the personal cockpit.

## What Changed

- Mission asset deck JSON now includes `priority` on each asset: `score`, `rank`, `recommended_next`, and a learner-readable reason.
- The deck now writes `priority_context`, including recent evidence modalities, next Speaking Skill OS backlog item, and weakest skill signal.
- The deck now writes `top_asset_action`, including the recommended asset id, label, reason, start command, and expected evidence.
- Cockpit state and HTML now expose the latest next asset action while preserving the latest mission asset deck link.
- The cockpit command JSON wrapper now exposes `nextAssetAction` and `nextActions` so automation can read the same decision without parsing HTML.

## Verified Behavior

The smoke fixture proves these deterministic transitions:

| Learner evidence state | Recommended next asset | Why |
|---|---|---|
| no session evidence | `text-practice` | canonical completion path comes first |
| text evidence only | `image-information-gap` | add visual information-gap practice |
| text + image evidence | `voice-transcript` | add transcript-backed speaking evidence |
| text + image + voice evidence | `interactive-html-scene` | use generated scene frame for transfer review |

## Verification

Passed:

```bash
node scripts/adaptive-mission-asset-priority-smoke.mjs
node scripts/generated-mission-asset-deck-smoke.mjs
node scripts/personal-learner-cockpit-smoke.mjs
node scripts/product-surface-smoke.mjs
node scripts/ops-dashboard-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
git diff --check
```

## Claim Boundary

This proves deterministic local asset prioritization mechanics. It does not prove learning outcomes, retention, realtime voice efficacy, or that generated media improves fluency.
