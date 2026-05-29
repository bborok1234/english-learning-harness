# M7-15 Codex-Native User Surface Evidence

Issue: #120
Decision: pivot

## Problem

The README had been improved for learners, but still presented `node scripts/...` as the first-use product path. That contradicts the product intent: learners should talk to Codex, while Codex uses the local engine internally for persistence and verification.

## Change

- Reframed the README first-use path around opening the repository in Codex and using natural-language practice prompts.
- Moved `node` commands into `Internal Engine For Maintainers`.
- Updated Codex skill instructions so onboarding, daily practice, mini mirror, and picture-description flows keep the learner in conversation and do not ask for ordinary `node` command execution.
- Updated the plugin manifest language to describe Codex conversation as the product surface.
- Strengthened `scripts/phase7-learner-readme-smoke.mjs` so it fails if `node scripts/...` appears before the internal engine section.

## Verification

```bash
node scripts/phase7-learner-readme-smoke.mjs
node scripts/phase7-open-source-readiness-smoke.mjs
node scripts/phase6-public-clean-clone-smoke.mjs
node scripts/phase6-marketplace-install-smoke.mjs
```

All checks passed locally on 2026-05-29.

## Boundary

This fixes the public product framing and skill contract. It does not yet prove a fully automatic public Git-backed plugin install, stable realtime voice, or real learner outcome improvement.
