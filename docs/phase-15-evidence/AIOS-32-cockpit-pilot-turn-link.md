# AIOS-32 Cockpit Pilot Turn Link

Date: 2026-06-04
Issue: #250
Decision: continue

## Why

The learner cockpit is the product surface for returning to practice.

AIOS-31 created `pilot-turn`, but the learner cockpit still linked only launch, next-card, and latest reply-card surfaces. A learner or Codex operator should be able to resume the next real-pilot conversation turn from the cockpit without searching local artifacts.

## What Changed

- Active `cockpit-state.json` now includes `turn_packet_artifact` when `artifacts/pilot/pilot-turn-packet.json/html` exists.
- Active `cockpit.html` now links that packet as `Codex 진행 카드 열기`.
- Existing launch-card, current next-card, quick reply, and latest reply-card links remain intact.
- The link is presented as a continuation surface, not as a command for the learner to run.

## Verification

Passed:

```bash
node scripts/personal-learner-cockpit-pilot-turn-link-smoke.mjs
node scripts/personal-learner-cockpit-active-pilot-smoke.mjs
```

The smoke validates:

- `pilot-turn` does not save a new answer.
- cockpit state links the turn packet JSON and HTML.
- rendered cockpit shows `Codex 진행 카드 열기`.
- baseline answer count remains unchanged after generating the turn packet.
- launch-card, current-card, and latest reply-card links remain present.
- cockpit HTML and rendered text do not leak engine commands, issue/PR language, rubric/audit internals, or unsupported fluency claims.

## Claim Boundary

This is active cockpit navigation evidence only.

It does not run the real owner/self pilot, save a real learner answer, prove engagement, prove speaking improvement, complete issue #179, resolve blocked outcome claims, or complete the active AI-native OS goal.
