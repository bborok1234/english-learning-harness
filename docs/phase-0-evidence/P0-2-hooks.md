# P0-2 Evidence — Hook Availability and Registration

Date: 2026-05-27
Environment:
- macOS local workspace
- `codex-cli 0.133.0`
- Feature flags from `codex features list`
- Existing user hook config inspected at `~/.codex/hooks.json`
- Temporary plugin fixture from P0-3

Verdict: pass

## Command or Manual Action

Checked current feature flags:

```bash
codex features list
```

Relevant observed flags:

```text
hooks         stable  true
plugin_hooks stable  true
plugins      stable  true
goals        stable  true
```

Checked current native hook config:

```bash
sed -n '1,240p' ~/.codex/hooks.json
```

Observed native hook surfaces:

- `SessionStart`
- `PreToolUse`
- `PostToolUse`
- `UserPromptSubmit`
- `Stop`
- `PreCompact`
- `PostCompact`

Inspected an existing plugin-scoped hook example from oh-my-codex:

```bash
sed -n '1,220p' /Users/mirlim/.nvm/versions/node/v24.12.0/lib/node_modules/oh-my-codex/plugins/oh-my-codex/hooks/hooks.json
sed -n '1,180p' /Users/mirlim/.nvm/versions/node/v24.12.0/lib/node_modules/oh-my-codex/plugins/oh-my-codex/.codex-plugin/plugin.json
```

The existing plugin example uses this manifest field:

```json
{
  "hooks": "./hooks/hooks.json"
}
```

Created a temporary plugin-scoped hook fixture:

```text
tmp/phase-0-plugin-spike/marketplace/plugins/english-learning-harness/.codex-plugin/plugin.json
tmp/phase-0-plugin-spike/marketplace/plugins/english-learning-harness/hooks/hooks.json
tmp/phase-0-plugin-spike/marketplace/plugins/english-learning-harness/hooks/phase0-hook.mjs
```

Installed it through the P0-3 marketplace path into real `CODEX_HOME`, then ran one trusted-hook-bypass exec:

```bash
codex plugin marketplace add "$PWD/tmp/phase-0-plugin-spike/marketplace"
codex plugin add english-learning-harness@phase0-hooks

PHASE0_HOOK_LOG="$PWD/tmp/phase-0-hook-events-real.jsonl" \
  codex exec \
  --dangerously-bypass-hook-trust \
  --enable hooks \
  --enable plugin_hooks \
  --ignore-rules \
  --skip-git-repo-check \
  --sandbox read-only \
  "Reply with OK only."

codex plugin remove english-learning-harness@phase0-hooks
codex plugin marketplace remove phase0-hooks
```

## Observed Result

Native hook surfaces are available in the current Codex installation.

`codex exec` stderr showed hook lifecycle events:

```text
hook: SessionStart
hook: SessionStart Completed
hook: UserPromptSubmit
hook: UserPromptSubmit Completed
...
hook: Stop
hook: Stop Completed
```

The model run completed:

```text
OK
```

Cleanup succeeded:

```text
Removed plugin `english-learning-harness` from marketplace `phase0-hooks`.
Removed marketplace `phase0-hooks`.
```

The temporary plugin hook script itself works when invoked directly:

```bash
node tmp/phase-0-plugin-spike/marketplace/plugins/english-learning-harness/hooks/phase0-hook.mjs SessionStart
```

Observed output:

```json
{"hookSpecificOutput":{"additionalContext":"phase0 hook marker: SessionStart"}}
```

However, during `codex exec`, the plugin fixture marker log was not created. That means this spike did **not** prove that a newly installed plugin's `hooks/hooks.json` automatically executes in this command path.

## Decision Impact

Proceed, but do not assume plugin manifest hook auto-registration.

Implementation path for Phase 1:

1. Treat hook surfaces as available in Codex 0.133.0.
2. Use setup-owned/native hook registration as the reliable path for MVP:
   - user-level `~/.codex/hooks.json`, or
   - project-local `.codex/hooks.json` if current Codex supports it in the target setup.
3. Keep plugin-scoped `hooks/hooks.json` as package metadata, but do not rely on it until a future spike proves it executes for this plugin.
4. Preserve fallbacks:
   - If `PreCompact` is unavailable in a target environment, use SessionStart/UserPromptSubmit reinjection.
   - If `PreToolUse` cannot inspect the intended voice tool, enforce voice limits in the daily-session command path instead.

## Follow-up

- Phase 1 must include a hook registration installer/checker rather than relying only on `.codex-plugin/plugin.json`.
- P0-4 can proceed because local persistence does not depend on plugin-scoped hooks; it can be tested with ordinary scripts first.
- Before public release, repeat this test in the exact target install mode and require marker output from plugin-scoped hooks before documenting them as automatic.
