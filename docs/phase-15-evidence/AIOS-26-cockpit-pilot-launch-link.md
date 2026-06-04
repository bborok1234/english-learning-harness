# AIOS-26 Cockpit Pilot Launch Link

Date: 2026-06-04
Issue: #238
Decision: continue

## Why

AIOS-25 created a real pilot launch card, but a learner checking the cockpit still needed to know where that launch card lived.

The cockpit is the daily product surface, so it should expose the safest real-pilot start/resume card directly.

## What Changed

- Active pilot state now includes `launch_card_artifact` when `pilot-launch-card.json/html` exist.
- Learner cockpit HTML now links the launch card as `Pilot 시작/재개 카드 열기`.
- Existing current next-card and latest reply-card links remain intact.

## Verification

Passed:

```bash
node scripts/personal-learner-cockpit-active-pilot-smoke.mjs
node scripts/english-learning-harness.mjs cockpit --json
```

The smoke validates:

- cockpit state includes `artifacts/pilot/pilot-launch-card.html/json`.
- linked launch card file exists.
- cockpit HTML renders `Pilot 시작/재개 카드 열기`.
- existing next-card, quick replies, copy buttons, and latest reply-card checks still pass.
- learner-facing cockpit HTML avoids internal command, issue, PR, and audit language.

Observed local learner cockpit evidence:

```json
{
  "launch_card_artifact": {
    "json": "artifacts/pilot/pilot-launch-card.json",
    "html": "artifacts/pilot/pilot-launch-card.html"
  }
}
```

## Claim Boundary

This is cockpit discovery mechanics evidence only.

It does not run the real owner/self pilot, save a real learner answer, prove engagement, prove speaking improvement, complete issue #179, or complete the active AI-native OS goal.
