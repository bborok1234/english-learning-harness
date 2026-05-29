# M7-16 Agent-Installed Harness Onboarding Evidence

Issue: #122
Decision: pivot

## Benchmark

Compared:

- `code-yeongyu/oh-my-openagent`
- `garrytan/gstack`

The relevant pattern is not manual repository operation. Both projects make the agent the installer/operator: the human pastes an install prompt, the agent installs the harness, and the resulting product surface is skill/slash/natural-language workflow invocation.

## Change

- Added `setup --host codex`, which installs the four English Learning Harness skills into `~/.codex/skills`.
- Added isolated setup smoke coverage so skill installation can be verified without touching a real user home.
- Reframed README first use as "paste this into Codex" instead of "clone/download this repo".
- Added `docs/BENCHMARK-HARNESS-TRENDS.md` as the repo-local benchmark note.
- Updated skill instructions with engine-discovery order so Codex can operate the local engine internally.

## Verification

```bash
node scripts/phase7-learner-readme-smoke.mjs
node scripts/phase7-agent-install-smoke.mjs
node scripts/phase7-open-source-readiness-smoke.mjs
node scripts/phase6-public-clean-clone-smoke.mjs
node scripts/phase6-marketplace-install-smoke.mjs
node scripts/phase1-scaffold-smoke.mjs
```

## Boundary

This adds an agent-installed Codex skill path and aligns public onboarding with current harness practice. It does not publish an npm/binary installer, prove public Git-backed plugin installation, prove realtime voice, or prove real learner outcomes.
