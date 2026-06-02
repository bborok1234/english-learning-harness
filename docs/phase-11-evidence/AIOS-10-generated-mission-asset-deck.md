# AIOS-10 Generated Mission Asset Deck

## Why

AIOS-9 created a machine-readable asset contract. The next product step was to turn that contract into a learner-operable artifact instead of leaving it hidden in JSON.

## What Changed

- Added learner-root `artifacts/assets/`.
- Added `asset-deck` command.
- Added `writeGeneratedMissionAssetDeck()`.
- `practice` now refreshes the asset deck with mission, scene, session, weekly mirror, learner report, and cockpit.
- Learner report and cockpit link the latest mission asset deck.
- The deck renders text-first, interactive HTML scene, image information-gap, voice transcript, Remotion-style storyboard, and future realtime hook cards.
- The deck explicitly says mission completion requires learner output saved as session evidence.

## Verification

```bash
node scripts/generated-mission-asset-deck-smoke.mjs
node scripts/multimodal-mission-asset-contract-smoke.mjs
node scripts/generated-scene-artifact-smoke.mjs
node scripts/codex-operated-practice-flow-smoke.mjs
```

## Claim Boundary

This proves local mission asset deck generation, rendering, and linkage mechanics. It does not prove realtime voice support, generated-media efficacy, retention, engagement, fluency, or real-world speaking improvement.
