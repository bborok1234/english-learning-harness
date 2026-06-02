#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-next-card");
const learnerRoot = resolve(smokeRoot, "learner");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(execFileSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" }));
}

function read(path) {
  return readFileSync(path, "utf8");
}

function assertCleanLearnerHtml(html) {
  for (const forbidden of ["pilot-capture", "pilot-start", "pilot-day", "pilot-finish", "product_journey_audit", "PR #", "issue #"]) {
    assert(!html.includes(forbidden), `learner next card leaked ${forbidden}`);
  }
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  mkdirSync(smokeRoot, { recursive: true });

  const baseline = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-next",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(baseline.nextCard.phase === "baseline", "fresh pilot should ask baseline card");
  assert(existsSync(baseline.htmlPath), "baseline next-card html missing");
  assertCleanLearnerHtml(read(baseline.htmlPath));

  runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-start",
    "--learner-root",
    learnerRoot,
    "--say",
    "I opened the app and practiced one sentence.",
    "--say",
    "Which place do you mean?",
    "--say",
    "Sorry, I made a mistake.",
    "--say",
    "There are desks, chairs, and people working.",
    "--say",
    "I feel okay but a little tired.",
    "--comfort-rating",
    "3",
    "--json",
  ]);

  const day = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-next",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(day.nextCard.phase === "day", "after baseline should ask daily card");
  assert(day.nextCard.day === 1, "daily card should point to day 1");
  assert(read(day.htmlPath).includes("Which place do you mean?"), "daily card should show learner-facing example");
  assertCleanLearnerHtml(read(day.htmlPath));

  runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-day",
    "--learner-root",
    learnerRoot,
    "--day",
    "1",
    "--say",
    "Which place do you mean?",
    "--friction-note",
    "fixture day 1",
    "--json",
  ]);
  const nextDay = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-next",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(nextDay.nextCard.day === 2, "next daily card should advance after completed day");

  const state = JSON.parse(read(nextDay.jsonPath));
  assert(state.cockpit.html === "cockpit.html", "next card should link learner cockpit");
  assert(state.privacy.includes("로컬"), "next card should preserve privacy boundary");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-12",
        learnerRoot,
        htmlPath: nextDay.htmlPath,
        nextPhase: nextDay.nextCard.phase,
        nextDay: nextDay.nextCard.day,
        claimBoundary: "This validates learner-facing pilot next-card generation only. It does not run the real owner/self pilot.",
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
