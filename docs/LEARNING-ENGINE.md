# English Learning Harness Learning Engine

Last updated: 2026-05-27
Status: Active planning contract

## Ambition

This project is not a script that writes a journal.

The product goal is a daily AI language-learning companion that a Korean adult can use for months, with enough instructional design, emotional safety, feedback, memory, and progression to plausibly improve real English conversational ability.

The first serious product claim is:

> A learner who uses this harness most days should speak more voluntarily, recover faster from freezes, reuse more personal vocabulary, and handle familiar everyday interactions with less avoidance.

Do not claim native fluency, exam improvement, or guaranteed real-person confidence transfer without longitudinal evidence.

## Research Anchors

### Balanced Language Work

Paul Nation's "four strands" framework is a useful curriculum guardrail: a balanced program needs meaning-focused input, meaning-focused output, language-focused learning, and fluency development. The harness should not become only chatbot output practice.

Product implication:

- Daily session: meaning-focused output plus fluency.
- Mini lesson: language-focused learning.
- Review queue: retrieval and fluency.
- Listening/reading prompt: meaning-focused input.

Source:
- Paul Nation, "The Four Strands": https://citeseerx.ist.psu.edu/document?doi=66f0c29e6e3f9a63cb617c2de14aa7cfb97a8306&repid=rep1&type=pdf

### Online Interaction And Real-World Agency

CEFR Companion Volume treats online interaction as a distinct, real-world communication mode involving spoken/written, synchronous/asynchronous, and multimodal interaction. A text/transcription-first harness can still be valid if it trains interaction, repair, clarification, and spontaneous response.

Product implication:

- Track interaction behaviors, not just word counts.
- Practice repair phrases, clarification, turn-taking, and response latency.
- Build tasks around real user situations, not isolated grammar drills.

Source:
- Council of Europe CEFR online interaction: https://www.coe.int/en/web/common-european-framework-reference-languages/online-interaction

### Feedback Without Killing Conversation

Corrective feedback matters, but explicit interruption can reduce flow and confidence for anxious learners. The product should use implicit recasts during conversation and delayed explicit feedback after the task unless the learner asks for correction.

Product implication:

- During conversation: recast naturally, keep the turn moving.
- After conversation: show one pattern, one phrase, one tiny drill.
- Never dump many corrections after a short session.

Sources:
- Systematic review on corrective feedback timing: https://pmc.ncbi.nlm.nih.gov/articles/PMC9995700/
- AI Twin ESL paper on implicit rephrasing and emotional engagement: https://arxiv.org/abs/2601.11103

### Scenario-Based Dialogue

LLM-based language learning is strongest when open-ended conversation is bounded by scenario tasks. Open chat alone is too diffuse; scripted drills alone are too brittle.

Product implication:

- Each day should have a tiny task: order, explain, ask, refuse, describe, recover, clarify.
- Session content should be personalized from the learner's life and vocabulary.
- Evaluation should include human/user-facing judgment eventually; automatic metrics alone are not enough.

Source:
- "Large Language Model based Situational Dialogues for Second Language Learning": https://arxiv.org/abs/2403.20005

### Voice Architecture

OpenAI's current voice guidance separates speech-to-speech realtime sessions from chained speech-to-text -> text agent -> text-to-speech pipelines. For this repo's current constraints, chained transcription-first is the safer path because it preserves transcripts, metrics, and deterministic learner data updates.

Product implication:

- Keep Codex plugin/harness text-first now.
- Add push-to-talk transcription as the next voice path, not full realtime voice.
- Treat realtime voice as a separate product surface after the text engine is educationally solid.

Sources:
- OpenAI Voice agents guide: https://developers.openai.com/api/docs/guides/voice-agents
- OpenAI Speech to text guide: https://developers.openai.com/api/docs/guides/speech-to-text

## Learning Model

### Learner State

The harness needs a durable learner model, not just cumulative counters.

Required state:

- profile: motivation, anxiety triggers, correction preference, topics, avoid list.
- baseline: starting comfort, avoidance, response length, repair phrase use.
- vocabulary:
  - known words/phrases,
  - emerging words/phrases,
  - personal phrases,
  - review due dates.
- interaction skills:
  - starts,
  - follow-ups,
  - clarification,
  - repair,
  - refusal/soft disagreement,
  - asking for time.
- recent errors/patterns:
  - max 1-3 active patterns at a time.
- affect:
  - session energy,
  - anxiety rating,
  - confidence note.

### Daily Loop

Target: 5-8 minutes, low shame, one meaningful interaction.

Required phases:

1. Check-in:
   - choose energy level,
   - choose mode: easy / normal / stretch,
   - choose topic or accept recommendation.
2. Warm start:
   - one sentence scaffold,
   - one familiar phrase from memory.
3. Scenario conversation:
   - 3-6 turns,
   - one task goal,
   - recasts only, no lecture.
4. Mini mirror:
   - what was communicated,
   - one natural recast,
   - one pattern,
   - one next phrase.
5. Review scheduling:
   - add useful phrase to review queue,
   - update vocabulary history,
   - update interaction skill evidence.

### Weekly Loop

Target: consolidate, not pressure.

Required outputs:

- "This week you used..." personal phrases.
- "You recovered from..." interaction behaviors.
- One scenario replay with higher fluency.
- One learner-owned goal for next week.

### Monthly Loop

Target: visible self-comparison.

Required outputs:

- first-week vs current sample comparison,
- voluntary speaking seconds trend,
- average utterance length trend,
- repair phrase use,
- vocabulary reuse,
- qualitative comfort note.

## Metric Model

The current five MVP metrics are necessary but insufficient.

### Keep Per Session

- `attendance`
- `english_word_ratio`
- `new_vocabulary_count`
- `utterance_word_count`
- `voluntary_speaking_seconds`

### Fix Immediately

`new_vocabulary_count` must compare against historical vocabulary, not per-session unique tokens. Repeating "I like coffee" twice should not add the same words as new twice.

### Add Product-Grade Evidence

Do not add these as noisy MVP counters until implementation is stable, but design for them now:

- phrase reuse count,
- repair phrase count,
- average response length,
- hesitation/self-repair marker,
- scenario completion,
- learner comfort rating,
- next-day return.

## Product Architecture

### Layer 1: Local Harness Core

Responsibilities:

- learner store,
- profile/baseline,
- daily session orchestration,
- journal/artifact writes,
- progress schema validation,
- review scheduling.

Weekly mirror behavior:

- read only local session artifacts, progress, learner model, vocabulary, and review queue,
- summarize communicated themes, saved phrases, reused phrases, and repair attempts,
- choose one next focus from the lowest local skill evidence or due review phrase,
- avoid level ranking, native-speaker comparison, and guaranteed real-world transfer claims.

### Layer 2: Learning Agent

Responsibilities:

- choose today's scenario,
- conduct turns,
- preserve affective safety,
- provide recasts,
- produce mini mirror,
- generate next review item.

### Layer 3: Delivery Surface

Current:

- repo-local Codex plugin/harness,
- CLI scripts,
- native hook support.

Next:

- explicit command-wrapper fallback as the reliable path,
- optional native hook install after trust-state proof,
- Codex command/skill flow,
- push-to-talk transcription wrapper,
- eventually a non-developer app shell.

### Layer 4: Evaluation

Responsibilities:

- smoke tests,
- persona fixtures,
- longitudinal simulated learners,
- human review rubric,
- real learner diary/retention checks.

## Roadmap Gates

### Gate A — Harness Integrity

The product cannot proceed to learner validation until:

- either explicit command-wrapper fallback works or safe native hook install/merge is proven,
- vocabulary history is correct,
- Stop/finalization claims match actual behavior,
- session output is deterministic enough to test but flexible enough to feel conversational.

### Gate B — Educational Engine

The product cannot claim "improves conversation ability" until:

- scenario task bank exists,
- review queue exists,
- learner model stores vocabulary/interaction skills,
- persona fixtures pass,
- mini mirror is pedagogically consistent.

### Gate C — Daily Usability

The product cannot claim "daily usable" until:

- one-command first-run setup exists,
- failed setup is recoverable,
- learner can run a session without reading implementation docs,
- session output feels low-pressure and useful for all four target personas.

### Gate D — Real Validation

The product cannot claim real learning impact until:

- at least a 7-day target-persona pilot is run,
- learner self-report and behavioral metrics are collected,
- before/after speech samples or transcripts are reviewed,
- dropout/friction reasons are documented.
