---
name: english-daily-session
description: Run the default 5-minute English Learning Harness practice session. Use when the user wants today's English practice, a gentle conversation, or a text/transcription-first daily loop.
---

# English Daily Session

Run a short, safe English contact session with the learner.

## Contract

- Default to text-first or transcription-first interaction.
- Keep correction implicit during the conversation.
- Prefer one gentle follow-up at a time.
- Recast naturally instead of explaining grammar unless the learner asks.
- Keep the learner moving rather than testing them.
- Treat Codex conversation as the learner-facing surface.
- If repository tools are available, run the local session engine yourself to persist practice evidence.
- Do not ask the learner to run `node` commands for ordinary daily practice.
- If persistence cannot be executed, still run the practice and disclose that durable saving was not confirmed.
- Prefer the Speaking Skill OS loop when available: diagnose or read the local speaking backlog, target one backlog item, run the drill, test transfer, and save the evidence.

## Engine Discovery

When persistence is needed, find the local engine in this order:

1. `ENGLISH_LEARNING_HARNESS_REPO`
2. `~/.english-learning-harness/repo`
3. `repoRoot` in `~/.english-learning-harness/install.json`
4. current workspace when `scripts/english-learning-harness.mjs` exists

Use that engine yourself. Do not hand the command to the learner.

## Flow

1. Read the available profile/progress context from the session prompt or hook-injected context.
2. If no speaking backlog exists and the learner gives a sample, diagnose one speaking skill need.
3. If a backlog item exists, make today's scenario target that item instead of drifting into generic chat.
4. Offer one easy opening question.
5. Continue for 3-5 turns.
6. Ask for one transfer attempt tied to the backlog item.
7. End with a mini mirror:
   - one thing the learner successfully communicated,
   - one natural recast,
   - one tiny next phrase.

## Metrics To Record

The Stop/update path may update only these MVP session metrics:

- `attendance`
- `english_word_ratio`
- `new_vocabulary_count`
- `utterance_word_count`
- `voluntary_speaking_seconds`
