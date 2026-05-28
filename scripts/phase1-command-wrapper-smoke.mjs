#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateProgress } from "./validate-progress.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const learnerRoot = resolve(repoRoot, "tmp/phase-1-command-wrapper/learner");

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
  rmSync(resolve(repoRoot, "tmp/phase-1-command-wrapper"), { recursive: true, force: true });

  const setup = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Jieun",
    "--motivation",
    "I want a safe daily speaking habit.",
    "--json",
  ]);
  assert(setup.status === "pass", "setup failed");
  assert(setup.nativeHooksRequired === false, "setup should not require native hooks");
  assert(existsSync(setup.profilePath), "profile missing after setup");
  assert(existsSync(setup.progressPath), "progress missing after setup");

  const healthBefore = runJson([
    "scripts/english-learning-harness.mjs",
    "health",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(healthBefore.status === "pass", "health before session failed");
  assert(healthBefore.sessionCount === 0, "new learner should have zero sessions");
  assert(healthBefore.nativeHooksStatus === "optional", "native hooks should be optional");

  const today = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--say",
    "I think we can start small.",
    "--say",
    "Can you say that simply?",
    "--json",
  ]);
  assert(today.status === "pass", "today failed");
  assert(today.finalizesSession === true, "today should finalize the explicit command session");
  assert(today.nativeHooksRequired === false, "today should not require native hooks");
  assert(existsSync(today.journalPath), "journal missing after today");
  assert(existsSync(today.artifactPath), "artifact missing after today");
  assert(today.claimBoundary.includes("command-wrapper"), "claim boundary missing wrapper");

  const progress = JSON.parse(readFileSync(setup.progressPath, "utf8"));
  const errors = validateProgress(progress, setup.progressPath);
  assert(errors.length === 0, `progress validation failed: ${errors.join("; ")}`);
  assert(progress.sessions.length === 1, "session was not persisted");

  const healthAfter = runJson([
    "scripts/english-learning-harness.mjs",
    "health",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(healthAfter.sessionCount === 1, "health did not see persisted session");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        path: "explicit-command-wrapper",
        learnerRoot,
        setup: {
          profilePath: setup.profilePath,
          progressPath: setup.progressPath,
          nativeHooksRequired: setup.nativeHooksRequired,
        },
        today: {
          sessionId: today.sessionId,
          journalPath: today.journalPath,
          artifactPath: today.artifactPath,
          finalizesSession: today.finalizesSession,
        },
        health: {
          sessionCount: healthAfter.sessionCount,
          nativeHooksStatus: healthAfter.nativeHooksStatus,
        },
      },
      null,
      2,
    ),
  );
}

main();
