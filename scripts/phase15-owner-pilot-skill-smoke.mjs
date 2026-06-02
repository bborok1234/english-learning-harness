#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const skill = readFileSync(resolve(repoRoot, "skills/owner-pilot/SKILL.md"), "utf8");
  const setup = readFileSync(resolve(repoRoot, "setup"), "utf8");
  const installSmoke = readFileSync(resolve(repoRoot, "scripts/phase7-agent-install-smoke.mjs"), "utf8");

  for (const required of [
    "name: english-owner-pilot",
    "Codex conversation as the product surface",
    "Do not ask the learner to run `node`",
    "Use that engine yourself. Do not hand the command to the learner.",
    "pilot-next",
    "artifacts/pilot/pilot-next-card.html",
    "ask the five Day 0 mission cards one at a time",
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

  for (const forbidden of [
    "run this command yourself",
    "copy this command",
    "proves fluency",
    "native speaker",
    "guaranteed improvement",
  ]) {
    assert(!skill.toLowerCase().includes(forbidden), `owner pilot skill leaked forbidden phrase: ${forbidden}`);
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
