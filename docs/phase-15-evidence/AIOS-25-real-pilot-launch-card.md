# AIOS-25 Real Pilot Launch Card

Date: 2026-06-04
Issue: #236
Decision: continue

## Why

The real owner/self pilot tracker is open, but starting or resuming it should not require the learner to understand cockpit state, next-card artifacts, issue trackers, or internal commands.

Codex needs one learner-facing launch surface before saving any new real answer.

## What Changed

- Added `pilot-launch`.
- `pilot-launch` writes:
  - `artifacts/pilot/pilot-launch-card.json`
  - `artifacts/pilot/pilot-launch-card.html`
- The launch card includes:
  - current pilot progress,
  - next learner prompt,
  - quick reply choices,
  - whether an answer has been saved,
  - what will be saved after the learner answers,
  - local cockpit link,
  - privacy and claim boundary.
- The launch card does not save a new answer.
- `skills/owner-pilot/SKILL.md` now tells Codex to generate the launch card before asking the learner for a real pilot answer.

## Verification

Passed:

```bash
node scripts/phase15-owner-pilot-launch-card-smoke.mjs
```

The smoke validates:

- fresh pilot launch shows the immersive first snapshot card.
- resumed pilot launch shows Day 1 clarification.
- launch card writes JSON and HTML.
- launch card renders in Playwright.
- launch card includes quick replies and cockpit link.
- launch card does not change baseline or daily-session counts.
- learner-facing launch JSON/HTML does not leak command, issue, PR, smoke, rubric, or audit language.

## Claim Boundary

This is launch/resume mechanics evidence only.

It does not run the real owner/self pilot, save a real learner answer, prove engagement, prove speaking improvement, complete issue #179, or complete the active AI-native OS goal.
