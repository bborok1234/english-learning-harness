# AIOS-18 Owner Pilot Skill Contract Alignment

Status: contract alignment pass; real owner/self pilot still open

## Why

AIOS-17 changed the fresh Day 0 pilot card into an immersive scene chooser. The Codex-facing owner-pilot skill and canonical prompt contract also need to describe that start path, otherwise Codex could still lead the real pilot with the older fixed "what did you do today?" first prompt.

## What Changed

- `skills/owner-pilot/SKILL.md` now tells Codex to generate `pilot-next --json` before asking the next learner-facing card.
- Fresh Day 0 guidance now starts with `첫 장면 고르기` and three opening choices:
  - 일상 장면
  - 작은 모험
  - 편한 공간
- The skill tells Codex to accept `1`, `2`, `3`, quick-reply ids, or a direct English sentence while keeping engine commands internal.
- `docs/PILOT-PROMPTS.md` now matches the scene-chooser contract.
- `scripts/phase15-owner-pilot-skill-smoke.mjs` now fails if the owner-pilot skill keeps stale fixed-first-card guidance.

## Verification

```bash
node scripts/phase15-owner-pilot-skill-smoke.mjs
node scripts/phase15-owner-pilot-next-card-smoke.mjs
```

## Claim Boundary

This validates the Codex-facing pilot contract only. It does not run the real owner/self pilot, save real learner answers, prove engagement, or prove learning outcomes.
