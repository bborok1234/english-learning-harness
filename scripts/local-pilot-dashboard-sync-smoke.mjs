#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/local-pilot-dashboard-sync");
const learnerRoot = resolve(smokeRoot, "learner");
const statusOutput = "tmp/local-pilot-dashboard-sync/local-pilot-status.json";
const dashboardOutput = "tmp/local-pilot-dashboard-sync/local-engineering-dashboard.html";
const legacyOutput = "tmp/local-pilot-dashboard-sync/local-dashboard.html";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(execFileSync(process.execPath, args, { cwd: repoRoot, encoding: "utf8" }));
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  mkdirSync(smokeRoot, { recursive: true });
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

  const result = runJson([
    "scripts/sync-local-pilot-dashboard.mjs",
    "--learner-root",
    learnerRoot,
    "--status-output",
    statusOutput,
    "--dashboard-output",
    dashboardOutput,
    "--legacy-output",
    legacyOutput,
  ]);

  assert(result.status === "pass", "sync should pass");
  assert(existsSync(resolve(repoRoot, statusOutput)), "local status output missing");
  assert(existsSync(resolve(repoRoot, dashboardOutput)), "local dashboard output missing");
  const localStatus = JSON.parse(readFileSync(resolve(repoRoot, statusOutput), "utf8"));
  const dashboard = readFileSync(resolve(repoRoot, dashboardOutput), "utf8");
  assert(localStatus.pilot.baselineReady === true, "baseline should be redacted as ready");
  assert(localStatus.pilot.completedDailySessions === 0, "daily count should be redacted");
  assert(localStatus.pilot.next.title === "확인 질문 만들기", "local status should expose redacted next mission title");
  assert(localStatus.pilot.next.targetSkill === "clarification", "local status should expose redacted target skill");
  assert(!JSON.stringify(localStatus).includes("I opened the app"), "local status must not include transcript");
  assert(!JSON.stringify(localStatus).includes(learnerRoot), "local status must not include local learner path");
  assert(dashboard.includes("Local real pilot"), "local dashboard should include local pilot metric");
  assert(dashboard.includes("LOCAL-REAL-PILOT"), "local dashboard should include local pilot card");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-12",
        localStatusPath: statusOutput,
        localDashboardPath: dashboardOutput,
        claimBoundary: "This validates redacted local pilot dashboard sync with fixture data only.",
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
