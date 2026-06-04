# AIOS-29 Pilot Run Sheet

Date: 2026-06-04
Issue: #244
Decision: continue

## Why

The remaining real owner/self blocker is not mechanics coverage. It is the actual live pilot.

Before Codex asks for a real answer, Codex needs a local-only run sheet that makes the next prompt, save boundary, consent status, privacy rule, and local surfaces visible without storing a new answer.

## What Changed

- Added `pilot-run-sheet`.
- The command writes:
  - `artifacts/pilot/pilot-run-sheet.json`
  - `artifacts/pilot/pilot-run-sheet.html`
- The run sheet includes:
  - next learner prompt,
  - quick reply candidates,
  - whether local-only consent has already been marked,
  - the no-save preview boundary,
  - what will be saved after the learner answers,
  - local launch-card and cockpit links.
- Fresh run sheets do not create `pilot-state.json` or mark consent.
- Resume run sheets show existing local-only consent without saving another answer.
- Owner-pilot skill and data contracts now describe the run sheet as an internal Codex handoff surface.

## Verification

Passed:

```bash
node scripts/phase15-owner-pilot-run-sheet-smoke.mjs
node scripts/phase15-owner-pilot-launch-card-smoke.mjs
node scripts/phase15-owner-pilot-skill-smoke.mjs
node scripts/phase15-owner-pilot-capture-smoke.mjs
```

The smoke validates:

- fresh `pilot-run-sheet` returns `savedAnswer=false`.
- fresh `pilot-run-sheet` does not create `pilot-state.json`.
- fresh `pilot-run-sheet` renders `첫 저장 전`.
- rendered HTML links both launch card and cockpit.
- resume `pilot-run-sheet` shows existing `local-only` consent and preserves the first-save timestamp.
- run-sheet HTML avoids internal issue/PR/smoke/rubric/audit leakage.

## Claim Boundary

This is local real-pilot run-readiness evidence only.

It does not run the real owner/self pilot, save a real learner answer, prove engagement, prove speaking improvement, complete issue #179, resolve blocked outcome claims, or complete the active AI-native OS goal.
