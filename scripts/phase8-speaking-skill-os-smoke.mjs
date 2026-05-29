#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-8-speaking-skill-os");
const learnerRoot = resolve(smokeRoot, "learner");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(
    execFileSync("node", args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        ENGLISH_LEARNING_HOME: learnerRoot,
      },
      encoding: "utf8",
    }),
  );
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  const setup = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--name",
    "Speaking OS Learner",
    "--motivation",
    "I want a harness that improves specific speaking skills, not generic chat.",
    "--json",
  ]);
  assert(setup.status === "pass", "setup failed");

  const diagnosis = runJson([
    "scripts/english-learning-harness.mjs",
    "diagnose",
    "--say",
    "I don't know how to say it, but coffee good.",
    "--json",
  ]);
  assert(diagnosis.status === "pass", "diagnose failed");
  assert(diagnosis.diagnosis.skill === "repair", "diagnosis should create repair backlog item");
  assert(diagnosis.backlogItem.status === "open", "new backlog item should be open");
  assert(existsSync(diagnosis.artifactPath), "diagnosis artifact missing");

  const backlogBefore = runJson(["scripts/english-learning-harness.mjs", "backlog", "--json"]);
  assert(backlogBefore.itemCount === 1, "backlog should contain one item");
  assert(backlogBefore.nextItem.skill === "repair", "next backlog item should be repair");

  const daily = runJson(["scripts/english-learning-harness.mjs", "daily", "--json"]);
  assert(daily.cockpit.speaking_os.next_item.skill === "repair", "daily cockpit should expose repair backlog");
  assert(
    daily.cockpit.suggested_scenario.selection_reason.source === "speaking-backlog",
    "daily scenario should be selected from speaking backlog",
  );

  const today = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--say",
    "I don't know how to say it, but coffee made me feel better.",
    "--json",
  ]);
  assert(today.status === "pass", "today failed");
  assert(today.scenarioSelection.source === "speaking-backlog", "today should use speaking backlog scenario");
  assert(today.speakingBacklogEvidence?.result === "pass", "speaking backlog transfer test should pass");
  assert(existsSync(today.artifactPath), "today artifact missing");

  const artifact = readJson(today.artifactPath);
  assert(artifact.speaking_backlog_evidence?.status === "passed", "artifact should persist speaking backlog evidence");

  const backlogAfter = runJson(["scripts/english-learning-harness.mjs", "backlog", "--json"]);
  assert(backlogAfter.passedCount === 1, "backlog should show one passed item");
  assert(backlogAfter.items[0].evidence_count === 1, "passed item should have evidence count");

  const exported = runJson(["scripts/english-learning-harness.mjs", "export", "--json"]);
  assert(exported.summary.speaking_backlog_count === 1, "export should summarize speaking backlog");
  assert(exported.summary.speaking_backlog_passed_count === 1, "export should summarize passed speaking backlog");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M8-1",
        learnerRoot,
        diagnosisArtifact: diagnosis.artifactPath,
        sessionArtifact: today.artifactPath,
        backlogItem: backlogAfter.items[0],
        claimBoundary:
          "This proves local Speaking Skill OS mechanics only. It does not prove real-world fluency or long-term learner outcomes.",
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
        issue: "M8-1",
        error: error.message,
        claimBoundary:
          "A failing smoke means the harness still behaves too much like generic chat for this feature.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
