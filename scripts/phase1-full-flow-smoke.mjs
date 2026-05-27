#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { validateProgress } from "./validate-progress.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const learnerRoot = resolve(repoRoot, "tmp/phase-1-full-flow/learner");

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

function main() {
  rmSync(resolve(repoRoot, "tmp/phase-1-full-flow"), { recursive: true, force: true });

  const init = runJson([
    "scripts/english-learning.mjs",
    "init",
    "--learner-root",
    learnerRoot,
    "--name",
    "Jieun",
    "--motivation",
    "I want to feel less frozen when speaking English.",
    "--correction-style",
    "gentle recast first",
    "--json",
  ]);
  assert(init.status === "pass", "init did not pass");

  const session = runJson([
    "scripts/english-learning.mjs",
    "session",
    "--learner-root",
    learnerRoot,
    "--input",
    "I like coffee.",
    "--input",
    "Today morning coffee.",
    "--json",
  ]);
  assert(session.status === "pass", "session did not pass");
  assert(session.mode === "text-first", "session mode should be text-first");
  assert(session.sessionMetrics.attendance === 1, "attendance should be 1");
  assert(session.sessionMetrics.utterance_word_count > 0, "utterance word count not updated");
  assert(existsSync(session.journalPath), "journal file missing");
  assert(existsSync(session.artifactPath), "artifact file missing");

  const progressPath = resolve(learnerRoot, "progress.json");
  const progress = JSON.parse(readFileSync(progressPath, "utf8"));
  const errors = validateProgress(progress, progressPath);
  assert(errors.length === 0, `progress validation failed: ${errors.join("; ")}`);
  assert(progress.sessions.length === 1, "session record was not appended");
  assert(progress.mvp_session_metrics.attendance === 1, "cumulative attendance not updated");
  assert(
    progress.sessions[0].artifact === session.relativeArtifactPath,
    "progress artifact reference mismatch",
  );

  const journal = readFileSync(session.journalPath, "utf8");
  assert(journal.includes("Mini mirror"), "journal missing mini mirror");
  assert(journal.includes(session.relativeArtifactPath), "journal missing artifact reference");

  const context = execFileSync("node", ["hooks/english-learning-hook.mjs", "SessionStart"], {
    cwd: repoRoot,
    env: { ...process.env, ENGLISH_LEARNING_HOME: learnerRoot },
    encoding: "utf8",
  });
  const contextJson = JSON.parse(context);
  assert(
    contextJson.hookSpecificOutput.additionalContext.includes("Jieun"),
    "hook context missing profile",
  );
  assert(
    contextJson.hookSpecificOutput.additionalContext.includes("attendance=1"),
    "hook context missing updated metrics",
  );

  const stop = execFileSync("node", ["hooks/english-learning-hook.mjs", "Stop"], {
    cwd: repoRoot,
    env: { ...process.env, ENGLISH_LEARNING_HOME: learnerRoot },
    encoding: "utf8",
  });
  assert(JSON.parse(stop).hookSpecificOutput.additionalContext, "Stop hook did not emit context");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        profilePath: init.profilePath,
        progressPath,
        journalPath: session.journalPath,
        artifactPath: session.artifactPath,
        sessionMetrics: session.sessionMetrics,
      },
      null,
      2,
    ),
  );
}

main();
