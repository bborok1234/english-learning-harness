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

The supported first-use path is the explicit command wrapper. It does not require native Codex hooks.

One command prepares the learner directory and returns health plus the next command to run:

```bash
node scripts/english-learning-harness.mjs setup \
  --name "Jieun" \
  --motivation "I want to feel less frozen when speaking English." \
  --correction-style "gentle recast first"
```

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
