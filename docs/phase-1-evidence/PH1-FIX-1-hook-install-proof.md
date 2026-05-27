# PH1-FIX-1 Evidence — Native Hook Install Proof

Date: 2026-05-27
Status: partial / not complete

## What Was Improved

`scripts/install-native-hooks.mjs` now supports:

- `--print`
- `--install`
- `--uninstall`
- `--target <hooks.json>`
- backup-on-write by default
- preservation of existing non-English-Learning hooks
- uninstall restoration of hook-chain wrapped entries

It no longer blindly overwrites a target hooks file.

## Local Merge Test

Command:

```bash
rm -rf tmp/hook-install-check
mkdir -p tmp/hook-install-check
printf '{"hooks":{"SessionStart":[{"matcher":"startup|resume|clear","hooks":[{"type":"command","command":"echo keep"}]}],"Stop":[{"hooks":[{"type":"command","command":"echo stop"}]}]},"state":{"keep":true}}\n' > tmp/hook-install-check/hooks.json
node scripts/install-native-hooks.mjs --install --target tmp/hook-install-check/hooks.json --no-backup
```

Observed:

- existing state was preserved,
- existing hooks were preserved,
- managed English Learning Harness commands were merged.

## Hook Chain Runner

Added:

```text
hooks/hook-chain-runner.mjs
```

Reason:

Codex appears not to run multiple command hooks in a single hook entry in the way this project needs. A chain runner can run the English Learning hook and then the previous hook command, merging `additionalContext`.

Direct chain-runner side-effect test passed:

```text
chain-runner-side-effect-ok
```

## Codex Runtime Attempt

The real runtime proof is still not complete.

Attempt:

```bash
cp ~/.codex/hooks.json tmp/verify-real-hook/hooks.backup.json
node scripts/install-native-hooks.mjs --install --target ~/.codex/hooks.json --no-backup
ENGLISH_LEARNING_HOME="$PWD/tmp/verify-real-learner" \
  codex exec --dangerously-bypass-hook-trust --enable hooks --ignore-rules --skip-git-repo-check --sandbox read-only \
  --output-last-message tmp/verify-real-hook/last.txt \
  "Reply with OK only."
cp tmp/verify-real-hook/hooks.backup.json ~/.codex/hooks.json
```

Observed:

- Codex completed with `OK`.
- `~/.codex/hooks.json` was restored after the run.
- No files were created under `tmp/verify-real-learner`.
- When hook commands were changed from the already trusted OMX command to a wrapper command, Codex did not report the managed hook as executed.

Interpretation:

The blocker is no longer just hook file merging. The product must understand and handle Codex hook trust state. Existing OMX hooks are trusted in user config; replacing or wrapping them changes the trusted command identity.

## Verdict

PH1-FIX-1 is **not complete**.

Proceeding requirements:

1. Determine the supported way to trust a newly installed native hook command in current Codex.
2. Avoid breaking existing trusted OMX hooks.
3. Prove `ENGLISH_LEARNING_HOME` files are created by a real Codex hook event, not only direct script execution.
4. If trust-state automation is unsupported, document an explicit command wrapper fallback instead of claiming native hook installation.
