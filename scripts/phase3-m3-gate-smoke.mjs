#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-3-m3-gate");
const cloneRoot = resolve(smokeRoot, "repo");
const learnerRoot = resolve(smokeRoot, "learner");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: { ...process.env, ...(options.env ?? {}) },
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  });
}

function runJson(args, cwd = cloneRoot) {
  return JSON.parse(run("node", args, { cwd }));
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
  ]) {
    assert(!text.includes(claim), `unsupported claim appeared: ${claim}`);
  }
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  const origin = run("git", ["remote", "get-url", "origin"]).trim();

  run("git", ["clone", "--depth", "1", origin, cloneRoot], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  const setup = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Gate Learner",
    "--motivation",
    "I want to practice English every day from a clean clone.",
    "--json",
  ]);
  assert(setup.status === "pass", "clean clone setup failed");

  const firstDaily = runJson([
    "scripts/english-learning-harness.mjs",
    "daily",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-05-23T12:00:00.000Z",
    "--json",
  ]);
  assert(firstDaily.cockpit.return_state.gap_kind === "fresh", "fresh daily cockpit missing");
  assert(firstDaily.cockpit.next_commands.some((command) => command.includes(" today ")), "daily missing today command");
  assertNoUnsupportedClaims(firstDaily);

  const today = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--scenario",
    "stuck-repair",
    "--say",
    "I don't know how to say it, but first clone practice works.",
    "--date",
    "2026-05-23T12:00:00.000Z",
    "--json",
  ]);
  assert(today.finalizesSession === true, "today should finalize clean clone session");

  const nextDaily = runJson([
    "scripts/english-learning-harness.mjs",
    "daily",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-05-24T12:00:00.000Z",
    "--json",
  ]);
  assert(nextDaily.cockpit.return_state.gap_kind === "next-day", "next-day cockpit missing");
  assert(nextDaily.cockpit.due_review.count >= 1, "next-day cockpit should show due review");
  assertNoUnsupportedClaims(nextDaily);

  const due = runJson([
    "scripts/english-learning-harness.mjs",
    "review",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-05-24T12:00:00.000Z",
    "--json",
  ]);
  assert(due.dueCount >= 1, "clean clone review should list due phrase");

  const reviewId = due.dueItems[0].id;
  const marked = runJson([
    "scripts/english-learning-harness.mjs",
    "review",
    "--learner-root",
    learnerRoot,
    "--review-id",
    reviewId,
    "--result",
    "success",
    "--date",
    "2026-05-24T12:00:00.000Z",
    "--json",
  ]);
  assert(marked.reviewedItem.success_count === 1, "review success should update item");

  const vault = runJson([
    "scripts/english-learning-harness.mjs",
    "vault",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(vault.phraseCount >= 1, "clean clone vault should show saved phrase");

  const weekly = runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-05-24T12:00:00.000Z",
    "--json",
  ]);
  assert(existsSync(weekly.mirrorPath), "clean clone weekly mirror missing");
  assertNoUnsupportedClaims(weekly);

  const home = runJson([
    "scripts/english-learning-harness.mjs",
    "home",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-05-24T12:00:00.000Z",
    "--json",
  ]);
  assert(existsSync(home.homePath), "clean clone learner home missing");
  const homeHtml = readFileSync(home.homePath, "utf8");
  assert(homeHtml.includes("오늘의 영어 연습"), "learner home missing title");
  assert(homeHtml.includes("복습할 문장"), "learner home missing review section");
  assertNoUnsupportedClaims(homeHtml);

  const sevenDay = runJson(["scripts/phase3-seven-day-simulation-smoke.mjs"]);
  assert(sevenDay.status === "pass", "clean clone seven-day simulation failed");

  run("node", ["scripts/generate-dashboard.mjs"], { cwd: cloneRoot });
  const dashboard = readFileSync(resolve(cloneRoot, "docs/dashboard.html"), "utf8");
  assert(dashboard.includes("M3"), "dashboard should include M3 state");

  const status = run("git", ["status", "--short"], { cwd: cloneRoot });
  assert(!status.includes("tmp/"), "runtime tmp files should remain ignored in clean clone");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        origin,
        cloneRoot,
        learnerRoot,
        dailyGap: nextDaily.cockpit.return_state.gap_kind,
        dueCount: due.dueCount,
        vaultPhraseCount: vault.phraseCount,
        weeklyMirrorPath: weekly.mirrorPath,
        homePath: home.homePath,
        sevenDaySessionCount: sevenDay.sessionCount,
        runtimeTmpIgnored: true,
      },
      null,
      2,
    ),
  );
}

main();
