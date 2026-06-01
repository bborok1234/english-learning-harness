# M9-3 Pilot Prompt UX And Privacy Handoff

Issue: #138
Status: implemented on PR branch
Decision: continue

## Why

The first pilot prompt exposed internal evaluation language. A learner saw `A clarification question I can ask` and reasonably could not tell what to do. That is a product flaw, not a learner English problem.

## What Changed

- Replaced internal Day 0 wording with a "3분 영어 스냅샷" learner-facing flow.
- Added five mission cards with concrete situations, one-sentence asks, and examples.
- Replaced project-specific first-use scenarios with neutral daily-life situations such as meeting at the usual place after work.
- Added `conversationGuide` to `pilot-start`, `pilot-status`, and `pilot-day` outputs so Codex can ask one card at a time.
- Added `docs/PILOT-PROMPTS.md` with the prompt contract and a rejected bad-prompt example.
- Added a Korean README pilot start prompt and local-only privacy reminder.
- Added `scripts/phase9-pilot-prompt-ux-smoke.mjs`.

## Verification

Expected checks:

```bash
node scripts/phase9-pilot-prompt-ux-smoke.mjs
node scripts/phase9-owner-pilot-smoke.mjs
node scripts/phase7-learner-readme-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

## Claim Boundary

This improves prompt clarity and start friction. It does not prove real learner outcome improvement.
