# AIOS-21 Daily Practice Reply Routing

Status: reply routing mechanics pass; no real learner answer saved

## Why

AIOS-20 added a daily practice start card with quick replies. The ordinary daily flow also needs a router so Codex can save a selected quick reply without asking the learner to retype the whole English sentence.

## What Changed

- Added `practice-reply`.
- `practice-reply --quick-reply "1"` resolves the selected answer from `artifacts/missions/practice-start-card.json`.
- `practice-reply --say "<answer>"` saves a direct learner sentence through the same path.
- The router runs the existing `practice` persistence flow and preserves the start-card scene preset.
- The router writes:
  - `artifacts/missions/practice-reply-card.json`
  - `artifacts/missions/practice-reply-card.html`
- The saved-reply card shows:
  - saved answer
  - communicated meaning
  - recast
  - next phrase
  - next focus
  - learner report and cockpit links
- `english-daily-session` now tells Codex to use `practice-reply` for both quick-reply and freeform answers.

## Verification

```bash
node scripts/daily-practice-reply-routing-smoke.mjs
node scripts/daily-practice-start-card-smoke.mjs
node scripts/skill-conversation-simulation-smoke.mjs
node scripts/skill-conversation-variants-smoke.mjs
```

## Claim Boundary

This validates fixture daily reply routing only. It does not save a real learner answer, run real validation, prove engagement, or prove learning outcomes.
