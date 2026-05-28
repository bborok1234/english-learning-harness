# Data Contracts

Last updated: 2026-05-28
Status: Active planning contract

## Purpose

This file defines the minimum data contracts needed before implementation can scale beyond smoke scripts.

## Learner Store

```text
~/english-learning/
├── profile.md
├── progress.json
├── learner-model.json
├── vocabulary.json
├── review-queue.json
├── scenarios/
├── journal/
└── artifacts/
```

## `learner-model.json`

Required fields:

```json
{
  "schema_version": 1,
  "baseline": {
    "created_at": "ISO-8601",
    "comfort_rating": 0,
    "freeze_triggers": [],
    "average_utterance_words": 0,
    "repair_phrase_count": 0
  },
  "interaction_skills": {
    "starts": {"evidence_count": 0},
    "follow_ups": {"evidence_count": 0},
    "clarification": {"evidence_count": 0},
    "repair": {"evidence_count": 0},
    "soft_disagreement": {"evidence_count": 0}
  },
  "affect": {
    "last_energy": "easy",
    "last_confidence_note": ""
  }
}
```

## `vocabulary.json`

Required fields:

```json
{
  "schema_version": 1,
  "known_tokens": [],
  "known_phrases": [],
  "emerging_tokens": [],
  "personal_phrases": []
}
```

`new_vocabulary_count` must count only tokens not previously present in `known_tokens` or `emerging_tokens`.

Migration rule: if an existing learner store has `progress.json` v2 but no `vocabulary.json`, setup/health/session commands create the default schema without changing existing progress totals.

## `review-queue.json`

Required fields:

```json
{
  "schema_version": 1,
  "items": [
    {
      "id": "phrase-id",
      "type": "phrase",
      "text": "Coffee helps me wake up.",
      "source_session_id": "session-id",
      "due_at": "ISO-8601",
      "interval_days": 1,
      "success_count": 0
    }
  ]
}
```

Default intervals:

- first review: next day,
- second review: 3 days,
- third review: 7 days,
- fourth review: 14 days.

## Session Artifact

Required fields:

```json
{
  "id": "session-id",
  "date": "YYYY-MM-DD",
  "mode": "text-first",
  "scenario": {
    "id": "scenario-id",
    "mode": "easy|normal|stretch",
    "goal": "...",
    "role_context": "...",
    "rescue_phrase": "...",
    "cefr_skill": "clarification|repair|turn-taking|..."
  },
  "turns": [],
  "mirror": {
    "communicated": "...",
    "recast": "...",
    "pattern": "...",
    "reviewPhrase": "...",
    "retryPrompt": "..."
  },
  "session_metrics": {},
  "vocabulary_evidence": {
    "tokens": ["coffee"],
    "new_tokens": ["coffee"],
    "repeated_tokens": [],
    "review_phrase": "I like drinking coffee.",
    "scheduled_review_id": "phrase-i-like-drinking-coffee",
    "scheduled_review_created": true
  }
}
```

## Contract Rule

The dashboard may not claim learning progress from a field unless that field has:

- a schema,
- a write path,
- a validation check,
- and at least one fixture proving the semantics.
