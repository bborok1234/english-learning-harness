#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-1-clean-clone");
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
    "Clone Learner",
    "--motivation",
    "I want to start speaking gently from a fresh clone.",
    "--json",
  ]);
  assert(setup.status === "pass", "fresh clone setup failed");
  assert(setup.health?.profileReady === true, "setup did not return health");

  const today = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--say",
    "I want to practice today.",
    "--json",
  ]);
  assert(today.status === "pass", "fresh clone today failed");
  assert(today.finalizesSession === true, "today should finalize session in fresh clone");
  assert(existsSync(today.artifactPath), "fresh clone artifact missing");
  assert(existsSync(today.journalPath), "fresh clone journal missing");

  const health = runJson([
    "scripts/english-learning-harness.mjs",
    "health",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(health.status === "pass", "fresh clone health failed");
  assert(health.sessionCount === 1, "fresh clone health did not see session");

  const validate = runJson(["scripts/validate-progress.mjs", resolve(learnerRoot, "progress.json")]);
  assert(validate.status === "pass", "fresh clone progress validation failed");

  run("node", ["scripts/generate-dashboard.mjs"], { cwd: cloneRoot });
  const dashboard = readFileSync(resolve(cloneRoot, "docs/dashboard.html"), "utf8");
  assert(dashboard.includes("First-Usable Gate"), "dashboard missing first-usable gate");
  assert(dashboard.includes("GATE-6"), "dashboard missing clean-clone gate");

  const status = run("git", ["status", "--short"], { cwd: cloneRoot });
  assert(!status.includes("tmp/"), "runtime tmp files should remain ignored in clean clone");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "PH1-FIX-7",
        origin,
        cloneRoot,
        learnerRoot,
        sessionCount: health.sessionCount,
        artifactPath: today.artifactPath,
        dashboardGateFound: true,
        runtimeTmpIgnored: true,
      },
      null,
      2,
    ),
  );
}

main();
