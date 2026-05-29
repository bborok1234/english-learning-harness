#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/phase-3-daily-cockpit");
const learnerRoot = resolve(tmpRoot, "learner");

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

function assertNoUnsupportedClaims(value) {
  const text = JSON.stringify(value).toLowerCase();
  for (const claim of ["native speaker", "confident with foreigners", "guaranteed", "fluent", "your level"]) {
    assert(!text.includes(claim), `unsupported claim appeared: ${claim}`);
  }
}

function assertCommandIncludes(commands, fragment) {
  assert(commands.some((command) => command.includes(fragment)), `missing next command fragment: ${fragment}`);
}

function makeReviewDue() {
  const reviewQueuePath = resolve(learnerRoot, "review-queue.json");
  const queue = readJson(reviewQueuePath);
  assert(queue.items.length >= 1, "fixture should create a review queue item");
  queue.items[0] = {
    ...queue.items[0],
    due_at: "2026-05-28T00:00:00.000Z",
  };
  writeJson(reviewQueuePath, queue);
  return queue.items[0].id;
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });

  const setup = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Jieun",
    "--motivation",
    "I want a daily speaking habit without feeling judged.",
    "--json",
  ]);
  assert(setup.next.some((command) => command.includes(" daily ")), "setup should suggest daily cockpit");

  const fresh = runJson([
    "scripts/english-learning-harness.mjs",
    "daily",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(fresh.status === "pass", "fresh daily command failed");
  assert(fresh.cockpit.schema_version === 1, "fresh cockpit schema mismatch");
  assert(fresh.cockpit.return_state.session_count === 0, "fresh learner should have no sessions");
  assert(fresh.cockpit.due_review.count === 0, "fresh learner should have no due review");
  assert(fresh.cockpit.suggested_scenario.id, "fresh cockpit missing suggested scenario");
  assertCommandIncludes(fresh.cockpit.next_commands, " today ");
  assertCommandIncludes(fresh.cockpit.next_commands, " weekly ");
  assertCommandIncludes(fresh.cockpit.next_commands, " vault ");
  assertNoUnsupportedClaims(fresh.cockpit);

  runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--scenario",
    "stuck-repair",
    "--say",
    "I don't know how to say it, but coffee good.",
    "--json",
  ]);
  const dueReviewId = makeReviewDue();

  const weekly = runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(existsSync(weekly.mirrorPath), "weekly mirror missing for returning cockpit");

  const returning = runJson([
    "scripts/english-learning-harness.mjs",
    "daily",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(returning.status === "pass", "returning daily command failed");
  assert(returning.cockpit.return_state.session_count === 1, "returning learner session count mismatch");
  assert(returning.cockpit.return_state.message.includes("no streak penalty"), "return path should avoid streak punishment");
  assert(returning.cockpit.due_review.count === 1, "returning learner should have one due review");
  assert(returning.cockpit.due_review.items[0].id === dueReviewId, "due review item mismatch");
  assert(returning.cockpit.suggested_scenario.selection_reason.source === "due-review", "due review should guide scenario");
  assert(returning.cockpit.latest_weekly_mirror, "returning cockpit missing latest weekly mirror pointer");
  assert(returning.cockpit.latest_journal, "returning cockpit missing latest journal pointer");
  assertCommandIncludes(returning.cockpit.next_commands, " review ");
  assertCommandIncludes(returning.cockpit.next_commands, " today ");
  assertNoUnsupportedClaims(returning.cockpit);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        freshScenario: fresh.cockpit.suggested_scenario.id,
        returningScenario: returning.cockpit.suggested_scenario.id,
        dueReviewCount: returning.cockpit.due_review.count,
        latestWeeklyMirror: returning.cockpit.latest_weekly_mirror,
        nextCommands: returning.cockpit.next_commands,
      },
      null,
      2,
    ),
  );
}

main();
