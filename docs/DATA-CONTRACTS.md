# Data Contracts

Last updated: 2026-05-29
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
    ├── sessions/
    └── weekly/
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

Migration rule: if an existing learner store has `progress.json` v2 but no `learner-model.json`, setup/health/session/context commands create the default schema without changing existing progress totals.

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
      "success_count": 0,
      "last_reviewed_at": "ISO-8601 optional after first review",
      "last_result": "success|fail optional after first review"
    }
  ]
}
```

Default intervals:

- new phrase: next day,
- after first successful review: 3 days,
- after second successful review: 7 days,
- after third and later successful reviews: 14 days,
- failed review: reset to next day with `success_count: 0`.

Review prompts must ask the learner to use the phrase in a tiny real-life context, not only recall the phrase as a flashcard.

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
    "cefr_skill": "clarification|repair|turn-taking|...",
    "due_review": {
      "id": "phrase-id",
      "text": "Coffee helps me wake up.",
      "due_at": "ISO-8601"
    },
    "selection_reason": {
      "source": "profile-memory|due-review|preferred",
      "weak_skill": "repair",
      "mode": "easy|normal|stretch",
      "due_review_id": "phrase-id",
      "due_review_phrase": "Coffee helps me wake up.",
      "avoided_topics": []
    }
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
  },
  "learner_model_evidence": {
    "updated_skills": ["starts", "repair"],
    "average_utterance_words": 8,
    "repair_phrase_count": 1
  }
}
```

## Weekly Mirror Artifact

Required fields:

```json
{
  "schema_version": 1,
  "generated_at": "ISO-8601",
  "window": {
    "session_count": 3,
    "from": "YYYY-MM-DD",
    "to": "YYYY-MM-DD"
  },
  "communicated_themes": [],
  "saved_phrases": [],
  "reused_phrases": [],
  "repair_attempts": [],
  "skill_evidence": {
    "starts": 0,
    "follow_ups": 0,
    "clarification": 0,
    "repair": 0,
    "soft_disagreement": 0
  },
  "next_focus": {
    "skill": "repair",
    "reason": "Lowest local evidence count (0).",
    "suggested_phrase": "I like drinking coffee.",
    "prompt": "Reuse due phrase in a tiny real-life context: \"I like drinking coffee.\""
  },
  "claim_boundary": "This mirror summarizes local practice evidence only. It does not rank level or guarantee real-world fluency."
}
```

Weekly mirrors may only summarize local artifacts, progress, learner model, vocabulary, and review queue data. They may not report level ranking, native-speaker comparisons, or guaranteed transfer to real-world confidence.

## Daily Cockpit Output

The `daily` command returns generated JSON and does not persist a new artifact.

Required fields:

```json
{
  "schema_version": 1,
  "generated_at": "ISO-8601",
  "learner_root": "/absolute/path",
  "return_state": {
    "session_count": 1,
    "last_session_at": "ISO-8601",
    "days_since_last_session": 0,
    "message": "You already practiced today. Review or save one phrase."
  },
  "due_review": {
    "count": 1,
    "items": []
  },
  "suggested_scenario": {
    "id": "stuck-repair",
    "title": "Stuck Repair",
    "mode": "easy",
    "goal": "Reuse a saved phrase in a tiny real-life context.",
    "rescue_phrase": "I don't know how to say it, but...",
    "due_review": {},
    "selection_reason": {
      "source": "due-review|profile-memory|preferred"
    }
  },
  "learner_model_summary": {
    "skill_evidence": {},
    "average_utterance_words": 0,
    "repair_phrase_count": 0,
    "energy": "easy"
  },
  "saved_phrase_count": 1,
  "latest_weekly_mirror": "artifacts/weekly/weekly-mirror-YYYY-MM-DD.json",
  "latest_journal": "journal/YYYY-MM-DD.md",
  "next_commands": [],
  "claim_boundary": "This cockpit chooses the next local practice action from local files only. It does not measure long-term skill transfer."
}
```

The cockpit may read `profile.md`, `progress.json`, `learner-model.json`, `vocabulary.json`, `review-queue.json`, latest journal, and latest weekly mirror. It must not punish missed days or claim measured long-term outcomes.

## Learner Home HTML

The `home` command writes `home.html` under the learner root. This file is a learner-facing local surface, not the project execution dashboard.

Required content:

- today's suggested scenario and start command,
- due review phrase preview,
- saved phrase preview,
- latest weekly mirror themes and next focus when available,
- small local journey counts for sessions, due phrases, and saved phrases,
- claim boundary.

Forbidden content:

- GitHub issue/PR/process logs,
- implementation progress claims,
- native-speaker comparison,
- guaranteed outcomes,
- level ranking.

## Contract Rule

The dashboard may not claim learning progress from a field unless that field has:

- a schema,
- a write path,
- a validation check,
- and at least one fixture proving the semantics.
