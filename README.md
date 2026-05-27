# English Learning Harness

Local-first Codex plugin/harness for gentle English practice.

North star: **AI 파트너와 편안하게 영어로 대화하는 능력.**

This first usable version is text/transcription-first. Realtime voice is not a default path because the current local Codex CLI does not expose a stable realtime voice command.

## What Works

- Onboarding/profile setup under a local learner directory.
- Daily English session runner with text input or transcript file input.
- Mini mirror after each session.
- `progress.json` v2 updates for the five MVP session metrics.
- Journal and session artifact persistence.
- Setup-owned/native hook config generation.
- Local marketplace packaging and install smoke.

## Learner Data

By default learner-owned files live here:

```text
~/english-learning/
├── profile.md
├── progress.json
├── journal/
└── artifacts/sessions/
```

For testing or a separate learner, set `ENGLISH_LEARNING_HOME` or pass `--learner-root`.

## Quick Start

Initialize a profile:

```bash
node scripts/english-learning.mjs init \
  --name "Jieun" \
  --motivation "I want to feel less frozen when speaking English." \
  --correction-style "gentle recast first"
```

Run a text-first daily session:

```bash
node scripts/english-learning.mjs session \
  --input "I like coffee." \
  --input "Today morning coffee."
```

Run from a transcript file:

```bash
node scripts/english-learning.mjs session --transcript path/to/transcript.txt
```

Inspect status:

```bash
node scripts/english-learning.mjs status --json
```

Validate progress:

```bash
node scripts/validate-progress.mjs ~/english-learning/progress.json
```

## Native Hook Setup

P0-2 did not prove automatic plugin-scoped hook execution for this plugin, so the reliable MVP path is setup-owned/native hook registration.

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
