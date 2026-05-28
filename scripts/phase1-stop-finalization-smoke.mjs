#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateProgress } from "./validate-progress.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const learnerRoot = resolve(repoRoot, "tmp/phase-1-stop-finalization/learner");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args, env = {}) {
  const output = execFileSync("node", args, {
    cwd: repoRoot,
    env: { ...process.env, ...env },
    encoding: "utf8",
  });
  return JSON.parse(output);
}

function sessionArtifactCount() {
  const artifactDir = resolve(learnerRoot, "artifacts/sessions");
  if (!existsSync(artifactDir)) return 0;
  return readdirSync(artifactDir).filter((entry) => entry.endsWith(".json")).length;
}

function main() {
  rmSync(resolve(repoRoot, "tmp/phase-1-stop-finalization"), { recursive: true, force: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Jieun",
    "--json",
  ]);

  const today = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--say",
    "I want to practice today.",
    "--json",
  ]);
  assert(today.finalizesSession === true, "today command should claim explicit finalization");
  assert(today.claimBoundary.includes("command-wrapper session finalization"), "today claim boundary mismatch");
  assert(existsSync(today.artifactPath), "today command did not write session artifact");

  const beforeStopArtifactCount = sessionArtifactCount();
  const stop = runJson(["hooks/english-learning-hook.mjs", "Stop"], {
    ENGLISH_LEARNING_HOME: learnerRoot,
  });
  assert(stop.hookSpecificOutput.finalizesSession === false, "Stop hook must not claim finalization");
  assert(
    stop.hookSpecificOutput.claimBoundary.includes("does not create or finalize session artifacts"),
    "Stop hook claim boundary mismatch",
  );
  assert(sessionArtifactCount() === beforeStopArtifactCount, "Stop hook should not create session artifacts");

  const progressPath = resolve(learnerRoot, "progress.json");
  const progress = JSON.parse(readFileSync(progressPath, "utf8"));
  const errors = validateProgress(progress, progressPath);
  assert(errors.length === 0, `progress validation failed: ${errors.join("; ")}`);
  assert(progress.sessions.length === 1, "Stop hook should not append sessions");
  assert(progress.last_stop_contract === "marker-only", "Stop hook marker contract not persisted");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "PH1-FIX-4",
        explicitCommandFinalizesSession: today.finalizesSession,
        stopHookFinalizesSession: stop.hookSpecificOutput.finalizesSession,
        sessionCount: progress.sessions.length,
        artifactCount: beforeStopArtifactCount,
        stopContract: progress.last_stop_contract,
      },
      null,
      2,
    ),
  );
}

main();
