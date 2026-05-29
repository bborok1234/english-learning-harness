# M4-4 Image Information-Gap Event Fixture

Date: 2026-05-29
Issue: #52

## Decision

Continue.

Image input should create situated speaking evidence, not decorative media. M4-4 adds a local image information-gap path that stores the image as prompt context and the learner output as the evidence.

## Implementation

- Added `image` command.
- The command accepts local `--image-file`, `--hidden-detail`, `--clarification-prompt`, and learner output.
- Image sessions persist with `mode: "image-info-gap"`.
- Interaction events persist with `modality: "image"`.
- Local image metadata, hidden detail, and clarification prompt are stored in `source_artifact`.
- Added `scripts/phase4-image-information-gap-smoke.mjs`.

## Verification

Run:

```bash
node scripts/phase4-image-information-gap-smoke.mjs
node scripts/phase4-voice-event-import-smoke.mjs
node scripts/phase4-text-event-persistence-smoke.mjs
node scripts/phase4-interaction-event-schema-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- `image` command writes a session artifact;
- artifact includes `mode: "image-info-gap"`;
- interaction event validates with `modality: "image"`;
- event stores local image metadata, hidden detail, and clarification prompt;
- weekly mirror summarizes image modality;
- unsupported claims do not appear.

## Claim Boundary

This proves local image-input task semantics. It does not evaluate generated media quality or real-world transfer.
