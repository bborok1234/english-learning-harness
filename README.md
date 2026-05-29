# English Learning Harness

Open-source, local-first Codex harness that turns Codex into a daily English speaking practice partner.

North star: **AI 파트너와 편안하게 영어로 대화하는 능력.**

This is not a learner-facing Node CLI product. The learner-facing surface is **Codex conversation**: you paste one install prompt into Codex, Codex installs the harness skills, and then your daily English practice happens through natural language.

The first usable version is text/transcription-first. Realtime voice conversation is not the default path yet because the current local Codex CLI does not expose a stable realtime voice command.

## Paste This Into Codex

Open Codex and paste this:

```text
Install English Learning Harness from:
https://github.com/bborok1234/english-learning-harness

Use the repo setup script to install the Codex skills, then start my first 5-minute English speaking practice.
Do not ask me to clone the repo or run Node commands manually. You operate the harness and local engine for me.

My name is Jieun.
I freeze when I need to speak English.
I want gentle corrections and practical phrases I can reuse.
```

Codex should install the skill surface, handle setup, run practice, save local progress, and finish with a mini mirror. The ordinary learner action is to answer Codex in English, not to operate scripts.

If you are already inside a checked-out copy of this repo, paste this shorter prompt:

```text
Use this repository as my English Learning Harness.
Install its Codex skills if needed, then run today's 5-minute practice.
Keep me in conversation; use the local engine internally when you need to save progress.
```

## Try These Prompts

Use the harness by talking to Codex:

```text
오늘 5분 영어 회화 연습 시작하자. 너무 어렵게 하지 말고 한 질문씩 해줘.
```

```text
어제 내가 틀렸던 표현을 하나만 다시 연습시켜줘.
```

```text
카페에서 주문하는 상황으로 연습하자. 내가 막히면 쓸 수 있는 rescue phrase도 줘.
```

```text
방금 연습한 걸 mini mirror로 정리해줘. 내가 실제로 다음에 써볼 한 문장만 남겨줘.
```

```text
이번 주 내 영어 회화 진행 상황을 보여줘. 좋아진 점, 반복되는 막힘, 다음 focus를 알려줘.
```

## What Codex Does For You

When the harness is used correctly, Codex is the tutor and operator:

- starts or refreshes your learner profile
- asks one low-pressure question at a time
- keeps correction gentle while you are speaking
- saves session evidence locally
- remembers useful phrases and repair attempts
- suggests due review and next scenarios
- generates a mini mirror after practice
- generates a weekly mirror from local evidence
- can create a local learner home page for your journey

The scripts in this repo are the engine underneath that experience. They are for Codex, maintainers, setup, and verification. They are not the product surface a learner should have to operate by hand.

## Who This Is For

- Learners who can read some English but freeze when they need to speak.
- Korean speakers or other EFL learners who want low-pressure daily output practice.
- Codex users curious whether an agent can become a focused language-learning harness instead of a generic chatbot.
- Builders who want to inspect, fork, and improve an open-source AI-native learning loop.

This is not a course catalog, a streak app, or a generic chat UI. It is a local practice harness that helps you produce English, keep the useful pieces, and return tomorrow with context.

## The Daily Learning Loop

The harness is built around a small daily loop:

1. Codex checks your local learner memory and suggests today's focus.
2. You answer a short, spoken-style prompt in English.
3. Codex gives one gentle follow-up at a time.
4. Codex ends with a mini mirror: what you communicated, one natural recast, one next phrase.
5. Useful phrases and recurring trouble spots come back in later review.
6. A weekly mirror shows the larger pattern of your practice.

The learning target is not "perfect English today." The target is more comfortable output: starting faster, repairing mistakes, asking follow-up questions, reusing phrases, and seeing your own progress from evidence.

## How It Helps Conversation

- **Low-stakes output reps:** short sessions make it easy to speak or type imperfect English without waiting for a class.
- **Gentle correction:** the tutor policy favors recasts, repair prompts, and next attempts instead of overwhelming grammar dumps.
- **Personal phrase memory:** useful phrases and repaired patterns become review material.
- **Scenario practice:** Codex suggests daily scenarios based on your learner model and history.
- **Mini mirrors:** every session produces a concise reflection so you can see what improved and what to try next.
- **Weekly mirrors:** the weekly view turns isolated sessions into a learning journey.
- **Multimodal-ready evidence:** text, transcript-backed voice, and image information-gap events share a common interaction-event shape.

## What Gets Tracked

Learner-owned files live locally by default:

```text
~/english-learning/
├── profile.md
├── progress.json
├── learner-model.json
├── vocabulary.json
├── review-queue.json
├── home.html
├── journal/
└── artifacts/
    ├── sessions/
    └── weekly/
```

Tracked evidence includes:

- profile and motivation
- session count, date, and MVP progress metrics
- journal entries and session artifacts
- vocabulary and phrase history
- review queue state
- learner model signals
- weekly mirror summaries
- local validation exports

## What You Should Feel After The First Session

After one Codex-led session, you should have:

- a learner profile under your local learner root
- a saved practice artifact
- a progress file with updated session metrics
- a mini mirror describing the session
- a next practice suggestion
- optional local `home.html` journey view

The experience should feel like: speak or type a little, get a useful mirror, keep the phrase, return tomorrow.

## Privacy And Local Data

The default learning state is local to your machine under `~/english-learning/`. Source media paths are treated as local-only in exported validation packs.

Do not put private learner journals, audio, transcripts, or personal details in GitHub issues unless you intentionally redact and share them.

## Current Boundaries

- Realtime voice conversation is not claimed as the default path yet.
- Accent scoring is not implemented.
- Image practice stores local prompt context and learner output; it does not perform full computer-vision tutoring by itself.
- Public Git-backed install remains unverified and should not be documented as the default install path yet.
- Long-term real learner improvement still needs real multi-day human use, not only fixture smokes.

## Codex Skill Surface

This repository ships Codex skill instructions for:

- `english-onboarding`
- `english-daily-session`
- `english-mini-mirror`
- `english-picture-description`

The skill contract is: keep the learner in conversation, use the local engine internally for durable state when available, and do not turn ordinary learning into a command-line chore.

The setup script installs these skills into Codex:

```text
~/.codex/skills/english-learning-onboarding
~/.codex/skills/english-learning-daily-session
~/.codex/skills/english-learning-mini-mirror
~/.codex/skills/english-learning-picture-description
```

## Agent Install Details

The install prompt above should lead Codex to run the equivalent of:

```bash
mkdir -p ~/.english-learning-harness
git clone --single-branch --depth 1 https://github.com/bborok1234/english-learning-harness.git ~/.english-learning-harness/repo
~/.english-learning-harness/repo/setup --host codex
```

If the repo already exists, Codex should update it instead of cloning a second copy:

```bash
cd ~/.english-learning-harness/repo
git pull --ff-only
./setup --host codex
```

This is an agent-operated install path. A learner should not need to type it.

## Internal Engine For Maintainers

The command wrapper is the local persistence and verification engine. It is useful for maintainers, smoke tests, and debugging. It is not the intended learner-facing product surface.

For testing or a separate learner, set `ENGLISH_LEARNING_HOME` or pass `--learner-root`.

Internal setup and practice commands:

```bash
node scripts/english-learning-harness.mjs setup
node scripts/english-learning-harness.mjs daily --json
node scripts/english-learning-harness.mjs today --say "I want to practice today." --json
node scripts/english-learning-harness.mjs weekly --json
node scripts/english-learning-harness.mjs home --json
node scripts/english-learning-harness.mjs export --json
```

Run from a transcript file:

```bash
node scripts/english-learning-harness.mjs today --transcript path/to/transcript.txt
```

Import transcription-first voice practice:

```bash
node scripts/english-learning-harness.mjs voice \
  --transcript path/to/voice-transcript.txt \
  --audio-file path/to/local-audio.wav \
  --json
```

Run an image information-gap practice from a local image path:

```bash
node scripts/english-learning-harness.mjs image \
  --image-file path/to/local-image.png \
  --hidden-detail "the wallet is partly hidden near the cup" \
  --clarification-prompt "Where is the wallet compared with the cup?" \
  --say "The cup is on the left." \
  --json
```

Review due personal phrases:

```bash
node scripts/english-learning-harness.mjs review --json
node scripts/english-learning-harness.mjs review \
  --review-id phrase-i-like-drinking-coffee \
  --result success
```

Open the phrase vault and weekly mirror:

```bash
node scripts/english-learning-harness.mjs vault --json
node scripts/english-learning-harness.mjs weekly --json
```

Check health and status:

```bash
node scripts/english-learning-harness.mjs health --json
node scripts/english-learning-harness.mjs status --json
node scripts/validate-progress.mjs ~/english-learning/progress.json
```

## Native Codex Hooks

Native hooks are optional and not required for the learner-facing Codex conversation path.

P0-2 did not prove automatic plugin-scoped hook execution for this plugin, and PH1-FIX-1 found Codex hook trust-state limitations. Use native hooks only after accepting that hook trust-state may require manual intervention in the local Codex environment.

Stop hook contract: the Stop hook records a marker and emits context only. Session finalization, journal writes, artifacts, metrics, vocabulary, and review queue updates are owned by the internal session engine.

Print or install the hook config:

```bash
node scripts/install-native-hooks.mjs --print
node scripts/install-native-hooks.mjs --install --target /tmp/english-learning-hooks.json
node scripts/install-native-hooks.mjs --install
node scripts/install-native-hooks.mjs --uninstall
```

The generated config wires `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `Stop`, and `PreCompact`.

## Local Marketplace Package

Local marketplace packaging is available for isolated plugin install testing:

```bash
node scripts/package-local-marketplace.mjs --target tmp/english-learning-marketplace
CODEX_HOME="$PWD/tmp/codex-home" codex plugin marketplace add "$PWD/tmp/english-learning-marketplace"
CODEX_HOME="$PWD/tmp/codex-home" codex plugin add english-learning-harness@english-learning-local
CODEX_HOME="$PWD/tmp/codex-home" codex plugin list
```

The verified install claim is local marketplace packaging only: a clean repository can package the plugin into a local marketplace root, install that marketplace into an isolated `CODEX_HOME`, and list the plugin as installed/enabled.

## Public Distribution

The primary open-source distribution path is this source repository:

```bash
git clone https://github.com/bborok1234/english-learning-harness.git
cd english-learning-harness
node scripts/english-learning-harness.mjs setup --json
node scripts/english-learning-harness.mjs daily --json
node scripts/english-learning-harness.mjs today --say "I want to practice today." --json
node scripts/english-learning-harness.mjs weekly --json
node scripts/english-learning-harness.mjs home --json
node scripts/english-learning-harness.mjs export --json
```

Before claiming public distribution, verify a default public clone:

```bash
node scripts/phase6-public-clean-clone-smoke.mjs
```

The tarball artifact path remains optional for release assets or mirrors:

```bash
node scripts/package-public-artifact.mjs --target tmp/public-artifact
tar -xzf tmp/public-artifact/english-learning-harness-public.tar.gz -C tmp/public-artifact
cd tmp/public-artifact/english-learning-harness
node scripts/english-learning-harness.mjs setup --json
node scripts/english-learning-harness.mjs today --say "I want to practice today." --json
```

This proves artifact mechanics only after `node scripts/phase7-public-artifact-smoke.mjs` passes. It does not prove public hosting or public download until the artifact is actually published.

After the artifact is hosted at a public URL, verify the download-to-learning path:

```bash
ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL="https://example.com/english-learning-harness-public.tar.gz" \
  node scripts/phase7-hosted-artifact-smoke.mjs
```

To verify the public artifact repository path with checksum evidence:

```bash
ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL="https://example.com/english-learning-harness-public.tar.gz" \
ENGLISH_LEARNING_PUBLIC_SHA256SUMS_URL="https://example.com/SHA256SUMS" \
  node scripts/phase7-public-release-url-smoke.mjs
```

The manual GitHub Actions workflow `.github/workflows/public-artifact.yml` can build the same artifact and optionally upload a release asset when explicitly dispatched with `publish_release: true`, `artifact_repo`, and a `PUBLIC_ARTIFACT_REPO_TOKEN` secret. This is secondary to the open-source repository path.

For a separate public artifact repository handoff, generate the bundle locally:

```bash
node scripts/prepare-public-artifact-handoff.mjs --target tmp/public-artifact-handoff
```

## Open Source

- License: `LICENSE`
- Contributing guide: `CONTRIBUTING.md`
- Code of conduct: `CODE_OF_CONDUCT.md`
- Security policy: `SECURITY.md`
- Support guidance: `SUPPORT.md`
- Governance notes: `GOVERNANCE.md`

## Maintainer Verification

```bash
node scripts/phase7-learner-readme-smoke.mjs
node scripts/phase1-command-wrapper-smoke.mjs
node scripts/phase6-public-clean-clone-smoke.mjs
node scripts/phase6-marketplace-install-smoke.mjs
node scripts/phase7-open-source-readiness-smoke.mjs
node scripts/phase7-open-source-history-audit-smoke.mjs
node scripts/phase7-publication-preflight.mjs
node scripts/phase1-scaffold-smoke.mjs
node scripts/generate-dashboard.mjs
```
