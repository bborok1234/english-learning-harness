# P0-3 Evidence — Plugin Distribution Path

Date: 2026-05-27
Environment:
- macOS local workspace
- `codex-cli 0.133.0`
- Isolated `CODEX_HOME`: `tmp/phase-0-codex-home-p0-3`
- Disposable marketplace fixture: `tmp/phase-0-plugin-spike/marketplace`

Verdict: pass

## Command or Manual Action

Checked current CLI plugin commands:

```bash
codex plugin marketplace add --help
codex plugin list --help
codex plugin add --help
```

Created a disposable plugin fixture with the current plugin scaffold shape:

```bash
python3 /Users/mirlim/.codex/skills/.system/plugin-creator/scripts/create_basic_plugin.py \
  english-learning-harness \
  --path tmp/phase-0-plugin-spike/marketplace/plugins \
  --marketplace-path tmp/phase-0-plugin-spike/marketplace/marketplace.json \
  --with-skills \
  --with-hooks \
  --with-marketplace
```

Moved the marketplace manifest to the manifest path expected by the current Codex CLI:

```bash
mkdir -p tmp/phase-0-plugin-spike/marketplace/.agents/plugins
cp tmp/phase-0-plugin-spike/marketplace/marketplace.json \
  tmp/phase-0-plugin-spike/marketplace/.agents/plugins/marketplace.json
rm tmp/phase-0-plugin-spike/marketplace/marketplace.json
```

Registered the local marketplace and listed available plugins with isolated config:

```bash
CODEX_HOME="$PWD/tmp/phase-0-codex-home-p0-3" \
  codex plugin marketplace add "$PWD/tmp/phase-0-plugin-spike/marketplace"

CODEX_HOME="$PWD/tmp/phase-0-codex-home-p0-3" \
  codex plugin marketplace list

CODEX_HOME="$PWD/tmp/phase-0-codex-home-p0-3" \
  codex plugin list
```

Installed the plugin:

```bash
CODEX_HOME="$PWD/tmp/phase-0-codex-home-p0-3" \
  codex plugin add english-learning-harness@personal
```

Removed the plugin to verify selector shape:

```bash
CODEX_HOME="$PWD/tmp/phase-0-codex-home-p0-3" \
  codex plugin remove english-learning-harness@personal
```

## Observed Result

`codex plugin marketplace add <directory>` rejected a marketplace root when the manifest was at:

```text
tmp/phase-0-plugin-spike/marketplace/marketplace.json
```

The current CLI accepted the marketplace only when the manifest was at:

```text
tmp/phase-0-plugin-spike/marketplace/.agents/plugins/marketplace.json
```

Accepted marketplace output:

```text
Added marketplace `personal` from .../tmp/phase-0-plugin-spike/marketplace.
Installed marketplace root: .../tmp/phase-0-plugin-spike/marketplace
```

Available plugin output:

```text
PLUGIN                             STATUS         VERSION  PATH
english-learning-harness@personal  not installed           .../plugins/english-learning-harness
```

Install output:

```text
Added plugin `english-learning-harness` from marketplace `personal`.
Installed plugin root: .../plugins/cache/personal/english-learning-harness/0.1.0
```

Post-install list output:

```text
PLUGIN                             STATUS              VERSION  PATH
english-learning-harness@personal  installed, enabled  0.1.0    .../plugins/english-learning-harness
```

The isolated `CODEX_HOME` config recorded:

```toml
[marketplaces.personal]
last_updated = "2026-05-27T05:57:56Z"
source_type = "local"
source = ".../tmp/phase-0-plugin-spike/marketplace"

[plugins."english-learning-harness@personal"]
enabled = true
```

The generated plugin manifest shape also passed a local JSON shape check:

```text
manifest_shape=ok
```

The `plugin-creator` validator could not run in this environment because its script imports `yaml`, and the available Python environments do not currently include PyYAML:

```text
ModuleNotFoundError: No module named 'yaml'
```

This is a validator-environment gap, not an install-path failure.

## Decision Impact

Proceed with Phase 1 plugin packaging using this distribution assumption:

1. Plugin source lives under a marketplace root at `plugins/english-learning-harness`.
2. Marketplace metadata lives at `.agents/plugins/marketplace.json`.
3. Current install command shape is:

```bash
codex plugin marketplace add <marketplace-root>
codex plugin add english-learning-harness@personal
```

Do not document `codex /plugins install <url>`.

Do not document direct GitHub URL install as verified. The CLI help supports local path, `owner/repo`, HTTPS Git URL, and SSH Git URL as marketplace sources, but this spike only reproduced the local marketplace path.

## Follow-up

- P0-2 should verify whether plugin-scoped hooks are actually loaded from an installed plugin.
- Phase 1 should put marketplace metadata at `.agents/plugins/marketplace.json`, not root `marketplace.json`.
- Before public handoff, test a Git-backed marketplace source separately or publish only the local/developer install path.
