# PH1-FIX-2 Vocabulary History And Review Queue

Date: 2026-05-28
Status: Pass
GitHub issue: https://github.com/bborok1234/english-learning-harness/issues/12

## Decision

Vocabulary semantics now live in learner-owned local files:

- `vocabulary.json`
- `review-queue.json`

`progress.json` remains a summary store with only the five MVP metrics.

## Why

The previous implementation counted per-session unique English tokens as new vocabulary. Repeating `I like coffee.` across two sessions incorrectly increased `new_vocabulary_count` twice.

## Implementation

Added historical vocabulary comparison in `scripts/lib/english-learning-store.mjs`.

The session persist path now:

1. reads `vocabulary.json`,
2. computes session new tokens against `known_tokens + emerging_tokens`,
3. stores new tokens in `emerging_tokens`,
4. stores the recast phrase in `personal_phrases`,
5. schedules one review queue item for the recast phrase,
6. writes `vocabulary_evidence` into the session artifact,
7. keeps `progress.json` limited to supported summary metrics.

Existing v2 learner stores migrate automatically by creating default `vocabulary.json` and `review-queue.json` when setup/health/session commands run.

## Verification

Command:

```bash
node scripts/phase1-vocabulary-history-smoke.mjs
```

Observed:

- first `I like coffee.` session counted `new_vocabulary_count: 3`;
- second identical session counted `new_vocabulary_count: 0`;
- cumulative progress stayed at `3`, not `6`;
- `vocabulary.json` persisted `i`, `like`, and `coffee`;
- `review-queue.json` scheduled one phrase review without duplicate queue items;
- migration check created `vocabulary.json` and `review-queue.json` for an existing v2 store.

## Claim Boundary

This proves durable vocabulary counting and basic phrase review scheduling. It does not prove long-term retention or speaking improvement.
