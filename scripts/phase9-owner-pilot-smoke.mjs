#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-9-owner-pilot");
const learnerRoot = resolve(smokeRoot, "learner");
const startDate = new Date("2026-06-01T09:00:00.000Z");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isoDay(offset) {
  const date = new Date(startDate.getTime());
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString();
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

function assertNoAssumedName(value) {
  const text = JSON.stringify(value);
  assert(!text.includes("지은"), "owner pilot state must not assume a personal name");
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--name",
    "owner self participant",
    "--motivation",
    "I want to verify the real local pilot flow.",
    "--json",
  ]);

  const awaiting = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-start",
    "--date",
    isoDay(0),
    "--json",
  ]);
  assert(awaiting.summary.status === "awaiting_baseline", "pilot-start without sample should await baseline");
  assert(awaiting.summary.nextAction.command === "pilot-capture", "awaiting pilot should ask for card-level baseline capture");
  assert(awaiting.summary.nextAction.phase === "baseline", "awaiting pilot should capture baseline first");
  assertNoAssumedName(awaiting);

  const started = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-start",
    "--date",
    isoDay(0),
    "--say",
    "Today coffee. I nervous. What mean this? I don't know how to say it.",
    "--comfort-rating",
    "2",
    "--json",
  ]);
  assert(started.summary.baselineReady === true, "pilot baseline should be ready");
  assert(started.summary.status === "in_progress", "pilot should be in progress after baseline");
  assert(started.diagnosis.backlogItems.length >= 1, "baseline should seed Speaking Skill OS diagnosis");
  assert(existsSync(started.baselineArtifactPath), "baseline artifact should exist");

  const daySamples = [
    "I don't know how to say it, but my work was busy today.",
    "Could you repeat what you mean? I want to answer clearly.",
    "I see your point, but coffee is too strong for me.",
    "Today I practiced because I want to speak a little more.",
    "I can explain one small thing and keep going slowly.",
  ];

  for (let index = 0; index < daySamples.length; index += 1) {
    const day = runJson([
      "scripts/english-learning-harness.mjs",
      "pilot-day",
      "--day",
      String(index + 1),
      "--date",
      isoDay(index + 1),
      "--say",
      daySamples[index],
      "--friction-note",
      index === 2 ? "Clarification prompt felt useful." : "",
      "--json",
    ]);
    assert(day.summary.completedDailySessions === index + 1, `day ${index + 1} count mismatch`);
    assert(day.day.status === "complete", `day ${index + 1} should be complete`);
  }

  const ready = runJson(["scripts/english-learning-harness.mjs", "pilot-status", "--json"]);
  assert(ready.summary.readyToFinish === true, "pilot should be ready to finish after five daily sessions");
  assert(ready.summary.completedDailySessions === 5, "pilot should record five daily sessions");
  assertNoAssumedName(ready);

  const finished = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-finish",
    "--date",
    isoDay(7),
    "--say",
    "Today I made coffee before work and I can explain a little more.",
    "--say",
    "Could you repeat what you mean? I want to check again.",
    "--say",
    "I don't know how to say it, but the meeting was lighter today.",
    "--say",
    "The cup is near the counter, and I mean the small cup beside the wallet.",
    "--say",
    "I feel nervous, but I can keep going slowly.",
    "--comfort-rating",
    "3",
    "--json",
  ]);
  assert(finished.summary.status === "complete", "pilot should complete");
  assert(finished.rubric.status === "pass", "pilot rubric should pass");
  assert(finished.rubric.pass_signals.length >= 3, "pilot should produce at least three pass signals");
  assert(existsSync(finished.reportPath), "pilot report JSON should exist");
  assert(existsSync(finished.reportMarkdownPath), "pilot report Markdown should exist");

  const state = JSON.parse(readFileSync(resolve(learnerRoot, "pilot-state.json"), "utf8"));
  assert(state.participant.label === "repository owner / self pilot participant", "participant label mismatch");
  assert(state.report.decision === finished.rubric.decision, "state should keep report decision");
  assertNoAssumedName(state);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M9-1",
        learnerRoot,
        pilotStatePath: resolve(learnerRoot, "pilot-state.json"),
        reportPath: finished.reportPath,
        reportMarkdownPath: finished.reportMarkdownPath,
        decision: finished.rubric.decision,
        passSignals: finished.rubric.pass_signals,
        claimBoundary: finished.claimBoundary,
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
        issue: "M9-1",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
