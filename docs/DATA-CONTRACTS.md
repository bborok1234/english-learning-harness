# Data Contracts

Last updated: 2026-06-02
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

## M9 Owner Pilot State

The `pilot-start`, `pilot-status`, `pilot-day`, and `pilot-finish` commands write `pilot-state.json` under the learner root and local report artifacts under `artifacts/pilot/`.

Required JSON fields:

```json
{
  "schema_version": 1,
  "pilot_id": "owner-self-YYYY-MM-DD",
  "participant": {
    "type": "owner_self",
    "label": "repository owner / self pilot participant"
  },
  "protocol": "docs/M5-SEVEN-DAY-VALIDATION-PROTOCOL.md",
  "status": "awaiting_baseline|in_progress|ready_to_finish|complete|incomplete",
  "started_at": "ISO-8601",
  "target_days": 7,
  "minimum_valid_daily_sessions": 5,
  "prompt_set": ["warm_start", "clarification", "reuse", "image_info_gap", "reflection"],
  "consent": {
    "scope": "local-only",
    "accepted_at": "ISO-8601",
    "note": "Pilot data stays local by default."
  },
  "baseline": {
    "collected_at": "ISO-8601",
    "prompt_set": [],
    "transcript": [],
    "comfort_rating": 2,
    "diagnosis_artifact": "artifacts/speaking-os/diagnosis-YYYY-MM-DD.json",
    "artifact": "artifacts/pilot/baseline-YYYY-MM-DD.json"
  },
  "days": [
    {
      "day": 1,
      "date": "ISO-8601",
      "status": "complete",
      "session_id": "YYYY-MM-DD-...",
      "artifact": "artifacts/sessions/...",
      "friction_note": "",
      "pilot_mission": {
        "id": "clarify-usual-place|repair-wrong-order|image-info-gap|soft-disagreement|follow-up-invitation",
        "day": 1,
        "title": "확인 질문 만들기",
        "target_skill": "clarification|repair|image_description|soft_disagreement|follow_up",
        "transfer_evidence": "learner-facing behavior being sampled"
      },
      "learner_coaching": {
        "communicated": "learner-facing summary of what was communicated",
        "recast": "short improved sentence",
        "next_phrase": "phrase to reuse next",
        "next_focus": "next learner-facing focus",
        "artifact_hint": "which local product surfaces were refreshed"
      },
      "speaking_backlog_evidence": {},
      "aios_artifacts": {
        "mission": "artifacts/missions/daily-mission-YYYY-MM-DD.html",
        "scene": "artifacts/scenes/daily-scene-YYYY-MM-DD.html",
        "asset_deck": "artifacts/assets/mission-assets-YYYY-MM-DD.html",
        "next_asset_action": {
          "asset_id": "text-practice|image-information-gap|voice-transcript|interactive-html-scene|...",
          "label": "learner-facing next action",
          "reason": "why this asset is next from local evidence"
        },
        "learner_report": "artifacts/reports/learner-report-YYYY-MM-DD.html",
        "cockpit": "cockpit.html"
      }
    }
  ],
  "final_sample": {
    "collected_at": "ISO-8601",
    "prompt_set": [],
    "transcript": [],
    "comfort_rating": 3,
    "report": "artifacts/pilot/pilot-report-YYYY-MM-DD.json"
  },
  "partial": {
    "baseline": {
      "answers": [
        {
          "phase": "baseline",
          "card_id": "today_snapshot",
          "title": "오늘의 한 컷",
          "answer": "learner answer",
          "captured_at": "ISO-8601"
        }
      ],
      "comfort_rating": 2
    },
    "final": {
      "answers": []
    },
    "days": [
      {
        "phase": "day",
        "day": 1,
        "card_id": "day-1",
        "answer": "learner answer",
        "friction_note": "short local note",
        "captured_at": "ISO-8601"
      }
    ]
  },
  "report": {
    "json": "artifacts/pilot/pilot-report-YYYY-MM-DD.json",
    "markdown": "artifacts/pilot/pilot-report-YYYY-MM-DD.md",
    "decision": "continue|research|pivot|kill_claim|invalid",
    "pass_signals": [],
      "product_journey_audit": {
        "decision": "continue|research|pivot|kill_claim|invalid",
        "evidence_complete": true,
        "days_with_core_artifacts": 5,
        "days_with_asset_actions": 5,
        "days_with_pilot_mission_metadata": 5,
        "days_with_learner_coaching": 5,
        "distinct_pilot_mission_skills": [
          "clarification",
          "repair",
          "image_description",
          "soft_disagreement",
          "follow_up"
        ],
        "friction_note_count": 5
      }
  },
  "claim_boundary": "This owner/self pilot can produce early local behavioral evidence only. It does not prove generalized fluency or real-world speaking ability."
}
```

The participant label must stay generic unless the learner explicitly provides a name for public-facing output. The pilot state must not assume a personal name. Reports may include transcript text locally, but public issue/PR summaries should use redacted or summarized evidence unless the learner explicitly approves sharing.

When a pilot is active, `cockpit-state.json` may include:

```json
{
  "active_pilot": {
    "pilot_id": "owner-self-YYYY-MM-DD",
    "status": "awaiting_baseline|in_progress|ready_to_finish|incomplete",
    "baseline_ready": false,
    "completed_daily_sessions": 0,
    "minimum_valid_daily_sessions": 5,
    "partial": {
      "baseline_answers": 1,
      "final_answers": 0,
      "day_captures": 0
    },
    "next_card": {
      "phase": "baseline|day|final",
      "day": null,
      "card_id": "meaning_check",
      "title": "잠깐, 무슨 뜻이야?",
      "ask": "learner-facing next prompt",
      "example": "Which place do you mean?"
    },
    "learner_prompt": "learner-facing next prompt",
    "state_file": "pilot-state.json"
  }
}
```

The learner-facing cockpit must not expose `pilot-capture`, `pilot-start`, `pilot-finish`, PR/issue labels, or `product_journey_audit` internals.

`pilot-capture --json` returns the refreshed learner cockpit location after each captured card:

```json
{
  "status": "pass",
  "action": "pilot-capture",
  "phase": "baseline|day|final",
  "committed": false,
  "cockpit": {
    "statePath": "learner-root/cockpit-state.json",
    "htmlPath": "learner-root/cockpit.html",
    "url": "file:///absolute/path/to/cockpit.html",
    "activePilot": {
      "pilot_id": "owner-self-YYYY-MM-DD",
      "status": "awaiting_baseline|in_progress|ready_to_finish|incomplete",
      "next_card": {}
    }
  },
  "claimBoundary": "This owner/self pilot can produce early local behavioral evidence only. It does not prove generalized fluency or real-world speaking ability."
}
```

The cockpit refresh is a product-surface convenience contract. It is not evidence that the real owner/self pilot has been completed.

`pilot-reply --json` is a Codex-internal routing helper. It lets Codex save the learner's current answer without asking the learner to choose baseline/day/final, card id, or day number:

```json
{
  "status": "pass",
  "action": "pilot-reply",
  "routedTo": {
    "phase": "baseline|day|final",
    "cardId": "today_snapshot",
    "day": 1
  },
  "result": {
    "action": "pilot-capture",
    "committed": false
  },
  "cockpit": {
    "statePath": "learner-root/cockpit-state.json",
    "htmlPath": "learner-root/cockpit.html",
    "url": "file:///absolute/path/to/cockpit.html"
  },
  "nextCardArtifact": {
    "action": "pilot-next",
    "jsonPath": "learner-root/artifacts/pilot/pilot-next-card.json",
    "htmlPath": "learner-root/artifacts/pilot/pilot-next-card.html",
    "url": "file:///absolute/path/to/pilot-next-card.html",
    "nextCard": {
      "phase": "baseline|day|final|complete",
      "day": 1,
      "title": "learner-facing next card title"
    }
  },
  "claimBoundary": "This routes the next local pilot answer. It does not prove learning outcomes or pilot completion."
}
```

The router must delegate to `pilot-capture` rather than write pilot state directly, so cockpit refresh and commit behavior stay in one path. After saving, it must regenerate `pilot-next-card.json/html` so the next learner-facing card is not stale. It is not a learner-facing command and must not appear in generated learner HTML.

`pilot-next --json` writes the current learner-facing pilot card:

```json
{
  "status": "pass",
  "action": "pilot-next",
  "jsonPath": "learner-root/artifacts/pilot/pilot-next-card.json",
  "htmlPath": "learner-root/artifacts/pilot/pilot-next-card.html",
  "url": "file:///absolute/path/to/pilot-next-card.html",
  "nextCard": {
    "phase": "baseline|day|final|complete",
    "day": 1,
    "title": "확인 질문 만들기",
    "setup": "learner-facing setup",
    "ask": "learner-facing prompt",
    "example": "Which place do you mean?",
    "learner_rule": "답은 한 문장이면 됩니다."
  },
  "claimBoundary": "This card helps continue the local owner/self pilot. It does not prove learning outcomes or pilot completion."
}
```

The generated HTML must not expose `pilot-next`, `pilot-capture`, `pilot-start`, `pilot-day`, `pilot-finish`, PR/issue labels, or `product_journey_audit` internals.

The first five `pilot-next` daily cards must cover distinct speaking actions:

| Day | Target action | Example |
|---|---|---|
| 1 | clarification | `Which place do you mean?` |
| 2 | repair | `Sorry, I meant iced latte, not hot latte.` |
| 3 | image/scene description | `It looks like a meeting room.` |
| 4 | soft disagreement | `I understand, but I cannot stay late today.` |
| 5 | follow-up | `Where did you go hiking?` |

These varied missions are local pilot prompts, not evidence of outcome improvement.

`pilot-finish` must copy each day `pilot_mission` into `report.aios_artifacts.days[].pilot_mission`, copy each day `learner_coaching` into `report.aios_artifacts.days[].learner_coaching`, and count both `days_with_pilot_mission_metadata` and `days_with_learner_coaching` in `product_journey_audit`. The audit is invalid if completed days lack this metadata.

## Local Pilot Dashboard Overlay

`scripts/sync-local-pilot-dashboard.mjs` may write `docs/ops/local-pilot-status.json` and `docs/ops/local-engineering-dashboard.html` for local operations. These files are ignored by git. The tracked example is `docs/ops/local-pilot-status.example.json`.

The local overlay must be redacted:

```json
{
  "schemaVersion": 1,
  "updatedAt": "ISO-8601",
  "source": "scripts/sync-local-pilot-dashboard.mjs",
  "redaction": "Transcript, private notes, audio, image, and local learner paths are intentionally excluded.",
  "pilot": {
    "status": "in_progress",
    "baselineReady": true,
    "completedDailySessions": 0,
    "minimumValidDailySessions": 5,
    "targetDays": 7,
    "finalReady": false,
    "reportReady": false,
    "readyToFinish": false,
    "next": {
      "phase": "day",
      "day": 1,
      "title": "Pilot Day 1",
      "cardId": "day-1"
    }
  }
}
```

This overlay is for local progress visibility only. It must not be used as public proof of learner outcomes or as a substitute for the actual five-day pilot evidence.

## M10 Narrative Mission Contracts

Narrative mission state is valid only when story progress is bound to a Speaking Skill OS transfer test.

Canonical schemas and fixtures:

- `docs/narrative-missions/schemas/mission-spec.schema.json`
- `docs/narrative-missions/schemas/world-state.schema.json`
- `docs/narrative-missions/schemas/tool-capabilities.schema.json`
- `docs/narrative-missions/fixtures/usual-place-clarification.mission-spec.json`
- `docs/narrative-missions/fixtures/daily-life.world-state.json`
- `docs/narrative-missions/fixtures/light.tool-capabilities.json`

Runtime validator:

- `scripts/lib/narrative-mission.mjs`

Smoke:

- `node scripts/phase10-world-state-smoke.mjs`
- `node scripts/phase10-mission-spec-validator-smoke.mjs`

### Mission Spec

`mission-spec.json` is the contract a model-generated or deterministic mission must satisfy before learner state can change.

Required JSON fields:

```json
{
  "schema_version": 1,
  "mission_id": "usual-place-clarification",
  "world_ref": "world-state.json#daily-life",
  "npc_ref": "friend-1",
  "backlog_item_id": "speaking-clarification",
  "target_skill": "clarification",
  "learner_visible_scene": {
    "title": "The Usual Place",
    "setup": "친구가 이렇게 말했습니다: \"Let's meet at the usual place after work.\"",
    "ask": "어디에서 만나자는 뜻인지 확인하는 영어 질문을 한 문장으로 해보세요.",
    "example": "Which place do you mean?"
  },
  "required_learner_action": "Ask one clarification question before answering.",
  "transfer_test": "Can you ask what the other person means?",
  "win_condition": {
    "type": "speaking_transfer_test",
    "must_pass_backlog_item": "speaking-clarification"
  },
  "story_consequence": {
    "on_pass": "The friend names the meeting place.",
    "on_needs_review": "The friend gives a simpler hint and asks you to try again."
  },
  "real_world_transfer_target": ["planning conversation", "meeting arrangement"],
  "fallback_mode": "light",
  "capability_requirements": {
    "required": ["text"],
    "optional": ["image", "voice"]
  },
  "claim_boundary": "This mission can record local transfer evidence only. Narrative immersion is not proof of fluency."
}
```

Validator rules:

- `backlog_item_id` is required.
- `target_skill` must match the linked backlog item.
- `win_condition.must_pass_backlog_item` must equal `backlog_item_id`.
- `real_world_transfer_target` must be non-empty and practical.
- `fallback_mode` must be `light` or `rich`.
- `capability_requirements.required` must include `text`.
- generated media may be optional only.
- story consequence may be written only after learner output.
- claim boundary must reject fluency/engagement/immersion claims.

### World State

`world-state.json` stores minimal story continuity. M10 allows one active arc and one NPC only.

Required JSON fields:

```json
{
  "schema_version": 1,
  "world_id": "daily-life",
  "taste_tags": ["low-pressure", "daily-life", "practical"],
  "level_band": "beginner|lower-intermediate|intermediate|advanced",
  "current_arc": {
    "id": "first-week",
    "summary": "Practice small real-life interactions without heavy lore."
  },
  "npc_canon": [
    {
      "id": "friend-1",
      "name": "a friend",
      "role": "low-pressure conversation partner",
      "memory": ["prefers clear meeting plans"]
    }
  ],
  "safety_constraints": {
    "child_mode": false,
    "avoid_topics": ["sexual content", "graphic violence", "public ranking"],
    "max_lore_sentences_before_output": 2
  },
  "updated_at": "ISO-8601"
}
```

Validator rules:

- M10 must reject more than one NPC.
- M10 must reject child mode.
- `max_lore_sentences_before_output` must be 2 or less.
- world state may shape scene tone but may not override learning policy, privacy policy, or claim boundaries.

### Tool Capabilities

`tool-capabilities.json` records what the current Codex surface can safely use.

Required JSON fields:

```json
{
  "schema_version": 1,
  "generated_at": "ISO-8601",
  "cost_mode": "light|rich|cinematic",
  "capabilities": {
    "text": true,
    "image_generation": false,
    "image_input": false,
    "voice_transcript": false,
    "realtime_voice": false,
    "web_search": false,
    "browser": false,
    "mcp": false
  },
  "fallback": {
    "default_mode": "light",
    "text_scene_card_required": true
  },
  "claim_boundary": "Capabilities route mission presentation only. Missing tools must not block text-first learning evidence."
}
```

Validator rules:

- `text` must be true.
- `text_scene_card_required` must be true.
- `realtime_voice` must not be required in M10.
- mission generation may read capabilities, but external content may not modify learner-state policy.

## Contract Rule

The dashboard may not claim learning progress from a field unless that field has:

- a schema,
- a write path,
- a validation check,
- and at least one fixture proving the semantics.
