#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/phase-3-seven-day-simulation");
const learnerRoot = resolve(tmpRoot, "learner");

const days = [
  "2026-05-23T12:00:00.000Z",
  "2026-05-24T12:00:00.000Z",
  "2026-05-25T12:00:00.000Z",
  "2026-05-26T12:00:00.000Z",
  "2026-05-27T12:00:00.000Z",
  "2026-05-28T12:00:00.000Z",
  "2026-05-29T12:00:00.000Z",
];

const dailyInputs = [
  { scenario: "coffee-small-talk", say: "Coffee helps me start day one." },
  { scenario: "stuck-repair", say: "I don't know how to say it, but commute was busy." },
  { scenario: "reactivation-check-in", say: "What I want to say is I can practice slowly." },
  { scenario: "creative-opinion", say: "It feels kind of calm when I speak slowly." },
  { scenario: "coffee-small-talk", say: "Tea helps me focus before work." },
  { scenario: "stuck-repair", say: "I don't know how to say it, but meeting was okay." },
  { scenario: "reactivation-check-in", say: "What I want to say is I can return without pressure." },
];

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

function assertNoUnsupportedClaims(value) {
  const text = JSON.stringify(value).toLowerCase();
  for (const claim of [
    "native speaker",
    "confident with foreigners",
    "guaranteed",
    "fluent",
    "your level",
    "lost your streak",
    "you failed",
    "you are behind",
  ]) {
    assert(!text.includes(claim), `unsupported claim appeared: ${claim}`);
  }
}

function reviewDueItems(date) {
  return runJson([
    "scripts/english-learning-harness.mjs",
    "review",
    "--learner-root",
    learnerRoot,
    "--date",
    date,
    "--json",
  ]);
}

function markDueItems(dueItems, date) {
  for (const item of dueItems) {
    runJson([
      "scripts/english-learning-harness.mjs",
      "review",
      "--learner-root",
      learnerRoot,
      "--review-id",
      item.id,
      "--result",
      "success",
      "--date",
      date,
      "--json",
    ]);
  }
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });
  assert(learnerRoot.startsWith(resolve(repoRoot, "tmp")), "simulation must stay under repo tmp");

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Jieun",
    "--motivation",
    "I want a daily speaking habit without pressure.",
    "--json",
  ]);

  const dailySnapshots = [];
  const reviewedIds = new Set();
  for (const [index, date] of days.entries()) {
    const daily = runJson([
      "scripts/english-learning-harness.mjs",
      "daily",
      "--learner-root",
      learnerRoot,
      "--date",
      date,
      "--json",
    ]);
    assertNoUnsupportedClaims(daily);
    dailySnapshots.push(daily.cockpit.return_state);

    const due = reviewDueItems(date);
    markDueItems(due.dueItems, date);
    for (const item of due.dueItems) reviewedIds.add(item.id);

    runJson([
      "scripts/english-learning-harness.mjs",
      "today",
      "--learner-root",
      learnerRoot,
      "--scenario",
      dailyInputs[index].scenario,
      "--say",
      dailyInputs[index].say,
      "--date",
      date,
      "--json",
    ]);

    const home = runJson([
      "scripts/english-learning-harness.mjs",
      "home",
      "--learner-root",
      learnerRoot,
      "--date",
      date,
      "--json",
    ]);
    assert(existsSync(home.homePath), `home missing on day ${index + 1}`);
    assertNoUnsupportedClaims(readFileSync(home.homePath, "utf8"));
  }

  const weekly = runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--learner-root",
    learnerRoot,
    "--date",
    days.at(-1),
    "--json",
  ]);
  assert(existsSync(weekly.mirrorPath), "weekly mirror missing");
  assert(weekly.mirror.window.session_count === 7, "weekly mirror should include seven sessions");
  assert(weekly.mirror.saved_phrases.length >= 7, "weekly mirror missing saved phrases");
  assert(weekly.mirror.reused_phrases.length >= 1, "weekly mirror missing reused phrases");
  assertNoUnsupportedClaims(weekly);

  const finalHome = runJson([
    "scripts/english-learning-harness.mjs",
    "home",
    "--learner-root",
    learnerRoot,
    "--date",
    days.at(-1),
    "--json",
  ]);
  assert(existsSync(finalHome.homePath), "final home missing");

  const progress = readJson(resolve(learnerRoot, "progress.json"));
  const learnerModel = readJson(resolve(learnerRoot, "learner-model.json"));
  const vocabulary = readJson(resolve(learnerRoot, "vocabulary.json"));
  const reviewQueue = readJson(resolve(learnerRoot, "review-queue.json"));

  assert(progress.sessions.length === 7, "progress should record seven sessions");
  assert(vocabulary.personal_phrases.length >= 7, "vocabulary should save seven phrases");
  assert(reviewQueue.items.length >= 7, "review queue should keep seven phrase items");
  assert([...reviewedIds].length >= 3, "simulation should review multiple due phrases");
  assert(reviewQueue.items.some((item) => (item.success_count ?? 0) >= 2), "review interval should advance after reuse");
  assert(reviewQueue.items.some((item) => (item.interval_days ?? 0) >= 7), "review interval should reach at least seven days");
  assert(learnerModel.interaction_skills.starts.evidence_count >= 7, "starts evidence should grow");
  assert(learnerModel.interaction_skills.repair.evidence_count >= 2, "repair evidence should grow");
  assert(dailySnapshots.some((state) => state.gap_kind === "next-day"), "daily snapshots should include next-day returns");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        sessionCount: progress.sessions.length,
        savedPhraseCount: vocabulary.personal_phrases.length,
        reviewItemCount: reviewQueue.items.length,
        reviewedCount: reviewedIds.size,
        weeklyMirrorPath: weekly.mirrorPath,
        finalHomePath: finalHome.homePath,
        startsEvidence: learnerModel.interaction_skills.starts.evidence_count,
        repairEvidence: learnerModel.interaction_skills.repair.evidence_count,
      },
      null,
      2,
    ),
  );
}

main();
