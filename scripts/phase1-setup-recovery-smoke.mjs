#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateProgress } from "./validate-progress.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const learnerRoot = resolve(repoRoot, "tmp/phase-1-setup-recovery/learner");

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

function main() {
  rmSync(resolve(repoRoot, "tmp/phase-1-setup-recovery"), { recursive: true, force: true });

  const firstSetup = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(firstSetup.status === "pass", "first setup should pass");
  assert(firstSetup.health.profileReady === true, "setup should return health profile readiness");
  assert(firstSetup.next.some((command) => command.includes("today")), "setup should suggest next daily command");

  const secondSetup = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(secondSetup.status === "pass", "repeated setup should be idempotent");
  assert(secondSetup.health.sessionCount === 0, "repeated setup should not create a session");

  const health = runJson([
    "scripts/english-learning-harness.mjs",
    "health",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(health.status === "pass", "health should pass after setup");
  assert(health.checks.every((check) => check.status === "pass"), "all health checks should pass");

  const progressPath = resolve(learnerRoot, "progress.json");
  writeFileSync(progressPath, "not json\n");
  const brokenHealth = runJson([
    "scripts/english-learning-harness.mjs",
    "health",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(brokenHealth.status === "fail", "broken progress should fail health");
  assert(brokenHealth.recovery.some((command) => command.includes("--repair")), "health should suggest repair");

  const repaired = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--repair",
    "--json",
  ]);
  assert(repaired.status === "pass", "repair setup should pass");
  assert(repaired.repairPerformed === true, "repair setup should report repair");
  assert(repaired.repairBackups.some((path) => path.includes("progress.json.broken-")), "repair should back up corrupt progress");
  assert(repaired.repairBackups.every((path) => existsSync(path)), "repair backup files should exist");

  const progress = JSON.parse(readFileSync(progressPath, "utf8"));
  const errors = validateProgress(progress, progressPath);
  assert(errors.length === 0, `repaired progress validation failed: ${errors.join("; ")}`);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "PH1-FIX-5",
        learnerRoot,
        idempotentSetup: true,
        brokenHealthRecovery: brokenHealth.recovery,
        repairBackups: repaired.repairBackups,
      },
      null,
      2,
    ),
  );
}

main();
