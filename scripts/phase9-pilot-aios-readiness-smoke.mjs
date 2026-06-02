#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-9-pilot-aios-readiness");
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

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function learnerPath(relativePath) {
  return resolve(learnerRoot, relativePath);
}

function assertLearnerFile(relativePath, label) {
  assert(relativePath && !relativePath.startsWith("/"), `${label} should be a learner-root relative path`);
  assert(existsSync(learnerPath(relativePath)), `${label} missing: ${relativePath}`);
}

function assertNoUnsupportedClaims(text, label) {
  const lower = text.toLowerCase();
  for (const forbidden of [
    "proves fluency",
    "guaranteed",
    "native speaker",
    "your level",
    "real-world speaking ability is proven",
    "realtime voice adventure is supported",
  ]) {
    assert(!lower.includes(forbidden), `${label} leaked unsupported claim: ${forbidden}`);
  }
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--name",
    "owner self participant",
    "--motivation",
    "I want a pilot that connects practice evidence to AIOS product surfaces.",
    "--json",
  ]);

  runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-start",
    "--date",
    isoDay(0),
    "--say",
    "I want to explain my day, but I get stuck when someone asks a follow-up.",
    "--comfort-rating",
    "2",
    "--json",
  ]);

  const samples = [
    "I made coffee before work, but I need a second to explain the small detail.",
    "Could you tell me which part you mean? I want to answer clearly.",
    "I see your point, but I need to choose a simpler sentence.",
    "I was hungry after work, so I bought a sandwich near the station.",
    "I can keep going slowly and ask one question when I am not sure.",
  ];

  const dayResults = [];
  for (let index = 0; index < samples.length; index += 1) {
    const result = runJson([
      "scripts/english-learning-harness.mjs",
      "pilot-day",
      "--day",
      String(index + 1),
      "--date",
      isoDay(index + 1),
      "--say",
      samples[index],
      "--friction-note",
      index === 1 ? "The generated scene made the clarification target easier to notice." : "",
      "--json",
    ]);
    const artifacts = result.day.aios_artifacts;
    assert(result.practice?.path === "codex-operated-practice-flow", `day ${index + 1} should run through practice`);
    assert(result.practice.mission.id, `day ${index + 1} should generate a mission`);
    assert(result.practice.scene.id, `day ${index + 1} should generate a scene`);
    assertLearnerFile(artifacts.mission, `day ${index + 1} mission`);
    assertLearnerFile(artifacts.scene, `day ${index + 1} scene`);
    assertLearnerFile(artifacts.learner_report, `day ${index + 1} learner report`);
    assertLearnerFile(artifacts.cockpit, `day ${index + 1} cockpit`);
    dayResults.push(result);
  }

  const finished = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-finish",
    "--date",
    isoDay(7),
    "--say",
    "Today I can explain my commute and ask what you mean if the question is unclear.",
    "--say",
    "Could you tell me which part you want to hear first?",
    "--say",
    "I see your point, but I want to answer with one concrete example.",
    "--comfort-rating",
    "3",
    "--json",
  ]);
  assert(finished.summary.status === "complete", "pilot should complete");
  assert(existsSync(finished.reportPath), "pilot report JSON missing");
  assert(existsSync(finished.reportMarkdownPath), "pilot report Markdown missing");

  const pilotReport = readJson(finished.reportPath);
  assert(pilotReport.aios_artifacts.days.length === 5, "pilot report should include five AIOS day bridges");
  for (const day of pilotReport.aios_artifacts.days) {
    assert(day.session_id, `day ${day.day} should keep session id`);
    assertLearnerFile(day.mission, `report day ${day.day} mission`);
    assertLearnerFile(day.scene, `report day ${day.day} scene`);
    assertLearnerFile(day.learner_report, `report day ${day.day} learner report`);
    assertLearnerFile(day.cockpit, `report day ${day.day} cockpit`);
  }
  assertLearnerFile(pilotReport.aios_artifacts.final_learner_report, "final learner report");
  assertLearnerFile(pilotReport.aios_artifacts.final_cockpit, "final cockpit");

  const reportMarkdown = readFileSync(finished.reportMarkdownPath, "utf8");
  assert(reportMarkdown.includes("## AIOS Artifact Bridge"), "Markdown report should show AIOS artifact bridge");
  assert(reportMarkdown.includes("Final learner report:"), "Markdown report should show final learner report");
  assert(reportMarkdown.includes("scene=artifacts/scenes/"), "Markdown report should list scene artifacts");
  assertNoUnsupportedClaims(JSON.stringify(pilotReport), "pilot report JSON");
  assertNoUnsupportedClaims(reportMarkdown, "pilot report Markdown");

  const finalLearnerReport = readJson(
    learnerPath(pilotReport.aios_artifacts.final_learner_report.replace(/\.html$/, ".json")),
  );
  assert(
    finalLearnerReport.generated_artifacts.latest_scene?.html,
    "final learner report should link latest generated scene",
  );
  assert(
    finalLearnerReport.generated_artifacts.latest_mission?.html,
    "final learner report should link latest generated mission",
  );

  const cockpitState = readJson(resolve(learnerRoot, "cockpit-state.json"));
  assert(
    cockpitState.journey.latest_learner_report?.html === pilotReport.aios_artifacts.final_learner_report,
    "final cockpit should link final learner report",
  );
  assert(cockpitState.journey.latest_generated_scene?.html, "final cockpit should link generated scene");
  assert(cockpitState.journey.latest_generated_mission?.html, "final cockpit should link generated mission");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issues: ["M9-2", "M9-4"],
        learnerRoot,
        reportPath: finished.reportPath,
        reportMarkdownPath: finished.reportMarkdownPath,
        finalLearnerReport: pilotReport.aios_artifacts.final_learner_report,
        finalCockpit: pilotReport.aios_artifacts.final_cockpit,
        dayArtifactCount: dayResults.length,
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
        issues: ["M9-2", "M9-4"],
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
