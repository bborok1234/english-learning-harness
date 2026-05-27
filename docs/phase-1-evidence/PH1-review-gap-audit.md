# PH1 Review Gap Audit

Date: 2026-05-27
Reviewer: Codex self-review

Verdict: first usable version is **not fully proven**. Previous completion claim was too broad.

## Review Scope

The stated goal requires a repo-local Codex plugin/harness that proves:

- text/transcription-first daily English session flow,
- onboarding/profile setup,
- mini mirror,
- local learner data store under `~/english-learning` or `ENGLISH_LEARNING_HOME`,
- `progress.json` v2 updates for the five MVP metrics,
- journal/artifact persistence,
- setup-owned/native hook installation and runtime behavior,
- local marketplace packaging/install smoke,
- user-facing README/setup guidance,
- shared SSOT dashboard updates,
- full first-run-to-daily-session smoke evidence.

## Findings

### P1 — Native hook installation is not actually proven in Codex runtime

`scripts/install-native-hooks.mjs` writes a standalone hooks config to a target path, but does not merge or install it into an existing `~/.codex/hooks.json`.

Attempted isolated Codex runtime check:

```bash
rm -rf tmp/review-hook-codex-home tmp/review-hook-learner
mkdir -p tmp/review-hook-codex-home
node scripts/install-native-hooks.mjs --target tmp/review-hook-codex-home/hooks.json
ENGLISH_LEARNING_HOME="$PWD/tmp/review-hook-learner" \
CODEX_HOME="$PWD/tmp/review-hook-codex-home" \
codex exec --dangerously-bypass-hook-trust --enable hooks --ignore-rules --skip-git-repo-check --sandbox read-only "Reply with OK only."
```

The run failed before completion with auth errors in isolated `CODEX_HOME`, and no learner files were created under `tmp/review-hook-learner`.

Impact: hook scripts work when directly invoked, but setup-owned/native hook behavior is not proven end-to-end in Codex.

### P1 — Vocabulary metric overcounts repeated words as new

Adversarial multi-session check:

```bash
rm -rf tmp/review-multisession
node scripts/english-learning.mjs init --learner-root tmp/review-multisession --name Test --json
node scripts/english-learning.mjs session --learner-root tmp/review-multisession --input "I like coffee." --json
node scripts/english-learning.mjs session --learner-root tmp/review-multisession --input "I like coffee." --json
node scripts/english-learning.mjs status --learner-root tmp/review-multisession --json
```

Observed:

```json
{
  "new_vocab": 6,
  "sessions": [3, 3]
}
```

The same sentence counted three "new" vocabulary items twice.

Impact: `new_vocabulary_count` does not yet represent new vocabulary over time.

### P2 — Daily session is a transcript processor, not yet a convincing Codex conversation surface

`scripts/english-learning.mjs session` accepts `--input` and `--transcript`, generates deterministic turns, and persists output. This verifies persistence mechanics, but it does not prove an actual Codex-assisted conversational loop using the plugin skills.

Impact: "daily English session flow" exists mechanically, but the user-facing conversation experience is still thin.

### P2 — Stop hook does not perform session finalization

`hooks/english-learning-hook.mjs Stop` currently writes only `last_stop_at`. The real session finalization lives in `scripts/english-learning.mjs session`.

Impact: the claimed Stop/update path is not true as hook behavior. It is true only for the explicit session command.

### P2 — README setup path is developer-oriented and incomplete for real installation

README shows how to generate a hook config and local marketplace package, but it does not provide a safe merge/install flow for an existing `~/.codex/hooks.json`, nor a clear "run this once" setup command.

Impact: a developer can inspect and run scripts, but a normal first-use setup remains too manual.

## What Is Still Valid

- Local store creation works.
- `progress.json` v2 shape validation works.
- Session artifact and journal persistence work.
- Local marketplace packaging/install works in an isolated `CODEX_HOME`.
- Installed package scripts can run after packaging.
- Realtime voice and public Git-backed install are correctly treated as future work.

## Required Follow-up

- PH1-FIX-1: Implement safe native hook installer/merger plus isolated verification that proves Codex reads it.
- PH1-FIX-2: Track known vocabulary and compute `new_vocabulary_count` against historical learner vocabulary.
- PH1-FIX-3: Strengthen the daily-session UX so it is a real plugin/harness flow, not only a transcript persistence smoke.
- PH1-FIX-4: Align Stop hook claims with actual behavior or implement hook finalization.
- PH1-FIX-5: Update README to one clear first-run setup path.
