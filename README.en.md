# English Learning Harness

[한국어](README.md) | [English](README.en.md)

Codex-native English conversation practice harness for Korean learners.

North star: **become comfortable speaking English with an AI partner.**

This is not a learner-facing Node CLI. The learner-facing surface is Codex conversation: paste one install prompt into Codex, Codex installs the skills, and daily practice happens through natural language.

## Paste Into Codex

Replace the bracketed lines with your own details.

```text
Install English Learning Harness from:
https://github.com/bborok1234/english-learning-harness

Use the repo setup script to install the Codex skills, then start my first 5-minute English speaking practice.
Do not ask me to clone the repo or run Node commands manually. You operate the harness and local engine for me.

My name is [your name].
I struggle with [what feels hard when speaking English].
Please help me with [correction style or learning goal].
```

Codex should install the skill surface, handle setup, run practice, save local progress, and finish with a mini mirror. The learner answers Codex in English instead of operating scripts.

## What It Does

- creates or refreshes a learner profile
- asks one low-pressure question at a time
- keeps correction gentle during practice
- lets Codex run the daily practice engine internally after the learner answers, refreshing mission, evidence, report, and cockpit surfaces together
- starts first practice from a concrete everyday conversation scene instead of repository or command explanations
- saves local session evidence
- tracks concrete speaking weaknesses in a personal speaking backlog
- turns the next session into a targeted drill and transfer test
- remembers useful phrases and repair attempts
- suggests due review and next scenarios
- generates mini mirrors and weekly mirrors
- generates interactive daily mission HTML with text, voice-transcript, and image information-gap practice modes
- generates scene/timeline artifacts that turn the daily mission into speaking cues, repair, and transfer checkpoints
- generates 7-day/30-day learner reports that connect sessions, saved phrases, speaking backlog, and next focus

## Learning Basis

The harness is not designed as generic English chat. Its learning loop is grounded in output practice, interaction repair, corrective feedback, retrieval practice, and task-based conversation. See [docs/RESEARCH-BASIS.md](docs/RESEARCH-BASIS.md) for the source-to-feature map and claim boundaries.

## Learner Data

Local learner state defaults to:

```text
~/english-learning/
```

Key generated learner surfaces include `cockpit.html`, daily mission artifacts under `artifacts/missions/`, scene artifacts under `artifacts/scenes/`, and learner reports under `artifacts/reports/`.

The command wrapper remains the internal persistence and verification engine for Codex, maintainers, and smoke tests. See the Korean README for full maintainer commands and current boundaries.

## Current Boundaries

- Realtime voice is not the default path yet.
- Accent scoring is not implemented.
- Public Git-backed install remains unverified.
- Real learner improvement still needs real multi-day use, not only fixture smokes.
