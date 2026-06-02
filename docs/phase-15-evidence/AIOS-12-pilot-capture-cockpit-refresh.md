# AIOS-12 Pilot Capture Cockpit Refresh Evidence

Date: 2026-06-02
Issue: #179

## Decision

Continue.

The owner/self pilot is meant to happen inside Codex conversation, one learner-facing card at a time. After each answer, the learner cockpit should immediately reflect the current pilot state so the user can see what is captured, what is next, and whether the pilot journey is still in progress.

## What Changed

- `pilot-capture` now refreshes `cockpit-state.json` and `cockpit.html` after each card capture.
- The command response includes a `cockpit` object with state path, HTML path, file URL, and active pilot snapshot.
- Partial Day 0/final captures and daily pilot captures all return the refreshed cockpit pointer.
- The existing cockpit contract still hides internal `pilot-capture`, PR/issue, and audit details from the learner-facing HTML.

## Verification

Passed:

```bash
node scripts/phase15-owner-pilot-capture-smoke.mjs
node scripts/personal-learner-cockpit-active-pilot-smoke.mjs
node scripts/product-surface-smoke.mjs
node scripts/ops-dashboard-smoke.mjs
```

`phase15-owner-pilot-capture-smoke` now verifies that baseline card capture and daily capture both write a cockpit HTML file and expose an active pilot cockpit snapshot where expected.

## Claim Boundary

This proves the pilot capture to cockpit refresh contract. It does not run the real owner/self pilot and does not prove learning outcomes.
