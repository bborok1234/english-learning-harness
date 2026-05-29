# M4-5 Multimodal-Ready Event Graph Gate

Date: 2026-05-29
Issue: #54
Parent epics: #7, #8

## Decision

Continue and close M4 if gate evidence remains green after PR merge.

M4 is ready to close when text, transcription-first voice, and image information-gap practice all produce the same `interaction_events` evidence contract and the weekly mirror summarizes those events without unsupported media claims.

## Implementation

- Added `scripts/phase4-multimodal-gate-smoke.mjs`.
- The gate creates one learner store and runs:
  - `today` for `modality: "text"`;
  - `voice` for `modality: "voice"` with local audio metadata only;
  - `image` for `modality: "image"` with local image metadata and hidden-detail prompt context.
- The gate validates each session artifact with `validateInteractionEvent()`.
- The gate verifies the weekly mirror reports all three modalities in `interaction_event_summary`.
- The gate rejects unsupported claims such as realtime conversation, generated media quality, or visual transfer proof.

## Verification

Run:

```bash
node scripts/phase4-multimodal-gate-smoke.mjs
node scripts/phase4-image-information-gap-smoke.mjs
node scripts/phase4-voice-event-import-smoke.mjs
node scripts/phase4-text-event-persistence-smoke.mjs
node scripts/phase4-interaction-event-schema-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- text, voice, and image session artifacts exist;
- each artifact has exactly one valid interaction event;
- weekly mirror `interaction_event_summary.event_count` is `3`;
- weekly mirror modalities include `text`, `voice`, and `image`;
- local audio/image paths remain metadata only;
- unsupported media and transfer claims do not appear.

## Claim Boundary

This proves multimodal-ready local interaction-event evidence. It does not prove production realtime voice, generated media quality, video simulation, or real learner outcomes.
