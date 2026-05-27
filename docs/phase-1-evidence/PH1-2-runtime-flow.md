# PH1-2 Evidence — First-Run Daily Session Runtime

Date: 2026-05-27
Environment:
- macOS local workspace
- Node.js local scripts
- `codex-cli 0.133.0`
- Disposable learner root: `tmp/phase-1-full-flow/learner`

Verdict: pass

## Scope

Verify the first usable product path:

1. Create an onboarding profile.
2. Run a text-first daily session.
3. Generate a mini mirror.
4. Persist session artifact and journal entry.
5. Update `progress.json` v2 with the five MVP metrics.
6. Inject updated profile/progress through the native hook script.
7. Prove packaged hook runtime still works after local marketplace install.

## Commands

```bash
node scripts/phase1-full-flow-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
node scripts/validate-progress.mjs tmp/phase-1-full-flow/learner/progress.json
ENGLISH_LEARNING_HOME="$PWD/tmp/phase-1-installed-hook/learner" \
  node tmp/phase-1-scaffold-smoke/codex-home/plugins/cache/phase1-scaffold/english-learning-harness/0.1.0/hooks/english-learning-hook.mjs SessionStart
```

## Observed Result

Full flow smoke passed:

```json
{
  "status": "pass",
  "learnerRoot": "/Users/mirlim/sidejob/english-learning-harness/tmp/phase-1-full-flow/learner",
  "profilePath": "/Users/mirlim/sidejob/english-learning-harness/tmp/phase-1-full-flow/learner/profile.md",
  "progressPath": "/Users/mirlim/sidejob/english-learning-harness/tmp/phase-1-full-flow/learner/progress.json",
  "journalPath": "/Users/mirlim/sidejob/english-learning-harness/tmp/phase-1-full-flow/learner/journal/2026-05-27.md",
  "artifactPath": "/Users/mirlim/sidejob/english-learning-harness/tmp/phase-1-full-flow/learner/artifacts/sessions/2026-05-27-1779864147185.json",
  "sessionMetrics": {
    "attendance": 1,
    "english_word_ratio": 1,
    "new_vocabulary_count": 5,
    "utterance_word_count": 6,
    "voluntary_speaking_seconds": 5
  }
}
```

Progress validator passed:

```json
{
  "status": "pass",
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

Journal entry contains the learner turns, artifact reference, and mini mirror:

```text
Mode: text-first
Artifact: artifacts/sessions/2026-05-27-1779864147185.json

### Learner turns
- I like coffee.
- Today morning coffee.

### Mini mirror
- 오늘 전달한 것: You communicated a real daily idea: "I like coffee."
- 자연스럽게 바꾸면: I had coffee this morning.
- 다음에 써볼 한 문장: I want to say it a little more naturally.
```

Installed package hook runtime passed:

```text
installed-hook-ok
```

## Decision Impact

The repo now has a first usable local harness path:

- `scripts/english-learning.mjs init`
- `scripts/english-learning.mjs session`
- `scripts/english-learning.mjs status`
- `scripts/install-native-hooks.mjs`
- `scripts/package-local-marketplace.mjs`
- `scripts/phase1-full-flow-smoke.mjs`

Realtime voice and public Git-backed install remain non-blocking future work.
