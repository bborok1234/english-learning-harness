# AIOS-38 Intake Resume Prompt Evidence

Date: 2026-06-04
Issue: #262
Status: Mechanics complete, real pilot still open

## What Changed

- `pilot-intake` now returns `learnerFacing.resumePrompt`, `learnerFacing.quickReplies`, and `learnerFacing.responseRule`.
- The local `pilot-intake-preview.json/html` now includes a learner-safe `resume` section sourced from the current `pilot-next` card.
- No-save turns can now recover directly to the current learner card instead of requiring Codex to reassemble state from separate artifacts.
- The preview still omits raw incoming text and saves no learner evidence.
- `skills/owner-pilot/SKILL.md` and `docs/DATA-CONTRACTS.md` now document the resume behavior after `route=no-save`.

## Verification

```bash
node scripts/phase15-owner-pilot-intake-preview-smoke.mjs
node scripts/phase15-owner-pilot-skill-smoke.mjs
```

The smoke verifies:

- Quick-reply, Korean/meta no-save, internal-context no-save, and direct-answer previews all include resume prompt and quick replies.
- Preview JSON/HTML render the resume section and current quick replies.
- Preview output does not save learner answers, create a fresh pilot state, mutate answer counts, or leak raw input/internal context.

## Boundary

This is fixture mechanics only. It does not run the real owner/self pilot, close #179, prove learning outcomes, or support claims of real-world speaking improvement.
