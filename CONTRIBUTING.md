# Contributing

English Learning Harness is an open-source, local-first English speaking practice harness for Codex users.

## Good First Contributions

- Improve learner-facing copy in `README.md`, skills, or docs.
- Add or tighten smoke tests under `scripts/`.
- Improve scenario fixtures, review prompts, and weekly mirror output.
- Improve setup diagnostics without adding external services.

## Development Setup

```bash
git clone https://github.com/bborok1234/english-learning-harness.git
cd english-learning-harness
node scripts/english-learning-harness.mjs setup --json
node scripts/phase1-command-wrapper-smoke.mjs
```

Use `ENGLISH_LEARNING_HOME` or `--learner-root` when testing so you do not overwrite your personal learner data.

## Pull Request Expectations

- Keep changes focused and explain the learner-facing impact.
- Add or update a smoke test for behavior changes.
- Update `docs/project-state.json` and regenerate `docs/dashboard.html` when changing project status.
- Do not commit learner data, local media, credentials, `.omx/`, `tmp/`, or generated local artifacts.

## Project Boundaries

- The first-use path is the explicit command wrapper.
- Native hooks are optional and must not be required for a fresh learner.
- Realtime voice, public Git-backed plugin install, and real learner outcome claims require separate proof before being advertised.

## Local Verification

Run the narrow smoke for your change first. For a broader check:

```bash
node scripts/phase1-scaffold-smoke.mjs
node scripts/phase7-open-source-readiness-smoke.mjs
```
