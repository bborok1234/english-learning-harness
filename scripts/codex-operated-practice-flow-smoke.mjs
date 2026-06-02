#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/codex-operated-practice-flow-smoke");
const learnerRoot = resolve(tmpRoot, "learner");

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

function assertNoLearnerCommandLeak(value) {
  const text = JSON.stringify(value).toLowerCase();
  for (const forbidden of [
    "node scripts/",
    "npm ",
    "git clone",
    "pull request",
    "issue #",
    "smoke",
  ]) {
    assert(!text.includes(forbidden), `learner-facing summary leaked internal command/process language: ${forbidden}`);
  }
}

function assertSkillContract() {
  const dailySkill = readFileSync(resolve(repoRoot, "skills/daily-session/SKILL.md"), "utf8");
  assert(
    dailySkill.includes("agent-operated `practice` engine path"),
    "daily-session skill should name the agent-operated practice path",
  );
  assert(
    dailySkill.includes("Do not paste internal engine commands into the learner-facing answer"),
    "daily-session skill should prevent command leakage",
  );
  assert(
    dailySkill.includes("mission, session artifact, weekly mirror, learner report, and cockpit"),
    "daily-session skill should connect practice to all daily artifacts",
  );
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });
  assertSkillContract();

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "learner",
    "--motivation",
    "I want Codex to operate the harness while I just answer in English.",
    "--json",
  ]);

  const result = runJson([
    "scripts/english-learning-harness.mjs",
    "practice",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T12:00:00.000Z",
    "--say",
    "I do not know how to say it, but I want to explain my daily work.",
    "--say",
    "What I want to say is I made one small plan today.",
    "--json",
  ]);

  assert(result.status === "pass", "practice command should pass");
  assert(result.path === "codex-operated-practice-flow", "practice should identify Codex-operated flow");
  assert(result.diagnosis?.backlogItemId, "practice should diagnose a Speaking Skill OS item from first sample");
  assert(result.session?.speakingBacklogEvidence?.item_id === result.diagnosis.backlogItemId, "session should target diagnosed backlog item");
  assert(existsSync(result.mission.htmlPath), "practice should write mission HTML");
  assert(existsSync(result.scene.htmlPath), "practice should write scene HTML");
  assert(result.scene.frameCount === 4, "practice scene should include four learning frames");
  assert(existsSync(result.session.artifactPath), "practice should write session artifact");
  assert(existsSync(result.weekly.mirrorPath), "practice should write weekly mirror");
  assert(existsSync(result.report.path), "practice should write learner report JSON");
  assert(existsSync(result.report.htmlPath), "practice should write learner report HTML");
  assert(existsSync(result.cockpit.statePath), "practice should write cockpit state");
  assert(existsSync(result.cockpit.htmlPath), "practice should write cockpit HTML");
  assertNoLearnerCommandLeak(result.learnerFacing);

  const report = readJson(result.report.path);
  assert(report.windows.seven_day.session_count === 1, "report should count the practice session in 7-day window");
  assert(report.generated_artifacts.latest_mission?.mission_id === result.mission.id, "report should link generated mission");
  assert(report.generated_artifacts.latest_scene?.scene_id === result.scene.id, "report should link generated scene");

  const cockpit = readJson(result.cockpit.statePath);
  assert(cockpit.journey.latest_learner_report?.html, "cockpit should link the learner report");
  assert(cockpit.journey.latest_generated_mission?.mission_id === result.mission.id, "cockpit should link generated mission");
  assert(cockpit.journey.latest_generated_scene?.scene_id === result.scene.id, "cockpit should link generated scene");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        missionId: result.mission.id,
        sceneId: result.scene.id,
        sessionId: result.session.id,
        reportPath: result.report.path,
        cockpitPath: result.cockpit.htmlPath,
        learnerFacing: result.learnerFacing,
      },
      null,
      2,
    ),
  );
}

main();
