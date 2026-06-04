#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const skill = readFileSync(resolve(repoRoot, "skills/owner-pilot/SKILL.md"), "utf8");
  const pilotPrompts = readFileSync(resolve(repoRoot, "docs/PILOT-PROMPTS.md"), "utf8");
  const setup = readFileSync(resolve(repoRoot, "setup"), "utf8");
  const installSmoke = readFileSync(resolve(repoRoot, "scripts/phase7-agent-install-smoke.mjs"), "utf8");

  for (const required of [
    "name: english-owner-pilot",
    "Codex conversation as the product surface",
    "Do not ask the learner to run `node`",
    "Use that engine yourself. Do not hand the command to the learner.",
    "pilot-run-sheet",
    "Use it to confirm the next prompt, save boundary, consent status, privacy rules, launch card, and cockpit links.",
    "pilot-handoff",
    "Use it to see saved progress counts, the next learner-facing prompt, consent status, and local links without exposing transcript text or friction notes.",
    "pilot-turn",
    "Use `learnerTurn.say` as the only learner-facing prompt.",
    "Use `operatorOnly` only to decide how to save a numbered choice or direct English sentence after the learner answers.",
    "pilot-evidence-gap",
    "Use it to inspect required vs collected Day 0, daily, final, friction, local report, and direction-decision evidence counts.",
    "pilot-launch",
    "Use this as the safest start/resume surface.",
    "pilot-next",
    "pilot-reply",
    "Do not ask the learner to choose a phase, card id, or day number.",
    "pilot-friction",
    "It must not create another learner answer, duplicate a daily session, or expose the friction note text in learner-facing confirmation surfaces.",
    "local next-card artifact",
    "첫 장면 고르기",
    "scene_choices",
    "show the learner the choices in plain Korean",
    "If the learner answers `1`, `2`, `3`, or a quick-reply id",
    "pilot-capture",
    "pilot-start",
    "pilot-day",
    "pilot-finish",
    "The fifth captured card automatically commits",
    "mission, scene, asset deck, learner report, cockpit",
    "Fixture smokes prove mechanics only",
    "Never close or claim the real pilot from fixture data",
    "continue, research, pivot, kill_claim, or invalid",
  ]) {
    assert(skill.includes(required), `owner pilot skill missing: ${required}`);
  }

  for (const required of [
    "### 1. 첫 장면 고르기",
    "1. 일상 장면",
    "2. 작은 모험",
    "3. 편한 공간",
    "I just arrived, and this place feels new to me.",
  ]) {
    assert(pilotPrompts.includes(required), `pilot prompt contract missing: ${required}`);
  }

  for (const forbidden of [
    "run this command yourself",
    "copy this command",
    "proves fluency",
    "native speaker",
    "guaranteed improvement",
  ]) {
    assert(!skill.toLowerCase().includes(forbidden), `owner pilot skill leaked forbidden phrase: ${forbidden}`);
  }

  for (const stale of [
    '첫 질문: 친구가 "오늘 뭐 했어?"',
    "ask the five Day 0 mission cards one at a time",
    "today_snapshot",
  ]) {
    assert(!skill.includes(stale), `owner pilot skill still contains stale fixed-start text: ${stale}`);
  }

  assert(setup.includes("english-learning-owner-pilot"), "setup should install owner pilot skill");
  assert(installSmoke.includes("english-learning-owner-pilot"), "agent install smoke should expect owner pilot skill");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-12",
        skill: "english-owner-pilot",
        claimBoundary:
          "This validates the Codex-facing pilot skill contract only. It does not run the real owner/self pilot.",
      },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (error) {
  console.error(
    JSON.stringify(
      {
        status: "fail",
        issue: "AIOS-12",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
