#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-2-review-vault");
const learnerRoot = resolve(smokeRoot, "learner");
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

function makeFirstItemDue() {
  const reviewQueue = readJson(reviewQueuePath);
  assert(reviewQueue.items.length === 1, "expected one scheduled review item");
  reviewQueue.items[0].due_at = "2026-05-27T00:00:00.000Z";
  writeJson(reviewQueuePath, reviewQueue);
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
    "Jieun",
    "--json",
  ]);
  assert(setup.status === "pass", "setup failed");

  runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--say",
    "I like coffee.",
    "--json",
  ]);

  const vault = runJson([
    "scripts/english-learning-harness.mjs",
    "vault",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(vault.status === "pass", "vault failed");
  assert(vault.phraseCount === 1, "vault should expose one personal phrase");
  assert(vault.phrases[0].text === "I like drinking coffee.", "vault phrase mismatch");
  assert(vault.phrases[0].prompt.includes("real-life context"), "vault prompt should ask for context use");

  const dueItem = makeFirstItemDue();
  const dueList = runJson([
    "scripts/english-learning-harness.mjs",
    "review",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(dueList.status === "pass", "due review list failed");
  assert(dueList.dueCount === 1, "expected one due review item");
  assert(dueList.dueItems[0].id === dueItem.id, "due review id mismatch");
  assert(dueList.dueItems[0].prompt.includes("tiny real-life context"), "review prompt is not contextual");

  const success = runJson([
    "scripts/english-learning-harness.mjs",
    "review",
    "--learner-root",
    learnerRoot,
    "--review-id",
    dueItem.id,
    "--result",
    "success",
    "--json",
  ]);
  assert(success.status === "pass", "success review failed");
  assert(success.reviewedItem.success_count === 1, "success_count should increment");
  assert(success.reviewedItem.interval_days === 3, "first successful review should move to 3 days");
  assert(success.reviewedItem.last_result === "success", "last_result should be success");

  makeFirstItemDue();
  const fail = runJson([
    "scripts/english-learning-harness.mjs",
    "review",
    "--learner-root",
    learnerRoot,
    "--review-id",
    dueItem.id,
    "--result",
    "fail",
    "--json",
  ]);
  assert(fail.status === "pass", "fail review failed");
  assert(fail.reviewedItem.success_count === 0, "fail should reset success_count");
  assert(fail.reviewedItem.interval_days === 1, "fail should return to one-day interval");
  assert(fail.reviewedItem.last_result === "fail", "last_result should be fail");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        reviewId: dueItem.id,
        vault: {
          phraseCount: vault.phraseCount,
          phrase: vault.phrases[0].text,
        },
        success: {
          intervalDays: success.reviewedItem.interval_days,
          successCount: success.reviewedItem.success_count,
        },
        fail: {
          intervalDays: fail.reviewedItem.interval_days,
          successCount: fail.reviewedItem.success_count,
        },
      },
      null,
      2,
    ),
  );
}

main();
