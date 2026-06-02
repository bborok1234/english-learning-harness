# AIOS-12 Owner Pilot Codex Skill Evidence

Date: 2026-06-02
Issue: #179

## Decision

Continue.

The owner/self pilot needs to run inside Codex conversation. Asking the learner to operate `node` commands would contradict the product direction. This work adds a dedicated Codex skill so the agent can conduct Day 0, daily pilot days, and final sample collection while using the local engine internally.

## What Changed

- Added `skills/owner-pilot/SKILL.md`.
- `setup --host codex` now installs `english-learning-owner-pilot`.
- Agent install smoke now expects the owner pilot skill.
- Scaffold smoke now treats the owner pilot skill and skill smoke as required files.
- Added `scripts/phase15-owner-pilot-skill-smoke.mjs` to verify the learner-facing pilot contract.

## Verified Behavior

The skill contract requires Codex to:

- keep the learner in conversation;
- ask one pilot card at a time;
- run `pilot-start`, `pilot-day`, and `pilot-finish` internally;
- avoid exposing command-line operation, rubric fields, or engineering status;
- keep real pilot completion separate from fixture mechanics.

## Verification

Passed:

```bash
node scripts/phase15-owner-pilot-skill-smoke.mjs
node scripts/phase7-agent-install-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

## Claim Boundary

This proves the Codex-facing owner pilot skill contract and install path. It does not run the real owner/self pilot and does not prove learning outcomes.
