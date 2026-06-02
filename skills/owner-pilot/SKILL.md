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

Before asking the next learner-facing card, you may generate the local next-card artifact internally:

```bash
node scripts/english-learning-harness.mjs pilot-next --json
```

This refreshes the learner cockpit and writes a local `artifacts/pilot/pilot-next-card.html` card. Use it as a product-surface aid, but do not ask the learner to run the command.
Prefer the returned `assistantPrompt.text` as the exact learner-facing prompt. It is Korean-first, asks for one English sentence, and avoids command/issue/audit language. If the learner chooses one of `quickReplies`, save it internally with `pilot-reply --quick-reply "<id-or-number>" --json` rather than asking them to retype the full sentence.

After the learner answers the current card, prefer the automatic reply router internally:

```bash
node scripts/english-learning-harness.mjs pilot-reply --say "<learner answer>" --json
```

If the learner picks a quick reply, use:

```bash
node scripts/english-learning-harness.mjs pilot-reply --quick-reply "1" --json
```

If the answer belongs to a daily pilot card and the learner mentioned a friction point, add `--friction-note "<short note>"`. The router reads current pilot state and saves the answer to the next baseline, daily, or final card. Do not ask the learner to choose a phase, card id, or day number.

After saving, the router refreshes cockpit, the next local `pilot-next-card.html`, and a latest `pilot-reply-card.html` saved-reply surface. Use the returned `learnerFacing` object to summarize what was saved, show the learner-safe recast/next phrase after daily cards, and ask the next card from `learnerFacing.nextCard` when continuing immediately.

## Pilot Phases

### Day 0 Baseline

Use `pilot-status --json` internally. If the pilot has no baseline, ask the five Day 0 mission cards one at a time.

Learner-facing opening:

```text
오늘은 테스트가 아니라 현재 말하기 상태를 찍는 3분 스냅샷이에요.
한 문장씩만 답하면 됩니다. 틀려도 그대로 좋은 데이터예요.
첫 질문: 친구가 "오늘 뭐 했어?"라고 물었다고 생각하고, 오늘 실제로 한 일을 영어로 한 문장만 말해보세요.
```

After each Day 0 answer, persist internally through the automatic router:

```bash
node scripts/english-learning-harness.mjs pilot-reply --say "<answer>" --json
```

The fifth captured card automatically commits the Day 0 baseline through the pilot engine. If the learner gives a comfort rating, include `--comfort-rating "<0-5>"` on the latest capture.

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
