#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateProgress } from "./validate-progress.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const learnerRoot = resolve(repoRoot, "tmp/phase-1-scenario-loop/learner");

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

function main() {
  rmSync(resolve(repoRoot, "tmp/phase-1-scenario-loop"), { recursive: true, force: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "Sujin",
    "--motivation",
    "I want expressive English for creative identity.",
    "--json",
  ]);

  const session = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--scenario",
    "creative-opinion",
    "--say",
    "This song feels kind of blue and warm.",
    "--json",
  ]);

  assert(session.status === "pass", "scenario session failed");
  assert(session.scenario.id === "creative-opinion", "preferred scenario was not selected");
  assert(session.scenario.goal, "session missing scenario goal");
  assert(session.mirror.pattern, "mini mirror missing pattern");
  assert(session.mirror.reviewPhrase, "mini mirror missing review phrase");
  assert(session.mirror.retryPrompt, "mini mirror missing retry prompt");
  assert(existsSync(session.artifactPath), "artifact missing");
  assert(existsSync(session.journalPath), "journal missing");

  const artifact = readJson(session.artifactPath);
  assert(artifact.scenario.goal.includes("personal taste"), "artifact scenario goal mismatch");
  assert(artifact.turns[0].text.includes("Goal:"), "opening turn missing task goal");
  assert(artifact.turns[0].text.includes("Rescue phrase:"), "opening turn missing rescue phrase");
  assert(artifact.turns.some((turn) => turn.text.includes("Small repair")), "turns missing repair prompt");

  const journal = readFileSync(session.journalPath, "utf8");
  assert(journal.includes("### Scenario"), "journal missing scenario section");
  assert(journal.includes("오늘의 패턴"), "journal missing pattern");
  assert(journal.includes("내 문장으로 저장"), "journal missing review phrase");
  assert(journal.includes(session.relativeArtifactPath), "journal missing artifact reference");

  const progressPath = resolve(learnerRoot, "progress.json");
  const progress = readJson(progressPath);
  const errors = validateProgress(progress, progressPath);
  assert(errors.length === 0, `progress validation failed: ${errors.join("; ")}`);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "PH1-FIX-3",
        scenario: session.scenario.id,
        artifactPath: session.artifactPath,
        journalPath: session.journalPath,
        mirror: session.mirror,
      },
      null,
      2,
    ),
  );
}

main();
