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

## Flow

1. Read the available profile/progress context from the session prompt or hook-injected context.
2. Offer one easy opening question.
3. Continue for 3-5 turns.
4. End with a mini mirror:
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
