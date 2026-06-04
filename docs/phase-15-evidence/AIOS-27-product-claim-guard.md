# AIOS-27 Product Claim Guard

Date: 2026-06-04
Issue: #240
Decision: continue

## Why

The active AIOS goal still has an unsupported-learning-claims blocker.

Individual smokes already protect many specific features, but learner-facing claims were spread across README, research basis, and product cockpit surfaces. A public visitor should not see broad fluency, retention, realtime voice, generated-media, child-mode, or certification claims unless the repo has evidence strong enough to support them.

## What Changed

- Added `scripts/product-claim-guard-smoke.mjs`.
- The guard checks:
  - `README.md`
  - `README.en.md`
  - `docs/product/learner-cockpit-state.json`
  - `docs/product/learner-cockpit.html`
  - `docs/RESEARCH-BASIS.md`
- The guard requires visible design-basis language: output practice, interaction repair, corrective feedback, retrieval practice, task-based conversation, and explicit claim boundaries.
- The guard blocks unsupported learner-facing claims around guaranteed fluency, proven improvement, native-speaker/level certification, realtime voice efficacy, generated-media learning gains, and child-mode readiness.
- The guard allows negative/boundary wording such as "does not prove" and "보장하지 않습니다."

## Verification

Passed:

```bash
node scripts/product-claim-guard-smoke.mjs
```

The smoke validates that product/public surfaces keep the allowed claim at design-mechanics level and keep learning outcome claims blocked until real learner evidence exists.

## Claim Boundary

This is product claim-governance evidence only.

It does not run the real owner/self pilot, save a real learner answer, prove engagement, prove speaking improvement, complete issue #179, resolve the unsupported-learning-claims blocker, or complete the active AI-native OS goal.
