---
name: english-onboarding
description: Start or refresh the learner profile for the English Learning Harness. Use when the learner is new, profile.md is missing, or the user asks to set up their English practice preferences.
---

# English Onboarding

Use this skill to create a low-pressure learner profile before daily practice.

## Contract

- Keep the tone calm, Korean-first when helpful, and non-evaluative.
- Do not promise real-person confidence transfer.
- Ask only for information that changes session behavior.
- Store durable profile facts in `profile.md` under the learner directory.
- If repository tools are available, run the local setup engine yourself to persist the profile.
- Do not ask the learner to run `node` commands for ordinary onboarding.
- If tool execution is unavailable, continue conversationally and clearly say persistence is not confirmed yet.

## Engine Discovery

When persistence is needed, find the local engine in this order:

1. `ENGLISH_LEARNING_HARNESS_REPO`
2. `~/.english-learning-harness/repo`
3. `repoRoot` in `~/.english-learning-harness/install.json`
4. current workspace when `scripts/english-learning-harness.mjs` exists

Use that engine yourself. Do not hand the command to the learner.

## Minimum Profile Fields

- preferred name
- primary motivation
- anxiety triggers
- preferred correction style
- familiar topics
- topics to avoid
- session time preference

## Output

End with a short profile summary and the next suggested daily-session prompt.
