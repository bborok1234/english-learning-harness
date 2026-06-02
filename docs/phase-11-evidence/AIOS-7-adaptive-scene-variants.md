# AIOS-7: Adaptive Scene Variants

Issue: #166

## Why

Generated artifacts become stale if every day looks like the same card. The harness needs scene variety, but not at the cost of evidence linkage. A variant must still serve the current Speaking Skill OS target and preserve the text-first transfer path.

## What Changed

- Generated scene artifacts now include `variant` metadata:
  - `id`
  - `label`
  - `setting`
  - `mood`
  - `prop`
  - `cue_style`
- Variants are selected from the current target skill and date.
- Scene frames use the variant setting and cue style while preserving the mission target skill, transfer test, and required session evidence.
- Scene HTML shows the variant label, mood, and setting.
- Learner report and cockpit show latest scene variant labels.
- `scripts/adaptive-scene-variants-smoke.mjs` verifies multiple target-skill variants.

## Verification

Passing local checks:

```bash
node scripts/adaptive-scene-variants-smoke.mjs
node scripts/generated-scene-artifact-smoke.mjs
node scripts/codex-operated-practice-flow-smoke.mjs
node scripts/skill-conversation-simulation-smoke.mjs
```

The variant smoke verifies:

- clarification, repair, and soft-disagreement samples produce different variants;
- each variant keeps the diagnosed Speaking Skill OS backlog link;
- each scene keeps four learning frames and required session evidence;
- scene HTML displays the variant label and setting;
- unsupported outcome claims remain blocked.

## Claim Boundary

This proves local adaptive scene variant mechanics only.

It does not prove engagement, retention, realtime voice, or learning outcomes.
