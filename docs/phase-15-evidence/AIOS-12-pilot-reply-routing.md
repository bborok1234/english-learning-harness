# AIOS-12 Pilot Reply Routing Evidence

Date: 2026-06-02
Issue: #179
Status: mechanics pass; real owner/self pilot still open

## Why

The learner should not need to know whether the current pilot answer belongs to Day 0 baseline, a daily mission, or the final sample. In the Codex product surface, the learner should answer the current card naturally while Codex handles state routing and persistence internally.

## What Changed

- Added `pilot-reply` as a Codex-internal reply router.
- The router reads current pilot state, finds the next pilot action, and delegates to `pilot-capture`.
- Baseline and final cards are routed by card id.
- Daily cards are routed by day number and may include a friction note.
- The existing `pilot-capture` cockpit refresh path remains the only persistence path, so the router does not duplicate storage logic.
- After saving, the router regenerates `artifacts/pilot/pilot-next-card.json/html` through `pilot-next`.
- `pilot-reply` now returns `learnerFacing`, a learner-safe summary for Codex to speak back after saving.
- `pilot-reply` writes `artifacts/pilot/pilot-reply-card.json/html`, a learner-facing saved-reply card with coaching and the next prompt.
- `pilot-reply` accepts `--quick-reply` selection as an alternative to `--say`, resolves it against the current `pilot-next` quick replies, and saves the selected English sentence through the same capture path.
- Updated the owner-pilot skill to prefer `pilot-reply` and avoid asking the learner to choose phase, card id, or day number.

## Verification

```bash
node scripts/phase15-owner-pilot-reply-routing-smoke.mjs
node scripts/phase15-owner-pilot-reply-card-render-smoke.mjs
```

The smoke validates:

- a fresh reply routes to the first baseline card and refreshes cockpit,
- five baseline replies commit the Day 0 baseline,
- the next reply after baseline routes to daily Day 1 and preserves `pilot_mission` plus `learner_coaching`,
- invalid quick-reply selections fail before saving a pilot day,
- daily quick-reply selection persists the selected English sentence,
- numeric quick-reply selection works for the next daily mission,
- replies for days 2-5 advance automatically,
- the next reply after five days routes to the first final card,
- each reply returns a refreshed `nextCardArtifact` so the learner-facing next card is not stale,
- daily replies expose `learnerFacing.recast`, `learnerFacing.nextPhrase`, `learnerFacing.nextFocus`, and `learnerFacing.nextCard`,
- baseline/final replies expose saved status and the next card without inventing coaching,
- each reply writes a `pilot-reply-card.html/json` artifact,
- the daily reply card includes saved status, recast, next phrase, and next card,
- the saved-reply card renders in a browser through Playwright or the bundled Codex runtime fallback,
- the rendered card shows saved status, four coaching evidence cells, and the next-card prompt,
- learner-facing cockpit HTML does not expose internal pilot command tokens.

## Claim Boundary

This validates automatic routing mechanics with fixture data only. It does not run the real owner/self pilot, prove learning outcomes, prove retention, or prove real-world speaking improvement.
