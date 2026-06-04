# AIOS-31 Pilot Turn Packet

Date: 2026-06-04
Issue: #248
Decision: continue

## Why

The harness should feel like a Codex-native product, not a learner-operated command line.

`pilot-launch`, `pilot-run-sheet`, and `pilot-handoff` prepare local surfaces. Codex still needs a compact operator packet for the next conversation turn: the exact learner-facing sentence to say now, the numbered quick replies, the save boundary, and the local surfaces to inspect if needed.

## What Changed

- Added `pilot-turn`.
- The command writes:
  - `artifacts/pilot/pilot-turn-packet.json`
  - `artifacts/pilot/pilot-turn-packet.html`
- The packet includes:
  - `learner_turn.say` as the one prompt Codex can show the learner,
  - numbered quick replies,
  - local-only privacy copy,
  - `operator_only` save policy,
  - launch-card, next-card, handoff, and cockpit links,
  - redaction flags inherited from the handoff.
- The packet does not save a learner answer or mark consent.
- The owner-pilot skill now tells Codex to use `learnerTurn.say` as the only learner-facing prompt.

## Verification

Passed:

```bash
node scripts/phase15-owner-pilot-turn-packet-smoke.mjs
```

The smoke validates:

- fresh `pilot-turn` does not save an answer.
- fresh `pilot-turn` shows Korean-first low-pressure learner copy.
- fresh `pilot-turn` links launch card, next card, handoff, and cockpit.
- partial `pilot-turn` advances from a fixture baseline answer without leaking the fixture answer.
- JSON, HTML, and rendered text do not leak fixture transcript text, fixture friction notes, internal command tokens, issue/PR language, rubric/audit internals, or unsupported fluency claims.

## Claim Boundary

This is a Codex operator conversation-turn packet only.

It does not run the real owner/self pilot, save a real learner answer, prove engagement, prove speaking improvement, complete issue #179, resolve blocked outcome claims, or complete the active AI-native OS goal.
