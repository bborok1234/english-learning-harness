# AIOS-16 Honest Pilot Friction Evidence

Issue: #218
Date: 2026-06-03
Decision: continue

## Why

The real owner/self pilot needs honest friction evidence. A placeholder such as `No explicit friction note captured.` should not be stored as if the learner actually reported friction.

## What Changed

- `pilot-reply` no longer writes a placeholder friction note when a daily reply has no explicit friction note.
- Daily saved-reply summaries now expose `frictionNoteCaptured`.
- When no daily friction note was captured, the saved-reply card shows a learner-facing short friction follow-up prompt.
- Explicit friction notes still work and suppress the follow-up prompt.

## Verification

- `node scripts/phase15-owner-pilot-reply-card-render-smoke.mjs`
- `node scripts/phase15-owner-pilot-reply-routing-smoke.mjs`

## Claim Boundary

This proves honest friction-note mechanics for fixture pilot replies only. It does not run the real owner/self pilot, save a real new answer, prove learning outcomes, or close #179.
