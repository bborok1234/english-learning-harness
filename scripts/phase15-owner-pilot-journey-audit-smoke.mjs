#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-15-owner-pilot-journey-audit");
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

function assertNoEngineeringLeak(text, label) {
  for (const forbidden of ["PR #", "issue #", "smoke pass", "GitHub plan", "pull request"]) {
    assert(!text.includes(forbidden), `${label} leaked engineering language: ${forbidden}`);
  }
}

function assertNoUnsupportedClaims(text, label) {
  const lower = text.toLowerCase();
  for (const forbidden of [
    "proves fluency",
    "guaranteed",
    "native speaker",
    "your level",
    "retention improvement proved",
    "generated-media learning gains proved",
    "real-world speaking ability proved",
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
    "I want the AIOS pilot to prove whether the daily journey feels useful.",
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
    "What do you mean by the usual place? I want to answer clearly.",
    "I see your point, but I mean I need a simpler sentence first.",
    "I was hungry after work, so I bought a sandwich near the station.",
    "I can keep going slowly and ask one question when I am not sure.",
  ];

  for (let index = 0; index < samples.length; index += 1) {
    const day = runJson([
      "scripts/english-learning-harness.mjs",
      "pilot-day",
      "--day",
      String(index + 1),
      "--date",
      isoDay(index + 1),
      "--say",
      samples[index],
      "--friction-note",
      index % 2 === 0
        ? "The next asset action made it clearer what I should try after the sentence."
        : "The cockpit was useful, but the daily path still needs less internal wording.",
      "--json",
    ]);
    const artifacts = day.day.aios_artifacts;
    assert(day.practice?.path === "codex-operated-practice-flow", `day ${index + 1} should use practice flow`);
    assert(day.day.pilot_mission?.target_skill, `day ${index + 1} should preserve pilot mission target skill`);
    assert(day.day.learner_coaching?.next_phrase, `day ${index + 1} should preserve learner coaching next phrase`);
    assert(day.day.learner_coaching?.next_focus, `day ${index + 1} should preserve learner coaching next focus`);
    assertLearnerFile(artifacts.mission, `day ${index + 1} mission`);
    assertLearnerFile(artifacts.scene, `day ${index + 1} scene`);
    assertLearnerFile(artifacts.asset_deck, `day ${index + 1} asset deck`);
    assert(artifacts.next_asset_action?.asset_id, `day ${index + 1} should preserve next asset action`);
    assertLearnerFile(artifacts.learner_report, `day ${index + 1} learner report`);
    assertLearnerFile(artifacts.cockpit, `day ${index + 1} cockpit`);
  }

  const finished = runJson([
    "scripts/english-learning-harness.mjs",
    "pilot-finish",
    "--date",
    isoDay(7),
    "--say",
    "Today I can explain my commute, and I can ask what do you mean if the question is unclear.",
    "--say",
    "I mean I can keep talking with a simple example before I know the perfect word.",
    "--say",
    "I see your point, but I want to answer with one concrete example.",
    "--comfort-rating",
    "3",
    "--json",
  ]);

  const report = readJson(finished.reportPath);
  const markdown = readFileSync(finished.reportMarkdownPath, "utf8");
  assert(report.daily_session_count === 5, "pilot report should include five daily sessions");
  assert(report.product_journey_audit?.evidence_complete === true, "product journey audit should be complete");
  assert(
    ["continue", "research", "pivot", "kill_claim", "invalid"].includes(report.product_journey_audit.decision),
    "audit decision should use the governance decision set",
  );
  assert(report.product_journey_audit.decision !== "invalid", "complete fixture should not be invalid");
  assert(report.product_journey_audit.days_with_asset_actions === 5, "all days should keep asset actions");
  assert(report.product_journey_audit.days_with_pilot_mission_metadata === 5, "all days should keep pilot mission metadata");
  assert(
    report.product_journey_audit.distinct_pilot_mission_skills.length >= 5,
    "pilot audit should preserve distinct speaking action skills",
  );
  assert(report.product_journey_audit.days_with_learner_coaching === 5, "all days should keep learner coaching");
  assert(report.product_journey_audit.friction_note_count === 5, "all days should keep friction notes");
  assert(report.aios_artifacts.days.length === 5, "report should keep five AIOS day bridges");

  for (const day of report.aios_artifacts.days) {
    assertLearnerFile(day.mission, `report day ${day.day} mission`);
    assert(day.pilot_mission?.target_skill, `report day ${day.day} pilot mission target skill`);
    assert(day.learner_coaching?.next_phrase, `report day ${day.day} learner coaching next phrase`);
    assertLearnerFile(day.scene, `report day ${day.day} scene`);
    assertLearnerFile(day.asset_deck, `report day ${day.day} asset deck`);
    assert(day.next_asset_action?.asset_id, `report day ${day.day} next asset action`);
    assertLearnerFile(day.learner_report, `report day ${day.day} learner report`);
    assertLearnerFile(day.cockpit, `report day ${day.day} cockpit`);
  }

  assert(markdown.includes("## Product Journey Audit"), "Markdown report should include product journey audit");
  assert(markdown.includes("pilot_action=clarification"), "Markdown should list pilot action metadata");
  assert(markdown.includes("pilot_action=repair"), "Markdown should list varied pilot action metadata");
  assert(markdown.includes("coaching_next="), "Markdown should list learner coaching next phrase");
  assert(markdown.includes("Days with learner coaching: 5/5"), "Markdown should list learner coaching audit count");
  assert(markdown.includes("asset_deck=artifacts/assets/"), "Markdown should list asset deck paths");
  assert(markdown.includes("next_asset="), "Markdown should list next asset ids");
  assertNoEngineeringLeak(markdown, "pilot Markdown");
  assertNoUnsupportedClaims(JSON.stringify(report), "pilot report JSON");
  assertNoUnsupportedClaims(markdown, "pilot Markdown");

  const cockpitState = readJson(resolve(learnerRoot, "cockpit-state.json"));
  assert(cockpitState.next_asset_action?.asset_id, "final cockpit should expose next asset action");
  assert(cockpitState.journey.latest_mission_asset_deck?.top_asset_action?.asset_id, "final cockpit should link deck top action");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-12",
        learnerRoot,
        reportPath: finished.reportPath,
        reportMarkdownPath: finished.reportMarkdownPath,
        decision: report.product_journey_audit.decision,
        daysWithAssetActions: report.product_journey_audit.days_with_asset_actions,
        claimBoundary:
          "This smoke validates owner/self pilot audit mechanics with fixture data only; it is not a real learner outcome claim.",
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
        issue: "AIOS-12",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
