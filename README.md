# English Learning Harness

Local-first Codex plugin/harness for gentle English practice.

North star: **AI 파트너와 편안하게 영어로 대화하는 능력.**

This first usable version is text/transcription-first. Realtime voice is not a default path because the current local Codex CLI does not expose a stable realtime voice command.

## What Works

- Onboarding/profile setup under a local learner directory.
- Supported command-wrapper path for setup, daily cockpit, daily session, health, status, and context.
- Daily English session runner with text input or transcript file input.
- Mini mirror after each session.
- `progress.json` v2 updates for the five MVP session metrics.
- Journal and session artifact persistence.
- Optional setup-owned/native hook config generation.
- Local marketplace packaging and install smoke.

## Learner Data

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

For testing or a separate learner, set `ENGLISH_LEARNING_HOME` or pass `--learner-root`.

## Quick Start

From a fresh private beta / invited-user clone:

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

The M6 first-complete release claim is **private beta / invited-user clone-to-learn**. The repository is currently private, so unauthenticated public clone is deferred to M7. Do not describe the HTTPS clone command as public release evidence until the default public clone smoke passes without private access.

The supported first-use path is the explicit command wrapper. It does not require native Codex hooks.

One command prepares the learner directory and returns health plus the next command to run:

```bash
node scripts/english-learning-harness.mjs setup \
  --name "Jieun" \
  --motivation "I want to feel less frozen when speaking English." \
  --correction-style "gentle recast first"
```

`setup`, `health`, and `status` return a `support` block in JSON mode. It lists the supported next commands, local support files, repair commands, and the native hook boundary. The first-use path remains the explicit command wrapper.

If health reports a corrupt local store, run the repair form. It backs up broken local JSON files before recreating defaults:

```bash
node scripts/english-learning-harness.mjs setup --repair
```

Run today's text-first daily session:

```bash
node scripts/english-learning-harness.mjs today \
  --say "I like coffee." \
  --say "Today morning coffee."
```

Ask the daily cockpit what to do next:

```bash
node scripts/english-learning-harness.mjs daily --json
```

The cockpit reads local files only and returns due review, suggested scenario, learner model summary, latest weekly mirror pointer, and exact next commands.

Generate a local learner home page:

```bash
node scripts/english-learning-harness.mjs home --json
```

The generated `home.html` lives under the learner root and shows the learner-facing journey without project implementation logs.

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

Export a local evidence pack for M5 review:

```bash
node scripts/english-learning-harness.mjs export --json
```

The export writes JSON and Markdown packs under `artifacts/validation/`. Local learner roots and source media paths are redacted or marked local-only inside the pack.

Review due personal phrases:

```bash
node scripts/english-learning-harness.mjs review --json
```

Mark a reviewed phrase:

```bash
node scripts/english-learning-harness.mjs review \
  --review-id phrase-i-like-drinking-coffee \
  --result success
```

Open the phrase vault:

```bash
node scripts/english-learning-harness.mjs vault --json
```

Generate a weekly mirror from local evidence:

```bash
node scripts/english-learning-harness.mjs weekly --json
```

Check health:

```bash
node scripts/english-learning-harness.mjs health --json
```

Inspect detailed status:

```bash
node scripts/english-learning-harness.mjs status --json
```

Validate progress:

```bash
node scripts/validate-progress.mjs ~/english-learning/progress.json
```

## Native Hook Setup

Native hooks are optional.

P0-2 did not prove automatic plugin-scoped hook execution for this plugin, and PH1-FIX-1 found Codex hook trust-state limitations. The reliable first-usable path is:

```bash
node scripts/english-learning-harness.mjs setup
node scripts/english-learning-harness.mjs today --say "I want to practice today."
node scripts/english-learning-harness.mjs health
```

Use native hooks only after accepting that hook trust-state may require manual intervention in the local Codex environment.

Stop hook contract: the Stop hook records a marker and emits context only. Session finalization, journal writes, artifacts, metrics, vocabulary, and review queue updates are owned by:

```bash
node scripts/english-learning-harness.mjs today
```

Print the hook config:

```bash
node scripts/install-native-hooks.mjs --print
```

Write a hook config to a chosen path:

```bash
node scripts/install-native-hooks.mjs --install --target /tmp/english-learning-hooks.json
```

Install into your default Codex hook config with an automatic backup:

```bash
node scripts/install-native-hooks.mjs --install
```

Remove the English Learning Harness hooks later:

```bash
node scripts/install-native-hooks.mjs --uninstall
```

The generated config wires:

- `SessionStart`
- `UserPromptSubmit`
- `PreToolUse`
- `Stop`
- `PreCompact`

## Local Marketplace Package

Create a local marketplace package:

```bash
node scripts/package-local-marketplace.mjs --target tmp/english-learning-marketplace
```

Install from that local marketplace with an isolated Codex home:

```bash
CODEX_HOME="$PWD/tmp/codex-home" codex plugin marketplace add "$PWD/tmp/english-learning-marketplace"
CODEX_HOME="$PWD/tmp/codex-home" codex plugin add english-learning-harness@english-learning-local
CODEX_HOME="$PWD/tmp/codex-home" codex plugin list
```

Public Git-backed install remains unverified and should not be documented as the default install path yet.

The verified install claim is local marketplace packaging only: a clean repository can package the plugin into a local marketplace root, install that marketplace into an isolated `CODEX_HOME`, and list the plugin as installed/enabled. Do not replace this with a GitHub-backed install command until a separate smoke proves that path.

## Public Artifact Candidate

The repository is private, so unauthenticated public clone is deferred. The current public distribution candidate is a tarball that can be published later through a public release or another public URL:

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

Without `ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL`, the hosted-artifact smoke uses a local loopback server and proves mechanics only, not public access.

The manual GitHub Actions workflow `.github/workflows/public-artifact.yml` can build the same artifact and optionally upload it to a GitHub release when explicitly dispatched with `publish_release: true`. A release asset on a private repository is not automatically public evidence; verify the final URL with `phase7-hosted-artifact-smoke.mjs`.

For a separate public artifact repository handoff, generate the bundle locally:

```bash
node scripts/prepare-public-artifact-handoff.mjs --target tmp/public-artifact-handoff
```

The handoff directory contains a public artifact repository `README.md`, the tarball, `SHA256SUMS`, `PUBLIC-ARTIFACT-MANIFEST.json`, and `RELEASE-NOTES.md`. It includes a publication command as text only; it does not create a repository or publish a release. Verify the bundle before any owner-approved publication action:

```bash
node scripts/phase7-public-artifact-handoff-smoke.mjs
```

## Verification

Run the supported wrapper smoke:

```bash
node scripts/phase1-command-wrapper-smoke.mjs
```

Run the vocabulary history smoke:

```bash
node scripts/phase1-vocabulary-history-smoke.mjs
```

Run the scenario loop and persona fixture smoke:

```bash
node scripts/phase1-scenario-loop-smoke.mjs
node scripts/phase1-persona-fixture-smoke.mjs
```

Run the Stop/finalization contract smoke:

```bash
node scripts/phase1-stop-finalization-smoke.mjs
```

Run the setup recovery smoke:

```bash
node scripts/phase1-setup-recovery-smoke.mjs
```

Run the clean clone first-use smoke:

```bash
node scripts/phase1-clean-clone-smoke.mjs
```

Run the learner model and skill memory smoke:

```bash
node scripts/phase2-learner-model-smoke.mjs
```

Run the review queue and phrase vault smoke:

```bash
node scripts/phase2-review-vault-smoke.mjs
```

Run the memory-aware scenario planner smoke:

```bash
node scripts/phase2-scenario-planner-smoke.mjs
```

Run the tutor policy rubric smoke:

```bash
node scripts/phase2-tutor-policy-smoke.mjs
```

Run the weekly mirror smoke:

```bash
node scripts/phase2-weekly-mirror-smoke.mjs
```

Run the daily cockpit smoke:

```bash
node scripts/phase3-daily-cockpit-smoke.mjs
```

Run the learner home smoke:

```bash
node scripts/phase3-learner-home-smoke.mjs
```

Run the no-streak return smoke:

```bash
node scripts/phase3-no-streak-return-smoke.mjs
```

Run the seven-day local simulation smoke:

```bash
node scripts/phase3-seven-day-simulation-smoke.mjs
```

Run the M3 clone-to-daily gate smoke:

```bash
node scripts/phase3-m3-gate-smoke.mjs
```

Run the interaction event schema smoke:

```bash
node scripts/phase4-interaction-event-schema-smoke.mjs
```

Run the text event persistence smoke:

```bash
node scripts/phase4-text-event-persistence-smoke.mjs
```

Run the voice event import smoke:

```bash
node scripts/phase4-voice-event-import-smoke.mjs
```

Run the image information-gap smoke:

```bash
node scripts/phase4-image-information-gap-smoke.mjs
```

Run the M4 multimodal gate smoke:

```bash
node scripts/phase4-multimodal-gate-smoke.mjs
```

Run the M5 evidence export smoke:

```bash
node scripts/phase5-evidence-export-smoke.mjs
```

Run the M5 before/after transcript rubric smoke:

```bash
node scripts/phase5-transcript-rubric-smoke.mjs
```

Run the M5 target-persona validation smoke:

```bash
node scripts/phase5-persona-validation-smoke.mjs
```

Run the M5 validation gate smoke:

```bash
node scripts/phase5-m5-gate-smoke.mjs
```

Run the M6 public clean clone smoke:

```bash
node scripts/phase6-public-clean-clone-smoke.mjs
```

Run the M6 distribution policy smoke:

```bash
node scripts/phase6-distribution-policy-smoke.mjs
```

Run the M6 local marketplace install smoke:

```bash
node scripts/phase6-marketplace-install-smoke.mjs
```

Run the M6 onboarding diagnostics smoke:

```bash
node scripts/phase6-onboarding-diagnostics-smoke.mjs
```

Run the M6 release gate audit:

```bash
node scripts/phase6-release-gate-smoke.mjs
```

Run the M7 public artifact mechanics smoke:

```bash
node scripts/phase7-public-artifact-smoke.mjs
```

Run the M7 hosted artifact smoke:

```bash
node scripts/phase7-hosted-artifact-smoke.mjs
```

Run the M7 release workflow static smoke:

```bash
node scripts/phase7-release-workflow-smoke.mjs
```

Run the M7 public release decision gate smoke:

```bash
node scripts/phase7-public-release-decision-smoke.mjs
```

Run the M7 public artifact repository handoff smoke:

```bash
node scripts/phase7-public-artifact-handoff-smoke.mjs
```

Run the full first-run smoke:

```bash
node scripts/phase1-full-flow-smoke.mjs
```

Run scaffold/package smoke:

```bash
node scripts/phase1-scaffold-smoke.mjs
```

Regenerate the shared dashboard:

```bash
node scripts/generate-dashboard.mjs
```
