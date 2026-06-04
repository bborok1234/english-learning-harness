# AIOS-36 Pilot Intake Preview Evidence

Date: 2026-06-04
Issue: #258
Status: Mechanics complete, real pilot still open

## What Changed

- Added `pilot-intake` as a protected no-save preview before `pilot-reply`.
- The preview classifies incoming Codex-thread messages as direct English answers, quick-reply selections, Korean/meta/control requests, or ambiguous non-answers.
- The preview writes local `artifacts/pilot/pilot-intake-preview.json/html`.
- The preview never saves learner answers, marks consent, creates a fresh `pilot-state.json`, changes answer counts, or echoes the raw incoming message into preview artifacts.
- `skills/owner-pilot/SKILL.md` now instructs Codex to use the preview when the incoming message might be meta/status/control text rather than pilot speech evidence.

## Verification

```bash
node scripts/phase15-owner-pilot-intake-preview-smoke.mjs
node scripts/phase15-owner-pilot-skill-smoke.mjs
```

The smoke covers:

- Fresh no-state quick-reply selection preview.
- Fresh Korean dashboard/status request preview as `no-save`.
- Partial pilot state direct English answer preview with existing answer counts unchanged.
- Browser-rendered preview HTML.
- No raw incoming message, command, issue, rubric, audit, or unsupported fluency-claim leakage in returned preview surfaces.

## Boundary

This is fixture mechanics only. It does not run the real owner/self pilot, close #179, prove learning outcomes, or support claims of real-world speaking improvement.
