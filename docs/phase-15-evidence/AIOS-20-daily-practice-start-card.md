# AIOS-20 Daily Practice Start Card

Status: learner-ready start mechanics pass; no real learner answer saved

## Why

The owner pilot has a learner-ready card with quick replies, but the ordinary daily-session flow still depended on Codex improvising a first prompt from skill text. First-time daily practice also needs a concrete product surface before the learner answers.

## What Changed

- Added `practice-next` to the local engine.
- `practice-next` generates:
  - `artifacts/missions/practice-start-card.json`
  - `artifacts/missions/practice-start-card.html`
- The start card includes:
  - today's generated mission and target skill
  - a concrete learner-facing scene
  - a Korean assistant prompt Codex can say directly
  - three quick replies
  - copy buttons in the HTML card
  - current cockpit link
- Quick replies now begin with the current scene example so the answer candidates match the visible prompt.
- `english-daily-session` now tells Codex to generate the start card before asking the first daily prompt.
- `skill-conversation-simulation-smoke` now verifies the daily skill contract includes the start-card path.

## Verification

```bash
node scripts/daily-practice-start-card-smoke.mjs
node scripts/skill-conversation-simulation-smoke.mjs
node scripts/skill-conversation-variants-smoke.mjs
node scripts/personal-learner-cockpit-smoke.mjs
```

## Claim Boundary

This improves the learner-facing daily start surface only. It does not save a real learner answer, run a real daily session, prove engagement, or prove learning outcomes.
