# PH1-1 Evidence — Plugin Scaffold

Date: 2026-05-27
Environment:
- macOS local workspace
- `codex-cli 0.133.0`
- Node.js local scripts
- Isolated smoke root: `tmp/phase-1-scaffold-smoke`

Verdict: pass

## Scope

Create the Phase 1 scaffold using the Phase 0 constraints:

- plugin manifest,
- skill skeletons,
- setup-owned/native hook registration path,
- learner `progress.json` v2 schema validator,
- local smoke checks,
- isolated local marketplace install check.

## Created Files

```text
.codex-plugin/plugin.json
skills/onboarding/SKILL.md
skills/daily-session/SKILL.md
skills/mini-mirror/SKILL.md
skills/picture-description/SKILL.md
hooks/hooks.json
hooks/english-learning-hook.mjs
scripts/validate-progress.mjs
scripts/install-native-hooks.mjs
scripts/phase1-scaffold-smoke.mjs
```

## Commands

```bash
node scripts/phase1-scaffold-smoke.mjs
node scripts/validate-progress.mjs tmp/phase-1-scaffold-smoke/learner/progress.json
CODEX_HOME="$PWD/tmp/phase-1-scaffold-smoke/codex-home" codex plugin list
python3 /Users/mirlim/.codex/skills/.system/plugin-creator/scripts/validate_plugin.py /Users/mirlim/sidejob/english-learning-harness
```

## Observed Result

`phase1-scaffold-smoke` passed:

```json
{
  "status": "pass",
  "requiredFiles": [
    ".codex-plugin/plugin.json",
    "skills/onboarding/SKILL.md",
    "skills/daily-session/SKILL.md",
    "skills/mini-mirror/SKILL.md",
    "skills/picture-description/SKILL.md",
    "hooks/english-learning-hook.mjs",
    "hooks/hooks.json",
    "scripts/validate-progress.mjs",
    "scripts/install-native-hooks.mjs"
  ],
  "learnerRoot": "/Users/mirlim/sidejob/english-learning-harness/tmp/phase-1-scaffold-smoke/learner",
  "hooksTarget": "/Users/mirlim/sidejob/english-learning-harness/tmp/phase-1-scaffold-smoke/hooks.json",
  "marketplaceRoot": "/Users/mirlim/sidejob/english-learning-harness/tmp/phase-1-scaffold-smoke/marketplace",
  "codexHome": "/Users/mirlim/sidejob/english-learning-harness/tmp/phase-1-scaffold-smoke/codex-home"
}
```

Progress validator passed:

```json
{
  "status": "pass",
  "path": "/Users/mirlim/sidejob/english-learning-harness/tmp/phase-1-scaffold-smoke/learner/progress.json",
  "version": 2,
  "mvp_session_metrics": [
    "attendance",
    "english_word_ratio",
    "new_vocabulary_count",
    "utterance_word_count",
    "voluntary_speaking_seconds"
  ]
}
```

Isolated local marketplace install passed:

```text
PLUGIN                                    STATUS              VERSION  PATH
english-learning-harness@phase1-scaffold  installed, enabled  0.1.0    .../tmp/phase-1-scaffold-smoke/marketplace/plugins/english-learning-harness
```

The plugin-creator validator still cannot run in this local environment because its Python dependency is missing:

```text
ModuleNotFoundError: No module named 'yaml'
```

This is the same validator-environment gap observed in P0-3. The install smoke is the authoritative scaffold verification for this phase.

## Decisions

- `.codex-plugin/plugin.json` intentionally does not include a `hooks` field. P0-2 did not prove plugin-scoped hook auto-execution, and the plugin-creator validator guidance says unsupported manifest fields such as `hooks` should be omitted.
- `hooks/hooks.json` remains as package/reference metadata, but the MVP path is `scripts/install-native-hooks.mjs`, which emits or writes a setup-owned native hook config with absolute commands.
- `hooks/english-learning-hook.mjs` creates local learner files under `ENGLISH_LEARNING_HOME` or `~/english-learning` and injects text/transcription-first context.
- Realtime voice remains future optional; hook logic only warns when voice/audio/realtime-like tool input is detected.
- `scripts/validate-progress.mjs` enforces `progress.json` version 2 and exactly the five D83 MVP session metrics under `mvp_session_metrics`.

## Follow-up

- PH1-2 should implement the actual daily-session command/update path on top of this scaffold.
- Public release still needs Git-backed marketplace verification before documenting a public install flow.
