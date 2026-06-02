# AIOS-12 Pilot Next Card Evidence

Date: 2026-06-02
Issue: #179

## Decision

Continue.

The real owner/self pilot should feel like a product conversation, not a hidden JSON status object. This work adds a learner-facing next-card artifact so the current pilot prompt can be opened as a simple local HTML card while Codex still handles persistence internally.

## What Changed

- Added `pilot-next` to generate `artifacts/pilot/pilot-next-card.json` and `artifacts/pilot/pilot-next-card.html`.
- The card shows current progress, phase, one short learner-facing prompt, an example, the answer rule, and privacy boundary.
- The command refreshes the learner cockpit before writing the next-card artifact.
- The owner-pilot skill now allows Codex to generate this next-card artifact internally without asking the learner to run commands.

## Verification

Passed:

```bash
node scripts/phase15-owner-pilot-next-card-smoke.mjs
node scripts/phase15-owner-pilot-skill-smoke.mjs
node scripts/phase15-owner-pilot-capture-smoke.mjs
node scripts/personal-learner-cockpit-active-pilot-smoke.mjs
```

The next-card smoke verifies baseline and daily next-card generation, cockpit linkage, progress advance after one fixture day, and no leakage of internal pilot commands or PR/issue language into learner HTML.

## Claim Boundary

This proves learner-facing next-card generation. It does not run the real owner/self pilot and does not prove learning outcomes.
