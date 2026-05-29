# Agent Harness Onboarding Benchmark

Last updated: 2026-05-29

Benchmarks:

- `code-yeongyu/oh-my-openagent`: https://github.com/code-yeongyu/oh-my-openagent
- `garrytan/gstack`: https://github.com/garrytan/gstack

## What They Do

### oh-my-openagent

- Positions the project as an agent harness, not a script library.
- Human install path is an agent prompt: paste an instruction into the LLM agent and let the agent fetch the install guide.
- Manual install is treated as an alternative path.
- Ships an installer and doctor flow.
- Exposes memorable workflow words such as `ultrawork`.
- Separates agent-facing installation instructions from reference documentation.
- Has multilingual README surfaces and social proof, but the key product mechanic is still agent-operated setup.

### gstack

- Leads with a strong narrative and a concrete "what happens after install" workflow.
- Human install path is also an agent prompt: paste one instruction into Claude Code and let Claude run setup.
- `setup` installs skills into host-specific locations, including Codex via `--host codex`.
- Supports team/repo bootstrap so a project can require or recommend the harness for collaborators.
- Uses slash-command workflows and natural-language routing rather than making users operate internals.
- Keeps scripts/binaries as infrastructure behind skills.
- Includes troubleshooting, upgrade, uninstall, telemetry, and browser/runtime support as first-class product surfaces.

## Implications For English Learning Harness

The main public path should not be:

```text
clone repo -> cd repo -> run node scripts
```

The main public path should be:

```text
paste install prompt into Codex -> Codex installs skills -> learner talks to Codex every day
```

The local command wrapper remains useful, but only as:

- the internal persistence engine Codex runs,
- maintainer/debug surface,
- smoke-test surface,
- fallback path when agent skill installation fails.

## Required Product Shape

- README first screen gives an agent install prompt.
- Setup script installs skills into `~/.codex/skills`.
- Skills include engine-discovery rules and tell Codex not to hand `node` commands to learners.
- Public clone smoke can keep proving the engine, but it must not define the learner UX.
- Dashboard/status must describe the public surface as agent-installed Codex practice, not manual repo execution.

## Current Local Adaptation

- `setup --host codex` installs the four English Learning Harness skills into `~/.codex/skills`.
- README top path is now paste-into-Codex install.
- `scripts/phase7-learner-readme-smoke.mjs` rejects human clone/download framing as the primary path.
