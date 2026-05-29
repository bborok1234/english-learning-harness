#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const learnerRoot = resolve(repoRoot, "tmp/phase-6-onboarding-diagnostics/learner");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(args) {
  return execFileSync("node", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

function runJson(args) {
  return JSON.parse(run(args));
}

function assertSupport(result, source) {
  assert(result.support, `${source} missing support diagnostics`);
  assert(result.support.nativeHooksRequired === false, `${source} should keep native hooks optional`);
  assert(result.support.nativeHooksStatus === "optional", `${source} native hook status should be optional`);
  for (const command of ["daily", "today", "weekly", "home", "export", "health"]) {
    assert(
      result.support.nextCommands.some((entry) => entry.includes(` ${command} `) || entry.includes(` ${command} --`)),
      `${source} support missing next command: ${command}`,
    );
  }
  assert(
    result.support.recoveryCommands.some((entry) => entry.includes(" setup ") && entry.includes("--repair")),
    `${source} support missing setup --repair recovery`,
  );
  assert(
    result.support.recoveryCommands.some((entry) => entry.includes(" health ")),
    `${source} support missing health recovery`,
  );
  assert(
    result.support.claimBoundary.includes("do not modify files unless --repair is used"),
    `${source} support should state non-destructive repair boundary`,
  );
}

function main() {
  rmSync(resolve(repoRoot, "tmp/phase-6-onboarding-diagnostics"), { recursive: true, force: true });

  const setup = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Support Learner",
    "--json",
  ]);
  assert(setup.status === "pass", "setup should pass");
  assertSupport(setup, "setup");
  assert(setup.next.some((entry) => entry.includes("export")), "setup next should include evidence export");
  assert(setup.next.some((entry) => entry.includes("home")), "setup next should include learner home");

  const health = runJson([
    "scripts/english-learning-harness.mjs",
    "health",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(health.status === "pass", "health should pass");
  assertSupport(health, "health");
  assert(health.support.supportFiles.every((path) => existsSync(path)), "health support files should exist");

  const status = runJson([
    "scripts/english-learning-harness.mjs",
    "status",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(status.status === "pass", "status should pass");
  assertSupport(status, "status");

  const context = run([
    "scripts/english-learning-harness.mjs",
    "context",
    "--learner-root",
    learnerRoot,
  ]);
  assert(context.includes("Support diagnostics:"), "context missing support diagnostics section");
  assert(context.includes("setup") && context.includes("--repair"), "context missing repair command");
  assert(context.includes("export"), "context missing export next command");

  const progressPath = resolve(learnerRoot, "progress.json");
  writeFileSync(progressPath, "not json\n");
  const brokenHealth = runJson([
    "scripts/english-learning-harness.mjs",
    "health",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(brokenHealth.status === "fail", "broken health should fail");
  assertSupport(brokenHealth, "broken health");

  const repaired = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--repair",
    "--json",
  ]);
  assert(repaired.status === "pass", "repair should pass");
  assert(repaired.repairPerformed === true, "repair should report repairPerformed");
  assert(repaired.repairBackups.some((path) => path.includes("progress.json.broken-")), "repair should back up progress");
  assertSupport(repaired, "repaired setup");

  const repairedProgress = JSON.parse(readFileSync(progressPath, "utf8"));
  assert(repairedProgress.version === 2, "repaired progress should be v2");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M6-3",
        learnerRoot,
        nextCommandCount: setup.support.nextCommands.length,
        supportFileCount: health.support.supportFiles.length,
        repairBackups: repaired.repairBackups,
        nativeHooksStatus: health.support.nativeHooksStatus,
        claimBoundary:
          "This proves first-run diagnostic clarity and repair guidance, not marketplace distribution or learning impact.",
      },
      null,
      2,
    ),
  );
}

main();
