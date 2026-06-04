#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-capture");
const learnerRoot = resolve(smokeRoot, "learner");
const startDate = new Date("2026-06-01T09:00:00.000Z");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isoDay(offset) {
  const date = new Date(startDate.getTime());
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString();
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

function readState() {
  return JSON.parse(readFileSync(resolve(learnerRoot, "pilot-state.json"), "utf8"));
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

  const baselineCards = [
    ["today_snapshot", "I made coffee and checked my schedule today."],
    ["meaning_check", "Which place do you mean?"],
    ["stuck_rescue", "I do not know the exact word, but I mean the small meeting room."],
    ["scene_snap", "I am in an office with desks, monitors, and notebooks."],
    ["comfort_check", "My comfort score is 2 because I still pause a lot."],
  ];

  for (let index = 0; index < baselineCards.length; index += 1) {
    const [cardId, answer] = baselineCards[index];
    const capture = runJson([
      "scripts/english-learning-harness.mjs",
      "pilot-capture",
      "--phase",
      "baseline",
      "--card-id",
      cardId,
      "--date",
      isoDay(0),
      "--say",
      answer,
      ...(index === baselineCards.length - 1 ? ["--comfort-rating", "2"] : []),
      "--json",
    ]);
    assert(capture.action === "pilot-capture", `baseline capture ${index + 1} action mismatch`);
    assert(capture.phase === "baseline", `baseline capture ${index + 1} phase mismatch`);
    assert(capture.capturedCount === index + 1, `baseline capture ${index + 1} count mismatch`);
    assert(capture.committed === (index === baselineCards.length - 1), `baseline capture ${index + 1} commit mismatch`);
    assert(capture.cockpit?.htmlPath && existsSync(capture.cockpit.htmlPath), `baseline capture ${index + 1} cockpit missing`);
    assert(capture.cockpit.activePilot, `baseline capture ${index + 1} should expose active pilot cockpit snapshot`);
    if (index === 0) {
      const firstState = readState();
      assert(firstState.consent.scope === "local-only", "first saved pilot answer should record local-only consent scope");
      assert(firstState.consent.accepted_at === isoDay(0), "first saved pilot answer should timestamp consent");
    }
  }

  const afterBaseline = readState();
  assert(afterBaseline.baseline?.transcript?.length === 5, "baseline should commit after five captured cards");
  assert(afterBaseline.status === "in_progress", "pilot should be in progress after captured baseline");
  assert(afterBaseline.partial.baseline.answers.length === 5, "partial baseline answers should remain auditable");

  const dayCapture = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-capture",
    "--phase",
    "day",
    "--day",
    "1",
    "--date",
    isoDay(1),
    "--say",
    "Could you tell me which place you mean before I choose the subway exit?",
    "--friction-note",
    "One-card capture made the daily pilot easier to resume.",
    "--json",
  ]);
  assert(dayCapture.committed === true, "daily capture should commit through pilot-day");
  assert(dayCapture.result.day.aios_artifacts.next_asset_action?.asset_id, "daily capture should preserve next asset action");
  assert(dayCapture.cockpit?.htmlPath && existsSync(dayCapture.cockpit.htmlPath), "daily capture should refresh cockpit");

  const finalStatus = runJson(["scripts/english-learning-harness.mjs", "pilot-status", "--json"]);
  assert(finalStatus.summary.partial.baselineAnswers === 5, "status should expose partial baseline count");
  assert(finalStatus.summary.completedDailySessions === 1, "status should count committed daily capture");
  assert(existsSync(resolve(learnerRoot, "pilot-state.json")), "pilot state should exist");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-12",
        learnerRoot,
        baselineAnswers: finalStatus.summary.partial.baselineAnswers,
        completedDailySessions: finalStatus.summary.completedDailySessions,
        claimBoundary:
          "This validates durable card-level pilot capture mechanics only. It does not run the real owner/self pilot.",
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
