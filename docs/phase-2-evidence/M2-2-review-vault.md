# M2-2 Due Review Queue Command and Phrase Vault

Date: 2026-05-28
Issue: #26
Decision: continue

## Why

M1/M2-1 could schedule phrases, but the learner could not intentionally return to them. A daily harness needs a clear way to see due phrases, use them in context, and keep a personal phrase vault.

## What changed

- Added `review` command to list due review items.
- Added `review --review-id ID --result success|fail` to update local review state.
- Enforced the 1/3/7/14 interval schedule after successful reviews.
- Resets failed reviews to a one-day interval and `success_count: 0`.
- Added `vault` command to show saved personal phrases without adding unsupported progress claims.
- Changed review prompts to ask for tiny real-life context use instead of flashcard-only recall.

## Verification

Commands run:

```bash
node scripts/phase2-review-vault-smoke.mjs
node scripts/phase1-command-wrapper-smoke.mjs
node scripts/phase1-vocabulary-history-smoke.mjs
node scripts/phase2-learner-model-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

Result: all passed.

Key review/vault smoke evidence:

```json
{
  "status": "pass",
  "reviewId": "phrase-i-like-drinking-coffee",
  "vault": {
    "phraseCount": 1,
    "phrase": "I like drinking coffee."
  },
  "success": {
    "intervalDays": 3,
    "successCount": 1
  },
  "fail": {
    "intervalDays": 1,
    "successCount": 0
  }
}
```

## Remaining Boundary

This proves local review mechanics. It does not prove retention or real-world transfer; those require weekly mirror evidence and real learner validation.
