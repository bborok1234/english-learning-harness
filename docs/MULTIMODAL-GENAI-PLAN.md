# Multimodal GenAI Pedagogy Plan

Last updated: 2026-05-27
Status: Active planning contract

## Thesis

Multimodal GenAI should not be a feature layer.

It should turn English Learning Harness from a text tutor into an **interaction laboratory** where the learner repeatedly practices the real work of conversation:

- forming an intention,
- producing imperfect output,
- noticing a gap,
- negotiating meaning,
- repairing breakdown,
- reusing the improved expression in a new context,
- and seeing the journey persist locally.

The product shift is:

```text
old language app: content -> quiz -> score
AI-native harness: situation -> intention -> speech act -> trouble source -> scaffold -> retry -> transfer
```

## Academic And Pedagogical Anchors

### Pushed Output

Swain's Output Hypothesis argues that producing language can force learners to notice gaps between intended meaning and available language, then modify output. The harness should use GenAI to create safe moments where the learner must try, fail lightly, and retry.

Product implication:

- do not give the answer first;
- detect the learner's intended meaning;
- ask for a modified retry;
- store the retry as learning evidence.

Source:

- Swain, "Problems in Output and the Cognitive Processes They Generate": https://academic.oup.com/applij/article/16/3/371/184113

### Interaction And Negotiation Of Meaning

Interaction Hypothesis work emphasizes comprehensible input, feedback, modified output, and negotiation of meaning. GenAI should create information gaps, misunderstanding, clarification requests, and repair opportunities, not just free chat.

Product implication:

- image/video scenarios should contain missing or ambiguous information;
- the AI should sometimes ask for clarification;
- learner success is "kept the interaction alive", not "grammar score".

Sources:

- Interaction hypothesis overview: https://files.eric.ed.gov/fulltext/ED507194.pdf
- CEFR Companion Volume: https://www.coe.int/en/web/common-european-framework-reference-languages/cefr-companion-volume-and-its-language-versions

### Dynamic Assessment And ZPD

Sociocultural/dynamic assessment treats assistance as part of diagnosis. The tutor should adapt hints from implicit to explicit and record what level of mediation the learner needed.

Product implication:

- hint ladder is data, not just help text;
- progress includes "needed less help for the same speech act";
- AI becomes a calibrated mediator, not an answer machine.

Source:

- Lantolf and Poehner dynamic assessment overview: https://www.cambridge.org/core/books/sociocultural-theory-and-the-pedagogical-imperative-in-l2-education/04C9D0603D313676C99FB7F4D65F125B

### Conversation Analysis And Repair

Real conversation depends on turn-taking, self-repair, other-initiated repair, backchannels, and maintaining intersubjectivity. The product should train interactional competence, not only sentence correctness.

Product implication:

- track trouble sources: missing word, wrong tense, unclear reference, no response, overlong pause;
- train repair sequences such as "I mean...", "Let me rephrase", "Do you mean...?";
- voice/realtime work should evaluate timing and repair, not native accent.

Sources:

- Self-initiated self-repair case study: https://www.tandfonline.com/doi/abs/10.1080/00313830902757550
- Conversation analysis repair in L2 interaction: https://pmc.ncbi.nlm.nih.gov/articles/PMC9466649/

### Multimodal And Embodied Learning

Conversation is not only text. Learners use scenes, gesture, gaze, objects, sound, timing, and shared attention. Multimedia can help when it reduces abstraction and creates situated meaning, but it can also distract if it becomes decorative.

Product implication:

- images and videos must create situated speech tasks;
- gestures, pointing language, spatial description, and context words should become practice targets;
- generated media must be close to the speech act and saved as context evidence.

Sources:

- Gesture in L2 speaking tasks via videoconferencing: https://www.sciencedirect.com/science/article/pii/S0346251X17306851
- Gesture and foreign-language vocabulary systematic review/meta-analysis: https://pmc.ncbi.nlm.nih.gov/articles/PMC10669578/
- Mayer multimedia learning principles overview: https://services.dartmouth.edu/TDClient/1806/Portal/KB/Article/171655/Mayer-s-12-Principles-of-Multimedia-Learning

## AI-Native Design Primitive: Interaction Event Graph

Every session should create an event graph, not just a transcript.

```json
{
  "event_id": "session-turn-id",
  "modality": "voice|text|image|video|realtime",
  "scenario_id": "meeting-follow-up",
  "learner_intent": "suggest a smaller launch",
  "learner_output": "I think we can try smaller launch first",
  "trouble_source": "missing article / unnatural collocation",
  "mediation_level": "prompt-first",
  "repair_move": "Try again with 'start with'",
  "retry_output": "I think we can start with a smaller launch",
  "saved_phrase": "start with a smaller launch",
  "transfer_targets": ["planning meeting", "friend recommendation", "travel plan"]
}
```

This is the core AI-native move. Audio, images, and videos become evidence attached to a speech act, not disconnected media files.

## Modality Roles

### Voice: Prosody, Timing, Repair, And Memory

Voice is not just "speech input".

Use voice to train:

- pause tolerance,
- turn-taking timing,
- backchanneling,
- self-repair,
- speech rate control,
- confidence after a failed first attempt.

First implementation:

- transcription-first audio capture;
- store transcript plus optional audio artifact;
- detect long pauses manually or from timestamps when available;
- ask one retry;
- compare first attempt and retry.

Later realtime implementation:

- live interruption practice,
- delayed response recovery,
- "say it again but shorter" pressure,
- backchannel timing drills,
- shadowing and A/B replay.

Do not:

- score accent like a native-speaker ranking;
- make pronunciation the main product;
- let realtime voice bypass local memory.

OpenAI references:

- Voice agents: https://platform.openai.com/docs/guides/voice-agents
- Speech to text: https://platform.openai.com/docs/guides/speech-to-text
- Realtime API: https://platform.openai.com/docs/guides/realtime

### Image Input: Real-Life Information Gap

User images should create information-gap speaking tasks.

Patterns:

- **Describe so I can reconstruct**: learner describes an image; AI asks for missing spatial/detail information.
- **Pointing language drill**: this/that, left/right, in front of, behind, next to.
- **Word-search repair**: learner lacks a word, uses "I don't know the word, but...".
- **Personal scene curriculum**: learner's real photos create recurring topics and phrases.

Learning value:

- real context lowers prompt fatigue;
- visual reference anchors vocabulary;
- describing the same image later measures fluency and lexical reuse.

### Image Generation: Scenario Compiler

Generated images should compile abstract curriculum into concrete social situations.

Patterns:

- **Scenario card**: "coworker asks unexpected follow-up after your idea".
- **Ambiguity card**: generated scene intentionally includes an unclear detail requiring clarification.
- **Memory anchor**: phrase gets a small visual anchor for spaced review.
- **Persona-safe roleplay setting**: low-pressure scene for anxious learners before live speech.

Generation is allowed only when:

- it is tied to a scenario spec;
- learner output will be captured;
- the artifact links to the journal;
- dashboard labels it as prompt material, not proof of learning.

OpenAI reference:

- Image generation: https://platform.openai.com/docs/guides/image-generation

### Video: Situated Turn-Taking Simulator

Video is not a daily gimmick. It is for practicing timing and response to unfolding context.

Patterns:

- **Pause-and-respond**: video stops at a social cue; learner responds.
- **Predict the next turn**: learner predicts what someone might say, then answers.
- **Role switch**: learner first watches, then replays as one participant.
- **Before/after replay**: same scenario after a week, with improved phrase reuse.

Learning value:

- trains listening-to-speaking transition;
- makes turn-taking and timing visible;
- creates richer transfer than static prompts.

Constraints:

- short clips only;
- async generation;
- learner response is the learning evidence, not the clip;
- cost/latency visible;
- no real-person imitation or unsafe synthetic identity use.

OpenAI reference:

- Video generation: https://platform.openai.com/docs/guides/video-generation

## Product Loops

### Loop A — Multimodal Pushed Output

1. Harness presents a situation through text, image, voice, or video.
2. Learner states an intention.
3. Learner speaks an imperfect first attempt.
4. AI detects the gap between intent and output.
5. AI gives the least intrusive mediation.
6. Learner retries.
7. Harness stores first attempt, mediation, retry, and transfer phrase.

### Loop B — Negotiated Meaning

1. AI creates or selects an information gap.
2. Learner asks or answers a clarification question.
3. AI introduces a small misunderstanding.
4. Learner repairs meaning.
5. Harness marks interactional skill evidence.

### Loop C — Transfer Across Modalities

1. Phrase first appears in a text session.
2. Learner reuses it in voice.
3. Learner uses it to describe an image.
4. Learner uses it in a video response.
5. Harness treats cross-modal reuse as stronger evidence than one-time recall.

## Implementation Stages

### M1 — Interaction Event Schema

Done when:

- every session artifact can store intent, output, trouble source, mediation, retry, saved phrase, and transfer target;
- dashboard can show "why this helped speaking";
- no modality can write unsupported learning claims.

### M2 — Transcription-First Voice With Retry

Done when:

- one command accepts audio input;
- speech-to-text returns transcript;
- transcript flows through daily session policy;
- retry is captured;
- first attempt and retry are saved as an event pair.

### M3 — Image Input Information Gap

Done when:

- user can attach/select an image;
- harness generates a description/clarification task;
- AI asks at least one information-gap follow-up;
- fixture proves visual vocabulary is personal and not generic spam.

### M4 — Generated Scenario Cards

Done when:

- image generation compiles scenario specs into cards;
- cards include hidden communicative pressure;
- learner output is tied to the card;
- review queue can resurface the same phrase without requiring the same image.

### M5 — Realtime Conversation Lab

Done when:

- low-latency turn-taking works in a supported runtime;
- transcript or memory summary persists locally;
- interruption, backchannel, and delayed-response recovery are tested;
- anxious learner fixture passes without overcorrection.

### M6 — Video Turn-Taking Simulator

Done when:

- clips are short, optional, and scenario-bound;
- pause-and-respond flow works;
- learner response is captured as the learning evidence;
- cost/latency/safety constraints are visible.

## Non-Goals

- Do not make generated media the reward loop.
- Do not use avatars as a substitute for tutor quality.
- Do not score learners against native speakers.
- Do not claim pronunciation accuracy from noisy signals.
- Do not ship realtime voice before transcript persistence and tutor policy are stable.

