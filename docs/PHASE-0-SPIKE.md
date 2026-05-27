# Phase 0 Spike Plan

Last updated: 2026-05-27
Owner: Codex + user
Status: Ready to execute

## Purpose

Phase 0 exists to prevent premature implementation.

The product design depends on four runtime assumptions:

1. A short Codex realtime voice conversation can feel natural enough for a 5-minute daily English session.
2. Codex hooks can reliably inject learner context, update local progress, enforce voice limits, and preserve state across compaction.
3. The plugin can be distributed and installed through a verified current Codex CLI path.
4. Image generation and local learner-data persistence can work without breaking the local-first product promise.

Until these are verified, the project remains **pre-implementation**.

## Evidence Rules

Every spike must leave a small evidence note under `docs/phase-0-evidence/`.

Each evidence note must include:

- Date and environment.
- Exact command or manual action.
- Observed result.
- Verdict: `pass`, `fail`, or `blocked`.
- Decision impact: proceed, redesign, defer, or fallback.

Do not update implementation docs from memory. Update `docs/project-state.json` only after the evidence note exists.

## Spike Board

| ID | Spike | Why it matters | Pass condition | Fail / fallback decision | Evidence file |
|---|---|---|---|---|---|
| P0-1 | Realtime conversational mode | Daily 5-minute voice conversation is the core experience. | A short English session can run with acceptable latency, turn-taking, and interruption behavior. | If latency is consistently above 2s or interaction is awkward, MVP defaults to transcription/text-first mode. | `docs/phase-0-evidence/P0-1-realtime.md` |
| P0-2 | Hook availability and registration | Context injection, progress update, voice guard, and compaction safety depend on hooks. | SessionStart, Stop, PreToolUse, and PreCompact are either verified or a documented replacement exists. | If plugin hook registration is unavailable, use setup-owned hooks or explicit command wrappers; do not assume manifest auto-registration. | `docs/phase-0-evidence/P0-2-hooks.md` |
| P0-3 | Plugin distribution path | Users need one reproducible install path. | A clean install path is reproduced using current Codex CLI behavior. | If GitHub direct install is unavailable, use a local/Git marketplace path or defer public install until packaging is clear. | `docs/phase-0-evidence/P0-3-plugin-distribution.md` |
| P0-4 | Image generation + local persistence | Picture description and learner-owned data are part of the MVP promise. | Generated artifacts and progress updates can be saved under a local learner directory with predictable paths. | If image generation is unavailable, Picture description becomes text/image-input only; if persistence is unreliable, implementation stops. | `docs/phase-0-evidence/P0-4-image-local-persistence.md` |

## P0-1 — Realtime Conversational Mode

### Scope

Verify the minimum viable daily voice loop:

- Learner speaks a short English phrase.
- Assistant responds in voice or voice-like conversational mode.
- Learner can pause, interrupt, or recover without the session becoming stressful.
- The flow can fit a 5-minute low-pressure session.

### Test Script

Use a tiny learner scenario:

```text
Learner: I like coffee.
Assistant: Ask one gentle follow-up. No correction.
Learner: Today morning coffee.
Assistant: Recast naturally but do not explain grammar.
```

### Measurements

- Time from learner stop to assistant response.
- Whether interruption/turn-taking works.
- Whether Korean fallback is possible.
- Whether the experience feels safe enough for high-anxiety learners.

### Pass

- Most turns respond within roughly 2 seconds.
- The session can continue for 3-5 turns without manual repair.
- Recast works without explicit correction.

### Fail / fallback

- If response latency is consistently above 2 seconds, mark realtime as not MVP-default.
- If turn-taking is brittle, use push-to-talk transcription or text-first mode.
- If voice usage cannot be measured, track local audio duration with an approximate counter.

## P0-2 — Hook Availability and Registration

### Scope

Verify the hook surfaces that the design depends on:

- `SessionStart`: create/read `~/english-learning/`, inject profile/progress/last handoff.
- `Stop`: write journal, update `progress.json`, compute next notification text.
- `PreToolUse`: deny or soften voice calls when daily limit is reached.
- `PreCompact`: re-inject learner identity, recent weaknesses, and baseline in long sessions.

### Test Shape

Each hook gets a minimal harmless fixture:

- Input JSON fixture.
- Script prints or writes a deterministic marker.
- Expected output is checked by command output or a file under a temporary learner directory.

### Pass

- The hook can be registered through the intended plugin/setup path, or an explicit supported fallback path is documented.
- Each hook can be triggered or simulated with a local fixture.
- Failure behavior is visible, not silent.

### Fail / fallback

- If plugin hook registration is not available, do not block the entire product; use setup-owned hooks or explicit wrapper commands for Phase 0.
- If `PreCompact` does not exist, use UserPromptSubmit or SessionStart state reinjection as D104 fallback.

## P0-3 — Plugin Distribution Path

### Scope

Verify the install path for a future user-facing README.

Known current evidence:

- Local CLI: `codex-cli 0.133.0`.
- `codex plugin add` installs from configured marketplace snapshots.
- Direct `codex /plugins install <url>` is not verified and must not be documented as fact.

### Test Shape

1. Create the smallest valid plugin skeleton in a disposable fixture.
2. Configure a local marketplace or Git marketplace if required by current CLI.
3. Install the plugin into an isolated Codex config/home if possible.
4. Confirm Codex lists the installed plugin.

### Pass

- There is a reproducible command sequence from clean config to installed plugin.
- The README one-liner can be written without hand-waving.

### Fail / fallback

- If marketplace setup is required, document the two-step install instead of pretending there is a one-liner.
- If plugin packaging cannot be verified locally, Phase 1 scaffold can proceed only as internal prototype, not distributable product.

## P0-4 — Image Generation + Local Persistence

### Scope

Verify the minimal local-first data path:

- Create a temporary learner directory.
- Save profile/progress skeleton.
- Produce or simulate one generated image artifact.
- Update progress with the MVP five metrics.

### Test Directory

Use a disposable path, not real learner data:

```text
tmp/phase-0-learner/
├── profile.md
├── progress.json
├── journal/
└── artifacts/images/
```

### Pass

- Files are created under the learner directory only.
- `progress.json` stays version 2.
- Only the MVP five session metrics are updated for the session.
- Image artifact path is predictable and referenced from the journal or session record.

### Fail / fallback

- If image generation is unavailable, keep Picture description as image-input/text-only in MVP.
- If local persistence fails or leaks outside the learner directory, stop implementation until fixed.

## Execution Order

Run in this order:

1. P0-3 Plugin distribution path.
2. P0-2 Hook availability and registration.
3. P0-4 Image generation + local persistence.
4. P0-1 Realtime conversational mode.

Reason: plugin and hook constraints can change the implementation shape. Voice should be tested last because it may require manual interaction and is easiest to downgrade.

## Exit Criteria

Phase 0 is complete when:

- All four evidence files exist.
- Each spike has verdict `pass`, `fail`, or `blocked`.
- `docs/project-state.json` reflects the outcome.
- `docs/dashboard.html` is regenerated.
- `DESIGN.md` open questions are updated or closed.

Implementation may start only if:

- Plugin/hook/local persistence path is at least internally viable.
- Any failed realtime/image feature has an accepted fallback.
- No blocker contradicts the product north star.
