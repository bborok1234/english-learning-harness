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
├── speaking-backlog.json
├── vocabulary.json
├── review-queue.json
├── scenarios/
├── journal/
└── artifacts/
    ├── speaking-os/
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

## `speaking-backlog.json`

Required fields:

```json
{
  "schema_version": 1,
  "items": [
    {
      "id": "speaking-repair",
      "skill": "repair",
      "label": "Repair a stuck moment",
      "status": "open|in_progress|passed|needs_review",
      "priority": "high|medium|low",
      "created_at": "ISO-8601",
      "updated_at": "ISO-8601",
      "source": "diagnose|manual|session",
      "diagnosis": "Detected repair practice need from learner output.",
      "target_behavior": "Keep speaking with a rescue phrase when a word is missing.",
      "drill_prompt": "Use: I don't know how to say it, but + simple idea.",
      "transfer_test": "Can you continue after getting stuck?",
      "pass_criteria": "Learner uses a repair phrase.",
      "evidence_count": 0,
      "attempts": []
    }
  ]
}
```

Speaking backlog items are the core Speaking Skill OS work units. `diagnose` creates or refreshes them from learner output. `daily` and `today` should prioritize open/needs-review items before generic scenarios. A session may mark an item `passed` only when the learner performs the target behavior in a transfer attempt.

Migration rule: if an existing learner store has `progress.json` v2 but no `speaking-backlog.json`, setup/health/session/context commands create the default empty schema without changing existing progress totals.

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
      "source": "profile-memory|due-review|speaking-backlog|preferred",
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
  },
  "speaking_backlog_evidence": {
    "item_id": "speaking-repair",
    "skill": "repair",
    "result": "pass|needs_review",
    "status": "passed|needs_review",
    "evidence_count": 1,
    "transfer_test": "Can you continue after getting stuck?",
    "pass_criteria": "Learner uses a repair phrase."
  },
  "interaction_events": []
}
```

## Interaction Event

Required fields:

```json
{
  "schema_version": 1,
  "event_id": "session-id-event-1",
  "modality": "text|voice|image|video|realtime",
  "scenario_id": "stuck-repair",
  "learner_intent": "Keep the conversation alive when you do not know a word.",
  "learner_output": "I don't know how to say it, but the meeting was okay.",
  "trouble_source": "missing word or stuck moment",
  "mediation_level": "prompt-first|hint|recast|explicit-model|retry",
  "repair_move": "Try the pattern: I don't know how to say it, but + simple idea",
  "retry_output": "I don't know how to say it, but the meeting was okay.",
  "saved_phrase": "I don't know how to say it, but the meeting was okay.",
  "transfer_targets": ["stuck moment", "daily explanation", "work chat"],
  "source_artifact": {
    "type": "audio|image|video optional",
    "path": "/local/path optional",
    "hidden_detail": "optional information-gap detail for image/video prompts",
    "clarification_prompt": "optional clarification prompt tied to hidden_detail",
    "claim_boundary": "Audio path is local metadata only; no speech-quality judgment is inferred."
  },
  "claim_boundary": "This event records local interaction evidence only. It does not prove real-world fluency."
}
```

Interaction events are the required evidence bridge for all future modalities. Text, voice, image, video, and realtime paths may differ in input source, but they must write the same intention/output/trouble/mediation/retry/transfer shape before dashboard or learner home surfaces can claim multimodal readiness.

Forbidden event claims:

- native-speaker comparison,
- guaranteed fluency,
- level ranking,
- pronunciation score from noisy signals,
- real-world confidence transfer.

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
  "interaction_event_summary": {
    "event_count": 3,
    "modalities": ["text"],
    "trouble_sources": ["missing word or stuck moment"],
    "mediation_levels": ["recast"],
    "saved_phrases": ["I like drinking coffee."],
    "transfer_targets": ["small talk", "daily routine"]
  },
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
    "gap_kind": "fresh|same-day|next-day|long-gap",
    "message": "You already practiced today. Review or save one phrase.",
    "restart_action": "Review one due phrase in a tiny real-life context."
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
Gap detection must use `progress.last_session_at` only. It must not create hidden streak state.

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

## M5 Evidence Pack

The `export` command writes JSON and Markdown review packs under `artifacts/validation/`.

Required JSON fields:

```json
{
  "schema_version": 1,
  "generated_at": "ISO-8601",
  "protocol": "docs/M5-SEVEN-DAY-VALIDATION-PROTOCOL.md",
  "learner_root": {
    "local_path_redacted": true,
    "basename": "learner",
    "note": "Local path is metadata only and is not included in the evidence pack."
  },
  "source_files": {
    "profile": "profile.md",
    "progress": "progress.json",
    "learner_model": "learner-model.json",
    "vocabulary": "vocabulary.json",
    "review_queue": "review-queue.json",
    "learner_home": "home.html"
  },
  "summary": {
    "session_count": 7,
    "total_learner_word_count": 0,
    "repair_session_count": 0,
    "interaction_event_count": 0,
    "modalities": [],
    "saved_phrase_count": 0,
    "review_item_count": 0,
    "reused_review_item_count": 0,
    "weekly_mirror_count": 0
  },
  "sessions": [],
  "weekly_mirrors": [],
  "review_queue": {
    "item_count": 0,
    "items": []
  },
  "claim_boundary": "This evidence pack summarizes local practice artifacts for review. It does not prove learning improvement, fluency, or real-world speaking ability."
}
```

Local learner roots and source media paths must be redacted or marked local-only inside the evidence pack. The command output may include the local pack paths so the user can open the generated files on their own machine.

## Contract Rule

The dashboard may not claim learning progress from a field unless that field has:

- a schema,
- a write path,
- a validation check,
- and at least one fixture proving the semantics.
