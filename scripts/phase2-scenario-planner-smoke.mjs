#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-2-scenario-planner");
const learnerRoot = resolve(smokeRoot, "learner");
const learnerModelPath = resolve(learnerRoot, "learner-model.json");
const reviewQueuePath = resolve(learnerRoot, "review-queue.json");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  const output = execFileSync("node", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return JSON.parse(output);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function makeDueReviewAndStretchState() {
  const reviewQueue = readJson(reviewQueuePath);
  assert(reviewQueue.items.length === 1, "expected one review item from first session");
  reviewQueue.items[0].due_at = "2026-05-27T00:00:00.000Z";
  writeJson(reviewQueuePath, reviewQueue);

  const learnerModel = readJson(learnerModelPath);
  learnerModel.baseline.average_utterance_words = 12;
  learnerModel.interaction_skills.starts.evidence_count = 5;
  learnerModel.interaction_skills.repair.evidence_count = 0;
  learnerModel.interaction_skills.clarification.evidence_count = 2;
  learnerModel.interaction_skills.follow_ups.evidence_count = 2;
  learnerModel.interaction_skills.soft_disagreement.evidence_count = 2;
  writeJson(learnerModelPath, learnerModel);

  return reviewQueue.items[0];
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  const setup = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Hyewon",
    "--topics-to-avoid",
    "coffee",
    "--json",
  ]);
  assert(setup.status === "pass", "setup failed");

  const firstSession = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--say",
    "Tea helps me focus.",
    "--json",
  ]);
  assert(firstSession.status === "pass", "first session failed");
  assert(firstSession.scenario.id !== "coffee-small-talk", "planner used an avoided coffee topic");
  assert(
    firstSession.scenario.selection_reason.avoided_topics.includes("coffee"),
    "selection reason did not record avoided topic",
  );

  const dueItem = makeDueReviewAndStretchState();

  const plannedSession = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--say",
    "I don't know how to say it, but tea good.",
    "--json",
  ]);
  assert(plannedSession.status === "pass", "planned session failed");
  assert(plannedSession.scenario.mode === "stretch", "planner did not choose stretch mode");
  assert(plannedSession.scenario.due_review.id === dueItem.id, "planner did not embed due review item");
  assert(plannedSession.scenario.goal.includes(dueItem.text), "scenario goal did not include due phrase");
  assert(plannedSession.scenario.selection_reason.source === "due-review", "selection source mismatch");
  assert(plannedSession.scenario.selection_reason.weak_skill === "repair", "weak skill mismatch");
  assert(
    plannedSession.scenario.selection_reason.due_review_phrase === dueItem.text,
    "selection reason missing due phrase",
  );

  const artifact = readJson(plannedSession.artifactPath);
  assert(artifact.scenario.selection_reason.source === "due-review", "artifact missing selection reason");
  assert(artifact.turns[0].text.includes("Saved phrase:"), "opening did not show saved phrase");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        avoidedScenario: firstSession.scenario.id,
        plannedScenario: plannedSession.scenario.id,
        mode: plannedSession.scenario.mode,
        selectionReason: plannedSession.scenario.selection_reason,
      },
      null,
      2,
    ),
  );
}

main();
