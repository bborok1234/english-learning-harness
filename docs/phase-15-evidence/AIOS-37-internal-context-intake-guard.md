# AIOS-37 Internal Context Intake Guard Evidence

Date: 2026-06-04
Issue: #260
Status: Mechanics complete, real pilot still open

## What Changed

- `pilot-intake` now recognizes Codex/internal context payloads before quick-reply or direct-answer classification.
- Markers such as `codex_internal_context`, `<objective>`, `Continuation behavior`, `Completion audit`, `Blocked audit`, `Tokens used`, and `Do not call update_goal` classify as `internal_context_block`.
- Internal context blocks return `saveEligible=false`, `route=no-save`, and a learner-safe no-save message.
- Preview JSON/HTML still omit the raw incoming payload and do not save learner evidence.
- `skills/owner-pilot/SKILL.md` and `docs/DATA-CONTRACTS.md` now document the no-save rule.

## Verification

```bash
node scripts/phase15-owner-pilot-intake-preview-smoke.mjs
node scripts/phase15-owner-pilot-skill-smoke.mjs
```

The smoke now covers:

- Fresh quick-reply preview still remains save-eligible.
- Fresh Korean dashboard/status request remains no-save.
- Fresh Codex/internal goal continuation payload is no-save, despite containing English text.
- Partial pilot direct English answer preview still remains save-eligible without changing saved answer counts.
- Preview output and rendered HTML do not leak raw internal context, command names, issue/rubric/audit internals, or unsupported fluency claims.

## Boundary

This is fixture mechanics only. It does not run the real owner/self pilot, close #179, prove learning outcomes, or support claims of real-world speaking improvement.
