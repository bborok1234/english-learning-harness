#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/personal-learner-cockpit-active-pilot");
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
  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--name",
    "owner self participant",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-reply",
    "--say",
    "I worked on a small plan and had coffee today.",
    "--json",
  ]);

  const cockpit = runJson([
    "scripts/english-learning-harness.mjs",
    "cockpit",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(existsSync(cockpit.cockpitPath), "cockpit HTML missing");
  assert(existsSync(cockpit.cockpitStatePath), "cockpit state missing");
  const state = JSON.parse(readFileSync(cockpit.cockpitStatePath, "utf8"));
  assert(state.active_pilot?.status === "awaiting_baseline", "cockpit should expose active pilot state");
  assert(state.active_pilot.partial.baseline_answers === 1, "cockpit should show captured baseline count");
  assert(state.active_pilot.next_card.card_id === "meaning_check", "cockpit should point to the next Day 0 card");
  assert(state.active_pilot.learner_prompt.includes("어디에서 만나자는 뜻인지"), "cockpit should show learner-facing next prompt");
  assert(state.active_pilot.latest_reply_card?.html === "artifacts/pilot/pilot-reply-card.html", "cockpit should link latest reply card HTML");
  assert(state.active_pilot.latest_reply_card?.json === "artifacts/pilot/pilot-reply-card.json", "cockpit should link latest reply card JSON");
  assert(existsSync(resolve(learnerRoot, state.active_pilot.latest_reply_card.html)), "latest reply card HTML missing");
  assert(state.files.active_pilot_state === "pilot-state.json", "cockpit should link local pilot state file");

  const html = readFileSync(cockpit.cockpitPath, "utf8");
  assert(html.includes("진행 중인 owner pilot"), "cockpit HTML missing active pilot section");
  assert(html.includes("어디에서 만나자는 뜻인지"), "cockpit HTML missing next pilot prompt");
  assert(html.includes("방금 저장된 답변 카드"), "cockpit HTML should expose saved reply card link");
  assert(html.includes("pilot-reply-card.html"), "cockpit HTML should link reply card");
  for (const forbidden of ["pilot-capture", "pilot-reply ", "pilot-start", "product_journey_audit", "PR #", "issue #"]) {
    assert(!html.includes(forbidden), `active pilot cockpit leaked internal term: ${forbidden}`);
  }

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-12",
        learnerRoot,
        cockpitPath: cockpit.cockpitPath,
        baselineAnswers: state.active_pilot.partial.baseline_answers,
        nextCard: state.active_pilot.next_card.card_id,
        claimBoundary:
          "This validates active pilot visibility in the learner cockpit only. It does not run the real owner/self pilot.",
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
