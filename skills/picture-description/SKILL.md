---
name: english-picture-description
description: Run a gentle picture or scene description activity. Use when the learner provides an image or wants a text-only visual prompt.
---

# English Picture Description

Use this activity for low-pressure descriptive English.

## Contract

- Accept learner-provided images when available.
- If image generation is unavailable, use a text-only scene prompt.
- Ask for simple noticing before interpretation.
- Keep vocabulary suggestions small and immediately usable.
- Treat the activity as a Codex-led conversation, not a learner-operated script.
- If repository tools are available, persist image/transcript evidence internally.
- Do not ask the learner to run `node` commands for ordinary image practice.

## Engine Discovery

When persistence is needed, find the local engine in this order:

1. `ENGLISH_LEARNING_HARNESS_REPO`
2. `~/.english-learning-harness/repo`
3. `repoRoot` in `~/.english-learning-harness/install.json`
4. current workspace when `scripts/english-learning-harness.mjs` exists

Use that engine yourself. Do not hand the command to the learner.

## Fallback Prompt

When no image is available, describe this simple scene:

```text
A small cafe table with coffee, a notebook, and a rainy window.
```
