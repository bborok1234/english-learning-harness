# AIOS-13 Generated Mission Storyboard Artifact

Date: 2026-06-02
Issue: #210

## Decision

Continue.

The AI-native OS goal calls for generated interactive HTML and Remotion-style artifacts. Before this work, `remotion-storyboard` existed as a contract/deck entry, but not as its own learner-operable artifact.

## What Changed

- Added a `storyboard` command.
- Added learner-root `artifacts/storyboards/mission-storyboard-YYYY-MM-DD.json/html`.
- The storyboard derives from the current generated mission, target Speaking Skill OS skill, required learner action, transfer test, and session evidence requirement.
- Storyboard HTML includes Previous / Play / Next controls over scene setup, speaking cue, model answer, and evidence checkpoint frames.
- `asset-deck` now generates and links the storyboard artifact from the `remotion-storyboard` asset card.
- Learner reports and the personal cockpit now link the latest storyboard artifact from the generated artifact sections.
- Claims remain bounded: this is a local Remotion-style preparation artifact, not a video export, realtime voice, or learning-outcome proof.

## Verification

Passed:

```bash
node scripts/generated-mission-storyboard-smoke.mjs
node scripts/generated-mission-asset-deck-smoke.mjs
node scripts/multimodal-mission-asset-contract-smoke.mjs
node scripts/product-surface-smoke.mjs
node scripts/ops-dashboard-smoke.mjs
```

The storyboard smoke verifies command output, JSON/HTML existence, four evidence-guided storyboard frames, interactive controls, required session evidence, asset deck linkage, learner report linkage, personal cockpit linkage, product-surface leak guards, and unsupported-claim guards.

## Claim Boundary

This proves local storyboard artifact mechanics only. It does not prove video rendering, realtime voice support, retention, fluency, or real-world speaking improvement.
