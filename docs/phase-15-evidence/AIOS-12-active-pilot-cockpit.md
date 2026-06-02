# AIOS-12 Active Pilot Cockpit Evidence

Date: 2026-06-02
Issue: #179

## Decision

Continue.

The real owner/self pilot needs to be visible as a learner product journey, not hidden in internal commands or reports. This work connects active pilot state to the learner cockpit so the next pilot card and progress are visible while the pilot is still in progress.

## What Changed

- Personal cockpit state now includes `active_pilot` when `pilot-state.json` exists and the pilot is not complete.
- Cockpit HTML now shows the active owner pilot section with:
  - daily session progress,
  - Day 0/final card progress,
  - next learner-facing card prompt,
  - example answer,
  - latest saved-reply card link when `pilot-reply-card.html` exists,
  - local claim boundary.
- Cockpit file metadata now includes `active_pilot_state`.

## Verification

Passed:

```bash
node scripts/personal-learner-cockpit-active-pilot-smoke.mjs
```

The smoke captures one Day 0 card through `pilot-reply`, generates the cockpit, and verifies the cockpit points to the next Day 0 card plus the latest saved-reply card without leaking `pilot-capture`, `pilot-reply` command text, `pilot-start`, `product_journey_audit`, PR, or issue language into the learner HTML.

## Claim Boundary

This proves active pilot visibility in the learner cockpit. It does not run the real owner/self pilot and does not prove learning outcomes.
