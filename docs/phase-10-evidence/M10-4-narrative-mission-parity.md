# M10-4 Narrative Mission Parity

Date: 2026-06-02
Issue: #146
Decision: continue

## What Changed

- Added `persistNarrativeMissionSession()` in `scripts/lib/narrative-mission.mjs`.
- The narrative wrapper validates the mission bundle before learner state can change.
- It builds a text-first narrative mission scenario from `usual-place-clarification`.
- It reuses the existing `persistSession()` path so Speaking Skill OS transfer evidence is recorded by the same mechanism as plain `today`.
- It writes story consequence only after `speaking_backlog_evidence` exists.

## Verification

```bash
node scripts/phase10-narrative-mission-parity-smoke.mjs
```

The smoke runs two deterministic pairs:

- pass: `Which place do you mean?`
- needs review: `Okay, I will go there.`

For each pair, it compares plain `today` output with the narrative mission wrapper and requires matching:

- backlog item id,
- skill,
- transfer result,
- backlog status,
- transfer test.

It also checks that narrative story consequence records:

- `recorded_after_transfer_evidence: true`,
- the same transfer result as `speaking_backlog_evidence`,
- the expected pass or retry consequence.

## Claim Boundary

This proves deterministic local parity for one text-first narrative mission. It does not prove real learner outcomes, motivation lift, realtime voice readiness, or multimodal efficacy.
