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
- When the learner has answered at least one practice prompt, prefer the agent-operated `practice` engine path so Codex refreshes the mission, session artifact, weekly mirror, learner report, and cockpit together.
- Do not paste internal engine commands into the learner-facing answer unless the learner explicitly asks for maintainer/debug details.
- Never expose rubric labels such as "clarification question I can ask" as the learner prompt.
- Do not make the first practice prompt about this repository, handoff documents, coding, or project planning unless the learner asks for that topic.
- First-use prompts should be concrete everyday scenes such as today, food, commute, cafe, office, or asking what someone means.
- Vary first-use scenes across concrete domains over time. Good defaults include cafe ordering repair, office clarification, nearby object description, lunch preference disagreement, commute timing, and daily comfort check-ins.

## Engine Discovery

When persistence is needed, find the local engine in this order:

1. `ENGLISH_LEARNING_HARNESS_REPO`
2. `~/.english-learning-harness/repo`
3. `repoRoot` in `~/.english-learning-harness/install.json`
4. current workspace when `scripts/english-learning-harness.mjs` exists

Use that engine yourself. Do not hand the command to the learner.

## Agent-Operated Persistence

Before asking the first learner-facing daily prompt, prefer generating the local start card internally:

```bash
node scripts/english-learning-harness.mjs practice-next --json
```

Use the returned `assistantPrompt.text` as the default learner-facing prompt. It should expose a concrete daily scene, one-sentence answer rule, quick replies, and the current cockpit link without showing engine commands. If the learner chooses a quick reply by number, treat that selected English sentence as the learner answer and persist it through the `practice` engine path yourself.

After collecting the learner's answer(s), call the local engine internally:

```bash
node scripts/english-learning-harness.mjs practice --say "<learner answer>" --json
```

Use multiple `--say` values when the learner gave several turns. This command is for Codex/tool use, not for the learner to type. It should update:

- generated daily mission artifact,
- learner-ready daily practice start card,
- persisted session evidence,
- weekly mirror,
- 7-day/30-day learner report,
- personal cockpit.

## Flow

1. Read the available profile/progress context from the session prompt or hook-injected context.
2. If no speaking backlog exists and the learner gives a sample, diagnose one speaking skill need.
3. Generate or use today's mission as the hidden structure, but ask the learner one concrete question at a time.
4. If a backlog item exists, make today's scenario target that item instead of drifting into generic chat.
5. Continue for 3-5 turns.
6. Ask for one transfer attempt tied to the backlog item.
7. Run the agent-operated persistence path internally.
8. End with a mini mirror:
   - one thing the learner successfully communicated,
   - one natural recast,
   - one tiny next phrase,
   - a short note that today's local report/cockpit were updated when persistence succeeded.

## Learner-Facing Transcript Shape

The learner-facing transcript should look like a short tutoring exchange:

```text
Codex: 오늘은 한 문장만 해볼게요. 친구가 "usual place"라고 했는데 장소가 애매합니다. 영어로 어디를 말하는지 한 번만 물어보세요.
Learner: Which place do you mean?
Codex: 좋아요. 자연스럽게는 "Which place do you mean?" 그대로 쓸 수 있어요. 한 번 더, 조금 천천히 말해볼게요.
Learner: Which place do you mean?
Codex: 오늘 전달한 것: 애매한 장소를 확인했어요.
Codex: 자연스럽게 바꾸면: Which place do you mean?
Codex: 다음에 써볼 한 문장: Could you tell me which place you mean?
```

The transcript must not ask the learner to run commands, inspect files, open GitHub issues, or fill internal evaluation fields.

## First-Use Variant Coverage

The first-use experience should not collapse into one repeated "usual place" prompt. Across local fixtures and real sessions, keep these variants available:

- clarification: ask what an unclear everyday phrase means.
- repair: recover when the learner does not know a word.
- description: describe a visible place or object in simple concrete language.
- soft disagreement: express a small preference or boundary politely.
- comfort/status: say a simple current state and one reason.

Each variant still ends in the same mini mirror shape and uses the agent-operated persistence path after the learner answers.

## Metrics To Record

The Stop/update path may update only these MVP session metrics:

- `attendance`
- `english_word_ratio`
- `new_vocabulary_count`
- `utterance_word_count`
- `voluntary_speaking_seconds`
