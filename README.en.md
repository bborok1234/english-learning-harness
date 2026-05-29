# English Learning Harness

[한국어](README.md) | [English](README.en.md)

Codex-native English conversation practice harness for Korean learners.

North star: **become comfortable speaking English with an AI partner.**

This is not a learner-facing Node CLI. The learner-facing surface is Codex conversation: paste one install prompt into Codex, Codex installs the skills, and daily practice happens through natural language.

## Paste Into Codex

```text
Install English Learning Harness from:
https://github.com/bborok1234/english-learning-harness

Use the repo setup script to install the Codex skills, then start my first 5-minute English speaking practice.
Do not ask me to clone the repo or run Node commands manually. You operate the harness and local engine for me.

My name is Jieun.
I freeze when I need to speak English.
I want gentle corrections and practical phrases I can reuse.
```

Codex should install the skill surface, handle setup, run practice, save local progress, and finish with a mini mirror. The learner answers Codex in English instead of operating scripts.

## What It Does

- creates or refreshes a learner profile
- asks one low-pressure question at a time
- keeps correction gentle during practice
- saves local session evidence
- remembers useful phrases and repair attempts
- suggests due review and next scenarios
- generates mini mirrors and weekly mirrors

## Learner Data

Local learner state defaults to:

```text
~/english-learning/
```

The command wrapper remains the internal persistence and verification engine for Codex, maintainers, and smoke tests. See the Korean README for full maintainer commands and current boundaries.

## Current Boundaries

- Realtime voice is not the default path yet.
- Accent scoring is not implemented.
- Public Git-backed install remains unverified.
- Real learner improvement still needs real multi-day use, not only fixture smokes.
