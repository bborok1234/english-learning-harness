# AIOS-24 PR Body Auto-Close Guard

Date: 2026-06-04
Issue: #234
Decision: continue

## Why

`#179` was accidentally closed by a PR body sentence that used a GitHub issue-completion verb in a negated phrase.

The sentence meant the PR did not complete the real owner/self pilot, but GitHub still interpreted the issue-completion verb plus `#179` as an automatic issue close action.

Because `#179` is the active real-pilot blocker, this created a mismatch:

- GitHub showed no open issues.
- Repo-local SSOT and goal audit still said the real pilot was open.
- The engineering dashboard could no longer be trusted as a one-glance progress board.

## What Changed

- `#179` was reopened because real owner/self pilot evidence has not been collected.
- Added `scripts/pr-body-autoclose-guard.mjs`.
- Added `scripts/pr-body-autoclose-guard-smoke.mjs`.
- Updated `.github/PULL_REQUEST_TEMPLATE.md` so protected blocker references avoid GitHub issue-completion verbs in the same sentence.
- Updated `scripts/aios-goal-audit.mjs` so the real-pilot blocker checks GitHub issue state, not only repo-local text.
- Updated `scripts/aios-goal-audit-smoke.mjs` with an override fixture that proves an externally closed `#179` becomes `closed_external_mismatch` and still blocks goal completion.

## Verification

Passed:

```bash
node scripts/pr-body-autoclose-guard-smoke.mjs
node scripts/pr-body-autoclose-guard.mjs --json
node scripts/aios-goal-audit-smoke.mjs
gh issue view 179 --json number,state,title,url
```

Observed GitHub issue state after repair:

```json
{
  "number": 179,
  "state": "OPEN",
  "title": "AIOS-12: Run real owner/self AIOS pilot and journey audit"
}
```

## Safe Wording

Use:

```text
This PR does not complete issue #179.
```

Avoid putting GitHub issue-completion verbs in the same sentence as protected blocker issues.

## Claim Boundary

This is governance and tracker-integrity evidence only.

It does not run the real owner/self pilot, save real learner answers, prove speaking improvement, or complete the active AI-native OS goal.
