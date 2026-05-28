# PH1-FIX-3 Scenario Loop And Fixture Harness

Date: 2026-05-28
Status: Pass
GitHub issue: https://github.com/bborok1234/english-learning-harness/issues/13

## Decision

The daily session is now scenario-based instead of a plain transcript processor.

Each session artifact records:

- scenario goal,
- role/context,
- rescue phrase,
- CEFR-style interaction skill,
- tutor turns with small repair prompts,
- mini mirror pattern,
- review phrase,
- retry prompt.

## Why

The product promise is daily speaking practice with repair and reuse. A transcript processor can persist text but does not create a task, pressure, or transfer loop.

## Implementation

Added:

- `scripts/lib/scenario-engine.mjs`
- `scripts/lib/persona-fixtures.mjs`
- `scripts/phase1-scenario-loop-smoke.mjs`
- `scripts/phase1-persona-fixture-smoke.mjs`

Updated session generation so command-wrapper and legacy CLI sessions choose a scenario from profile text or `--scenario`.

## Verification

Commands:

```bash
node scripts/phase1-scenario-loop-smoke.mjs
node scripts/phase1-persona-fixture-smoke.mjs
```

Observed:

- scenario loop smoke selected `creative-opinion`;
- session opening included goal and rescue phrase;
- tutor turn included a small repair prompt;
- session artifact included scenario and mini mirror fields;
- journal included scenario, pattern, review phrase, retry prompt, and artifact reference;
- persona fixture smoke executed four target personas without prohibited claims.

## Claim Boundary

This proves local scenario-loop structure and fixture harness plumbing. It does not prove real-world learning improvement or final persona quality.
