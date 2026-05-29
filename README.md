# English Learning Harness

Open-source, local-first Codex harness that turns a cloned repository into a daily English speaking practice partner.

North star: **AI 파트너와 편안하게 영어로 대화하는 능력.**

If you already use Codex for coding, this project asks a simple question: can the same agentic loop help you practice English every day, remember what you said, and show whether your spoken English is becoming easier, clearer, and more reusable?

This first usable version is text/transcription-first. It is designed for real daily practice, transcript-backed voice import, personal phrase review, and visible progress tracking. Realtime voice conversation is not the default path yet because the current local Codex CLI does not expose a stable realtime voice command.

## Try It In 5 Minutes

From a fresh clone:

```bash
git clone https://github.com/bborok1234/english-learning-harness.git
cd english-learning-harness
node scripts/english-learning-harness.mjs setup \
  --name "Jieun" \
  --motivation "I want to feel less frozen when speaking English." \
  --correction-style "gentle recast first"
node scripts/english-learning-harness.mjs daily --json
node scripts/english-learning-harness.mjs today --say "I want to practice today." --json
node scripts/english-learning-harness.mjs weekly --json
node scripts/english-learning-harness.mjs home --json
node scripts/english-learning-harness.mjs export --json
```

The most important first command is `today`. Give it one or more English sentences and it creates a practice session, saves a mini mirror, updates your progress, and feeds future review.

```bash
node scripts/english-learning-harness.mjs today \
  --say "I like coffee." \
  --say "Today morning coffee."
```

Ask the cockpit what to do next:

```bash
node scripts/english-learning-harness.mjs daily --json
```

Generate your learner home page:

```bash
node scripts/english-learning-harness.mjs home --json
```

## Who This Is For

- Learners who can read some English but freeze when they need to speak.
- Korean speakers or other EFL learners who want low-pressure daily output practice.
- Codex users curious whether an agent can become a focused language-learning harness instead of a generic chatbot.
- Builders who want to inspect, fork, and improve an open-source AI-native learning loop.

This is not a course catalog, a streak app, or a generic chat UI. It is a local practice harness that helps you produce English, keep the useful pieces, and return tomorrow with context.

## What You Practice

The harness is built around a small daily loop:

1. Run `daily` to see what is due, what scenario fits you, and what command to run.
2. Run `today` with short spoken-style English or a transcript.
3. Read the mini mirror: what you tried, what worked, what to repair next.
4. Review saved phrases so usable language comes back later.
5. Run `weekly` to see the larger pattern of your practice.

The learning target is not "perfect English today." The target is more comfortable output: starting faster, repairing mistakes, asking follow-up questions, reusing phrases, and seeing your own progress from evidence.

## How It Helps Conversation

- **Low-stakes output reps:** short sessions make it easy to speak or type imperfect English without waiting for a class.
- **Gentle correction:** the tutor policy favors recasts, repair prompts, and next attempts instead of overwhelming grammar dumps.
- **Personal phrase memory:** useful phrases and repaired patterns become review material.
- **Scenario practice:** the harness suggests daily scenarios based on your learner model and history.
- **Mini mirrors:** every session produces a concise reflection so you can see what improved and what to try next.
- **Weekly mirrors:** the weekly view turns isolated sessions into a learning journey.
- **Multimodal-ready evidence:** text, transcript-backed voice, and image information-gap events share a common interaction-event shape.

## What Gets Tracked

By default learner-owned files live here:

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

For testing, demos, or a separate learner, set `ENGLISH_LEARNING_HOME` or pass `--learner-root`.

Tracked evidence includes:

- profile and motivation
- session count, date, and MVP progress metrics
- journal entries and session artifacts
- vocabulary and phrase history
- review queue state
- learner model signals
- weekly mirror summaries
- local validation exports

## Daily Commands

Set up or repair the local learner directory:

```bash
node scripts/english-learning-harness.mjs setup
node scripts/english-learning-harness.mjs setup --repair
```

Run today's text-first daily session:

```bash
node scripts/english-learning-harness.mjs today --say "I want to practice today." --json
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

The voice path stores transcript-backed interaction evidence. It does not score accent or prove realtime conversation.

Run an image information-gap practice from a local image path:

```bash
node scripts/english-learning-harness.mjs image \
  --image-file path/to/local-image.png \
  --hidden-detail "the wallet is partly hidden near the cup" \
  --clarification-prompt "Where is the wallet compared with the cup?" \
  --say "The cup is on the left." \
  --json
```

The image path is local prompt context only; the learner output is the learning evidence.

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

Export a local evidence pack:

```bash
node scripts/english-learning-harness.mjs export --json
```

Check health and status:

```bash
node scripts/english-learning-harness.mjs health --json
node scripts/english-learning-harness.mjs status --json
node scripts/validate-progress.mjs ~/english-learning/progress.json
```

## What You Should Feel After The First Run

After setup and one `today` session, you should have:

- a learner profile under your local learner root
- a saved practice artifact
- a progress file with updated session metrics
- a mini mirror describing the session
- a next-step command from the daily cockpit
- a generated `home.html` view you can open locally

The experience is intentionally small at first: speak or type a little, get a mirror, keep the phrase, return tomorrow.

## Privacy And Local Data

The default learning state is local to your machine under `~/english-learning/`. Source media paths are treated as local-only in exported validation packs.

Do not put private learner journals, audio, transcripts, or personal details in GitHub issues unless you intentionally redact and share them. Use `ENGLISH_LEARNING_HOME` when you want a disposable learner root for testing.

## Current Boundaries

- Realtime voice conversation is not claimed as the default path yet.
- Accent scoring is not implemented.
- Image practice stores local prompt context and learner output; it does not perform full computer-vision tutoring by itself.
- Public Git-backed install remains unverified and should not be documented as the default install path yet.
- Long-term real learner improvement still needs real multi-day human use, not only fixture smokes.

## Native Codex Hooks

Native hooks are optional. The reliable first-use path is the explicit command wrapper:

```bash
node scripts/english-learning-harness.mjs setup
node scripts/english-learning-harness.mjs today --say "I want to practice today."
node scripts/english-learning-harness.mjs health
```

P0-2 did not prove automatic plugin-scoped hook execution for this plugin, and PH1-FIX-1 found Codex hook trust-state limitations. Use native hooks only after accepting that hook trust-state may require manual intervention in the local Codex environment.

Stop hook contract: the Stop hook records a marker and emits context only. Session finalization, journal writes, artifacts, metrics, vocabulary, and review queue updates are owned by `today`.

Print or install the hook config:

```bash
node scripts/install-native-hooks.mjs --print
node scripts/install-native-hooks.mjs --install --target /tmp/english-learning-hooks.json
node scripts/install-native-hooks.mjs --install
node scripts/install-native-hooks.mjs --uninstall
```

The generated config wires `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `Stop`, and `PreCompact`.

## Local Marketplace Package

The default learner path is the public source clone above. Local marketplace packaging is available for isolated plugin install testing:

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

The manual GitHub Actions workflow `.github/workflows/public-artifact.yml` can build the same artifact and optionally upload it to a release when explicitly dispatched with `publish_release: true`, `artifact_repo`, and a `PUBLIC_ARTIFACT_REPO_TOKEN` secret. This is secondary to the open-source repository path.

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

Run the learner-facing README audit:

```bash
node scripts/phase7-learner-readme-smoke.mjs
```

Run the core wrapper smoke:

```bash
node scripts/phase1-command-wrapper-smoke.mjs
```

Run the current public release checks:

```bash
node scripts/phase6-public-clean-clone-smoke.mjs
node scripts/phase6-marketplace-install-smoke.mjs
node scripts/phase7-open-source-readiness-smoke.mjs
node scripts/phase7-open-source-history-audit-smoke.mjs
node scripts/phase7-publication-preflight.mjs
```

Run scaffold/package smoke:

```bash
node scripts/phase1-scaffold-smoke.mjs
```

Regenerate the shared dashboard after changing `docs/project-state.json`:

```bash
node scripts/generate-dashboard.mjs
```
