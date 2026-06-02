# AIOS-14 Learner Cockpit Command-Free Surface

Issue: #214
Date: 2026-06-02
Decision: continue

## Why

The AI-native product surface should keep the learner inside the Codex conversation. A learner cockpit that shows `node scripts/...` commands feels like an internal engine dashboard, not a daily English practice harness.

## What Changed

- Personal cockpit state now uses `today.codex_start_prompt` and `today.mission_prompt` instead of `today.start_command`.
- Personal cockpit `next_actions` now expose Korean Codex-facing prompts instead of shell commands.
- Personal cockpit latest mission and latest asset-deck summaries strip internal `start_command` fields before they enter the learner-facing state.
- Personal cockpit HTML renders "Codex에게 이렇게 말하세요" prompts for today's mission and next actions.
- Product-surface smoke guards now reject `node scripts/english-learning-harness.mjs`, `--learner-root`, and `start_command` leakage.
- `docs/SURFACE-BOUNDARY.md` now explicitly forbids internal engine commands in learner-facing product surfaces.

## Verification

- `node scripts/personal-learner-cockpit-smoke.mjs`
- `node scripts/product-surface-smoke.mjs`
- `node scripts/adaptive-mission-asset-priority-smoke.mjs`

## Claim Boundary

This proves the personal cockpit product surface no longer exposes ordinary learner actions as internal shell commands. It does not prove real learner outcomes, completion of the owner/self pilot, realtime voice support, retention, or generated-media learning gains.
