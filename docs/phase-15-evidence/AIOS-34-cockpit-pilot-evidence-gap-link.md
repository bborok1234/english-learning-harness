# AIOS-34 Cockpit Pilot Evidence Gap Link

Date: 2026-06-04
Issue: #254
Decision: continue

## Why

The cockpit is the return surface for the learner and Codex operator.

AIOS-33 created a redacted evidence gap, but it was still a standalone artifact. If the cockpit does not link it, Codex has to search local files before seeing what remains for the real pilot.

## What Changed

- Active `cockpit-state.json` now includes `evidence_gap_artifact` when `artifacts/pilot/pilot-evidence-gap.json/html` exists.
- Active `cockpit.html` now links that artifact as `남은 연습 증거 보기`.
- Existing launch-card, turn-packet, current-card, quick-reply, and latest reply-card links remain intact.
- The link is presented as a learner-safe journey-check surface, not as an engine command or issue tracker status.

## Verification

Passed:

```bash
node scripts/personal-learner-cockpit-pilot-evidence-gap-link-smoke.mjs
node scripts/personal-learner-cockpit-active-pilot-smoke.mjs
```

The smoke validates:

- `pilot-evidence-gap` does not save a new answer.
- cockpit state links the evidence gap JSON and HTML.
- rendered cockpit shows `남은 연습 증거 보기`.
- baseline answer count remains unchanged after generating the evidence gap.
- launch-card, turn-packet, current-card, and latest reply-card links remain present.
- cockpit HTML and rendered text do not leak engine commands, issue/PR language, rubric/audit internals, or unsupported fluency claims.

## Claim Boundary

This is active cockpit navigation evidence only.

It does not run the real owner/self pilot, save a real learner answer, prove engagement, prove speaking improvement, complete issue #179, resolve blocked outcome claims, or complete the active AI-native OS goal.
