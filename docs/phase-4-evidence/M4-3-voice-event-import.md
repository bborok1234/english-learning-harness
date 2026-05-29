# M4-3 Transcription-First Voice Event Import

Date: 2026-05-29
Issue: #53

## Decision

Continue.

Realtime voice is not the default product path yet. M4-3 adds voice readiness by importing a transcript and optional local audio metadata into the same interaction event graph used by text sessions.

## Implementation

- Added `voice` command.
- The command accepts `--transcript`, `--say`, optional `--audio-file`, `--scenario`, `--learner-root`, and `--date`.
- Voice sessions persist with `mode: "voice-transcript"`.
- Interaction events persist with `modality: "voice"`.
- Optional audio path is stored as local `source_artifact` metadata only.
- Added `scripts/phase4-voice-event-import-smoke.mjs`.

## Verification

Run:

```bash
node scripts/phase4-voice-event-import-smoke.mjs
node scripts/phase4-text-event-persistence-smoke.mjs
node scripts/phase4-interaction-event-schema-smoke.mjs
node scripts/phase2-tutor-policy-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Expected evidence:

- `voice` command writes a session artifact;
- artifact includes `mode: "voice-transcript"`;
- interaction event validates with `modality: "voice"`;
- local audio metadata is stored without pronunciation scoring;
- weekly mirror summarizes voice modality;
- unsupported realtime/accent/native-speaker claims do not appear.

## Claim Boundary

This proves transcription-first voice event import. It does not prove live voice exchange, pronunciation assessment, or audio transcription quality.
