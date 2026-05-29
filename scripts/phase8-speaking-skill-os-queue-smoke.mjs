#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-8-speaking-skill-os-queue");
const learnerRoot = resolve(smokeRoot, "learner");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(
    execFileSync("node", args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        ENGLISH_LEARNING_HOME: learnerRoot,
      },
      encoding: "utf8",
    }),
  );
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  runJson(["scripts/english-learning-harness.mjs", "setup", "--name", "Queue Learner", "--json"]);

  const diagnosis = runJson([
    "scripts/english-learning-harness.mjs",
    "diagnose",
    "--say",
    "Could you repeat? I don't know how to say it, but I don't think coffee is good because my stomach hurts.",
    "--json",
  ]);
  assert(diagnosis.status === "pass", "diagnose failed");
  const skills = diagnosis.backlogItems.map((item) => item.skill);
  for (const expected of ["repair", "clarification", "soft_disagreement", "follow_ups"]) {
    assert(skills.includes(expected), `diagnosis missing ${expected}`);
  }
  assert(diagnosis.createdCount >= 4, "diagnosis should create multiple backlog items");

  const backlogBefore = runJson(["scripts/english-learning-harness.mjs", "backlog", "--json"]);
  assert(backlogBefore.itemCount >= 4, "backlog should contain multiple items");
  assert(backlogBefore.nextItem.skill === "repair", "repair should be first high-priority queue item");

  const repairPass = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--say",
    "I don't know how to say it, but coffee makes my stomach hurt.",
    "--json",
  ]);
  assert(repairPass.speakingBacklogEvidence?.result === "pass", "repair transfer should pass");

  const dailyAfterRepair = runJson(["scripts/english-learning-harness.mjs", "daily", "--json"]);
  assert(
    dailyAfterRepair.cockpit.speaking_os.next_item.skill === "clarification",
    "daily should advance to clarification after repair passes",
  );

  const clarificationFail = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--say",
    "I answer with one sentence only.",
    "--json",
  ]);
  assert(
    clarificationFail.speakingBacklogEvidence?.result === "needs_review",
    "clarification should remain needs_review when no clarification attempt appears",
  );

  const backlogAfter = runJson(["scripts/english-learning-harness.mjs", "backlog", "--json"]);
  assert(backlogAfter.items.some((item) => item.skill === "repair" && item.status === "passed"), "repair should stay passed");
  assert(
    backlogAfter.nextItem.skill === "clarification" && backlogAfter.nextItem.status === "needs_review",
    "failed clarification should stay at the front of the unresolved queue",
  );

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M8-2",
        learnerRoot,
        diagnosedSkills: skills,
        nextItem: backlogAfter.nextItem,
        claimBoundary:
          "This proves heuristic multi-skill queue mechanics only. It does not certify speaking ability.",
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
        issue: "M8-2",
        error: error.message,
        claimBoundary:
          "A failing queue smoke means Speaking Skill OS cannot yet manage multiple unresolved skills.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
