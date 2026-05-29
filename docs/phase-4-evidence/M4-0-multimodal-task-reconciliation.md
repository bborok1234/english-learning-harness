# M4-0 Multimodal Task Reconciliation

Date: 2026-05-29
Milestone: M4 Multimodal Interaction Lab

## Decision

Continue.

M3 closed the local daily return path. M4 should not start by adding media features. It starts by making every modality produce the same local interaction-event evidence.

## Evidence Reviewed

- `docs/MULTIMODAL-GENAI-PLAN.md`
- Epics #7 and #8
- Current OpenAI docs for Realtime/audio, speech-to-text, image generation, and video generation

The current product path remains local-first and text/transcription-first. Realtime, generated images, and video are allowed only when they produce persisted interaction-event evidence and do not bypass learner memory.

## Created Issues

| Issue | Purpose |
|---|---|
| #50 | Add interaction event graph schema. |
| #49 | Persist text sessions as interaction events. |
| #53 | Add transcription-first voice event import. |
| #52 | Add image information-gap event fixture. |
| #54 | Close multimodal-ready event graph gate. |

## Execution Order

1. #50 creates the shared event contract and validator.
2. #49 makes current text sessions write event evidence.
3. #53 adds voice readiness through transcript-first import, not realtime.
4. #52 adds local image information-gap task semantics.
5. #54 verifies multimodal-ready gate evidence and closes M4 if justified.

## Claim Boundary

This reconciliation creates the M4 execution lane. It does not implement realtime voice, image generation, or video generation.
