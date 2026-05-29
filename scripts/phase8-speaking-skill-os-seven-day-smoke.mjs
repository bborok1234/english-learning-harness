#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-8-speaking-skill-os-seven-day");
const learnerRoot = resolve(smokeRoot, "learner");
const startDate = new Date("2026-05-20T09:00:00.000Z");

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

function responseFor(skill, day) {
  if (skill === "repair") {
    return "I don't know how to say it, but the meeting felt lighter today.";
  }
  if (skill === "clarification" && day === 2) {
    return "I answer with one sentence only.";
  }
  if (skill === "clarification") {
    return "Could you repeat what you mean? I want to answer clearly.";
  }
  if (skill === "soft_disagreement") {
    return "I see your point, but I feel coffee is too strong for me.";
  }
  if (skill === "follow_ups") {
    return "Tea helps me focus because it feels warm and quiet.";
  }
  return "I can start with one small sentence today.";
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--name",
    "Seven Day Speaking OS Learner",
    "--motivation",
    "I want daily targeted speaking work, not generic chat.",
    "--json",
  ]);

  const diagnosis = runJson([
    "scripts/english-learning-harness.mjs",
    "diagnose",
    "--say",
    "Could you repeat? I don't know how to say it, but I don't think coffee is good because my stomach hurts.",
    "--date",
    isoDay(0),
    "--json",
  ]);
  assert(diagnosis.backlogItems.length >= 4, "diagnosis should seed a multi-skill backlog");

  const dayResults = [];
  for (let day = 1; day <= 7; day += 1) {
    const daily = runJson([
      "scripts/english-learning-harness.mjs",
      "daily",
      "--date",
      isoDay(day),
      "--json",
    ]);
    const nextSkill = daily.cockpit.speaking_os.next_item?.skill || "starts";
    const today = runJson([
      "scripts/english-learning-harness.mjs",
      "today",
      "--date",
      isoDay(day),
      "--say",
      responseFor(nextSkill, day),
      "--json",
    ]);
    dayResults.push({
      day,
      nextSkill,
      result: today.speakingBacklogEvidence?.result || "generic",
      status: today.speakingBacklogEvidence?.status || "",
    });
  }

  const backlog = runJson(["scripts/english-learning-harness.mjs", "backlog", "--json"]);
  const attempts = backlog.items.flatMap((item) => item.attempts.map((attempt) => ({ skill: item.skill, ...attempt })));
  assert(attempts.length >= 4, "seven-day run should record several speaking backlog attempts");
  assert(attempts.some((attempt) => attempt.result === "needs_review"), "seven-day run should include a failed transfer attempt");
  assert(backlog.passedCount >= 4, "seven-day run should pass the seeded speaking backlog");

  const weekly = runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--date",
    isoDay(7),
    "--json",
  ]);
  assert(weekly.mirror.speaking_os_summary.backlog_count >= 4, "weekly mirror should summarize speaking backlog");
  assert(weekly.mirror.speaking_os_summary.passed_count >= 4, "weekly mirror should summarize passed speaking backlog");

  const exported = runJson([
    "scripts/english-learning-harness.mjs",
    "export",
    "--date",
    isoDay(7),
    "--json",
  ]);
  assert(exported.summary.session_count === 7, "export should summarize seven sessions");
  assert(exported.summary.speaking_backlog_passed_count >= 4, "export should include passed speaking backlog count");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M8-3",
        learnerRoot,
        dayResults,
        backlogCount: backlog.itemCount,
        passedCount: backlog.passedCount,
        attemptCount: attempts.length,
        weeklyMirrorPath: weekly.mirrorPath,
        evidencePackPath: exported.evidencePackPath,
        claimBoundary:
          "This proves a local seven-day Speaking Skill OS fixture only. It does not prove real learner outcomes.",
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
        issue: "M8-3",
        error: error.message,
        claimBoundary:
          "A failing seven-day smoke means Speaking Skill OS is not ready to claim local journey mechanics.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
