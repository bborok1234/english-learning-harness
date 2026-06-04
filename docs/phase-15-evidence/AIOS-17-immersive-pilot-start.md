# AIOS-17 Immersive Pilot Start

Status: mechanics pass; real owner/self pilot still open

## Why

The real owner/self pilot should not begin with a generic project/work premise or an evaluation-like prompt. The first learner-facing card now starts as a low-pressure scene chooser so a Korean learner can pick a small world, send one English sentence, and stay inside the Codex conversation while the harness persists state internally.

## What Changed

- The fresh Day 0 pilot card is now `첫 장면 고르기`.
- The first card exposes three learner-facing opening scene choices:
  - 일상 장면
  - 작은 모험
  - 편한 공간
- First-card quick replies no longer assume the learner worked on a project.
- `pilot-next` JSON and HTML render the opening scene choices.
- The personal learner cockpit can surface `next_card.scene_choices` from the active pilot card state.
- The next-card smoke now renders the HTML in Playwright and verifies the scene chooser appears in the DOM.

## Verification

```bash
node scripts/phase15-owner-pilot-next-card-smoke.mjs
node scripts/personal-learner-cockpit-active-pilot-smoke.mjs
```

## Claim Boundary

This improves the learner-facing start mechanics only. It does not run the real owner/self pilot, save a real new learner answer, prove retention, or prove real-world speaking improvement.
