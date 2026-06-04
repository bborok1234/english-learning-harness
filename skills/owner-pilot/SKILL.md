---
name: english-owner-pilot
description: Run the real owner/self AIOS pilot inside Codex conversation. Use when the user wants to start, continue, or finish the five-day English Learning Harness pilot.
---

# English Owner Pilot

Run the owner/self pilot as a learner-facing Codex conversation, not as a command-line task.

## Contract

- Treat Codex conversation as the product surface.
- Do not ask the learner to run `node`, inspect files, open issues, or fill rubric fields.
- Use Korean-first guidance and ask for one short English answer at a time.
- Keep the participant identity generic unless the learner explicitly asks to store a name.
- Keep pilot data local by default. Do not post transcripts or friction notes publicly without explicit review.
- The launch/next-card preview must not save a learner answer or mark consent. The first actual saved pilot answer records local-only consent metadata in `pilot-state.json`.
- A real pilot is not complete until actual learner transcript evidence exists for Day 0, at least five daily sessions, and the final sample.
- Fixture smokes prove mechanics only. Never close or claim the real pilot from fixture data.
- Do not promise fluency, retention, realtime voice efficacy, generated-media gains, or real-world speaking ability.

## Engine Discovery

When persistence is needed, find the local engine in this order:

1. `ENGLISH_LEARNING_HARNESS_REPO`
2. `~/.english-learning-harness/repo`
3. `repoRoot` in `~/.english-learning-harness/install.json`
4. current workspace when `scripts/english-learning-harness.mjs` exists

Use that engine yourself. Do not hand the command to the learner.

Before asking the learner to answer the real pilot, generate the launch card internally:

```bash
node scripts/english-learning-harness.mjs pilot-launch --json
```

Use this as the safest start/resume surface. It shows current progress, the next learner prompt, quick replies, privacy, and what will be saved after the learner answers. It must not save a new answer or mark consent by itself.

Before asking the next learner-facing card directly, generate the local next-card artifact internally:

```bash
node scripts/english-learning-harness.mjs pilot-next --json
```

This refreshes the learner cockpit and writes a local next-card artifact. Use it as a product-surface aid, but do not ask the learner to run the command.
Use the returned `assistantPrompt.text` as the default learner-facing prompt. It is Korean-first, asks for one English sentence, and avoids command/issue/audit language. If the fresh Day 0 card includes `scene_choices`, show the learner the choices in plain Korean and let them answer with a number or one English sentence.

If the learner chooses one of `quickReplies`, save it internally with `pilot-reply --quick-reply "<id-or-number>" --json` rather than asking them to retype the full sentence.

After the learner answers the current card, prefer the automatic reply router internally:

```bash
node scripts/english-learning-harness.mjs pilot-reply --say "<learner answer>" --json
```

If the learner picks a quick reply, use:

```bash
node scripts/english-learning-harness.mjs pilot-reply --quick-reply "1" --json
```

If the answer belongs to a daily pilot card and the learner mentioned a friction point, add `--friction-note "<short note>"`. The router reads current pilot state and saves the answer to the next baseline, daily, or final card. The first saved answer records local-only consent metadata. Do not ask the learner to choose a phase, card id, or day number.

After saving, the router refreshes cockpit, the next local `pilot-next-card.html`, and a latest `pilot-reply-card.html` saved-reply surface. Use the returned `learnerFacing` object to summarize what was saved, show the learner-safe recast/next phrase after daily cards, and ask the next card from `learnerFacing.nextCard` when continuing immediately.

## Pilot Phases

### Day 0 Baseline

Use `pilot-next --json` internally. If the pilot has no baseline, start with the generated `첫 장면 고르기` card instead of hard-coding a project, repository, or workday question.

Learner-facing opening:

```text
오늘은 테스트가 아니라 현재 말하기 상태를 찍는 3분 스냅샷이에요.
먼저 말하고 싶은 작은 장면을 하나 고르거나, 바로 영어 한 문장만 보내면 됩니다.
틀린 문장도 그대로 좋은 기준점이에요.

1. 일상 장면
2. 작은 모험
3. 편한 공간
```

If the learner answers `1`, `2`, `3`, or a quick-reply id, persist that selected sentence through `pilot-reply --quick-reply`. If they type their own English sentence, persist it through `pilot-reply --say`.

After each Day 0 answer, persist internally through the automatic router:

```bash
node scripts/english-learning-harness.mjs pilot-reply --say "<answer>" --json
```

After the first scene chooser answer, continue with the next generated Day 0 card from `pilot-next`/`learnerFacing.nextCard`. The fifth captured card automatically commits the Day 0 baseline through the pilot engine. If the learner gives a comfort rating, include `--comfort-rating "<0-5>"` on the latest capture.

### Daily Pilot Day

Use `pilot-status --json` internally. If the baseline exists and fewer than five daily sessions are complete, ask the next daily prompt conversationally.

After collecting the learner answer and one short friction note, persist internally:

```bash
node scripts/english-learning-harness.mjs pilot-reply --say "<learner answer>" --friction-note "<short note>" --json
```

The engine should update mission, scene, asset deck, learner report, cockpit, session evidence, and the day's next asset action. Summarize this in learner language without exposing commands.

### Final Sample

When five daily sessions exist, ask the Day 7 snapshot cards one at a time. After each final answer, persist internally:

```bash
node scripts/english-learning-harness.mjs pilot-reply --say "<answer>" --json
```

The fifth captured final card automatically commits the final sample through the pilot engine. If the learner gives a comfort rating, include `--comfort-rating "<0-5>"` on the latest capture.

Then summarize:

- what the learner communicated more easily,
- what still caused friction,
- whether the product decision is continue, research, pivot, kill_claim, or invalid,
- where the local learner report and cockpit were updated.

## Learner-Facing Rules

- Ask only one card at a time.
- If a learner-facing next-card artifact exists, use it to keep the prompt short and concrete.
- For a fresh Day 0 start, present the generated scene chooser and quick replies before asking for a free-form answer.
- Avoid meta labels like "baseline", "rubric", "artifact bridge", or "product_journey_audit" in the learner prompt.
- Do not expose `pilot-next`, `pilot-reply`, `pilot-capture`, `pilot-start`, `pilot-day`, or `pilot-finish` unless the user explicitly asks for maintainer/debug details.
- If tool execution fails, continue the conversation and say durable saving was not confirmed.
- If the user wants to stop early, save nothing extra unless they already answered a pilot prompt; then explain what was or was not saved.

## Output Shape

After a saved pilot day:

```text
오늘 남긴 말하기 증거:
자연스럽게 바꾸면:
다음에 이어갈 작은 행동:
오늘 마찰 메모:
로컬 cockpit/report 갱신 여부:
```

Prefer fields from `pilot-reply --json`:

- `learnerFacing.communicated`
- `learnerFacing.recast`
- `learnerFacing.nextPhrase`
- `learnerFacing.nextFocus`
- `learnerFacing.nextCard`
- `replyCardArtifact.url`
