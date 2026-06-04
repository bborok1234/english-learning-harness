#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/skill-conversation-simulation-smoke");
const learnerRoot = resolve(tmpRoot, "learner");

const simulatedTranscript = [
  {
    role: "codex",
    text:
      '오늘은 한 문장만 해볼게요. 친구가 "usual place"라고 했는데 장소가 애매합니다. 영어로 어디를 말하는지 한 번만 물어보세요.',
  },
  {
    role: "learner",
    text: "Which place do you mean?",
  },
  {
    role: "codex",
    text:
      '좋아요. 자연스럽게는 "Which place do you mean?" 그대로 쓸 수 있어요. 같은 상황에서 한 번 더 천천히 말해볼게요.',
  },
  {
    role: "learner",
    text: "Which place do you mean?",
  },
  {
    role: "codex",
    text:
      "오늘 전달한 것: 애매한 장소를 확인했어요.\n자연스럽게 바꾸면: Which place do you mean?\n다음에 써볼 한 문장: Could you tell me which place you mean?\n오늘의 local report와 cockpit도 갱신됐습니다.",
  },
];

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

function transcriptText() {
  return simulatedTranscript.map((turn) => `${turn.role}: ${turn.text}`).join("\n");
}

function assertSkillContracts() {
  const onboarding = readFileSync(resolve(repoRoot, "skills/onboarding/SKILL.md"), "utf8");
  const daily = readFileSync(resolve(repoRoot, "skills/daily-session/SKILL.md"), "utf8");
  const mirror = readFileSync(resolve(repoRoot, "skills/mini-mirror/SKILL.md"), "utf8");
  assert(onboarding.includes("Do not ask the learner to run `node` commands"), "onboarding must ban learner command chores");
  assert(daily.includes("Learner-Facing Transcript Shape"), "daily skill must define learner-facing transcript shape");
  assert(daily.includes("Never expose rubric labels"), "daily skill must reject exposed rubric labels");
  assert(daily.includes("Do not make the first practice prompt about this repository"), "daily skill must avoid project-specific first prompt");
  assert(daily.includes("practice-next --json"), "daily skill must prefer the learner-ready start card before first prompt");
  assert(daily.includes("practice-reply --quick-reply"), "daily skill must route selected quick replies internally");
  assert(daily.includes("practice-reply --say"), "daily skill must route freeform learner answers internally");
  assert(daily.includes("quick replies"), "daily skill must expose quick replies through the start card contract");
  assert(daily.includes("agent-operated `practice` engine path"), "daily skill must prefer practice engine path");
  assert(mirror.includes("오늘 전달한 것:"), "mini mirror must keep short Korean output shape");
}

function assertLearnerTranscriptSafe() {
  const text = transcriptText();
  const lower = text.toLowerCase();
  for (const forbidden of [
    "node scripts/",
    "npm ",
    "git clone",
    "github",
    "pull request",
    "issue #",
    "smoke",
    "rubric",
    "evaluation field",
    "handoff document",
    "your project",
    "project planning",
    "a clarification question i can ask",
    "native speaker",
    "your level",
    "guaranteed",
    "proves fluency",
  ]) {
    assert(!lower.includes(forbidden), `simulated learner transcript leaked forbidden text: ${forbidden}`);
  }
  assert(text.includes("usual place"), "transcript should use a concrete everyday ambiguity");
  assert(text.includes("Which place do you mean?"), "transcript should include a realistic learner answer");
  assert(text.includes("오늘 전달한 것:"), "transcript should end with mini mirror success");
  assert(text.includes("자연스럽게 바꾸면:"), "transcript should include recast");
  assert(text.includes("다음에 써볼 한 문장:"), "transcript should include next phrase");
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });
  assertSkillContracts();
  assertLearnerTranscriptSafe();

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "learner",
    "--motivation",
    "I want Codex to lead short daily English scenes.",
    "--json",
  ]);

  const practice = runJson([
    "scripts/english-learning-harness.mjs",
    "practice",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T14:00:00.000Z",
    "--say",
    simulatedTranscript.find((turn) => turn.role === "learner").text,
    "--say",
    simulatedTranscript.filter((turn) => turn.role === "learner").at(-1).text,
    "--json",
  ]);

  assert(practice.status === "pass", "practice should pass under skill simulation");
  assert(practice.path === "codex-operated-practice-flow", "practice should use Codex-operated flow");
  assert(existsSync(practice.mission.htmlPath), "skill simulation should create mission HTML");
  assert(existsSync(practice.scene.htmlPath), "skill simulation should create scene HTML");
  assert(existsSync(practice.session.artifactPath), "skill simulation should create session artifact");
  assert(existsSync(practice.report.path), "skill simulation should create learner report");
  assert(existsSync(practice.cockpit.htmlPath), "skill simulation should create cockpit HTML");

  const report = readJson(practice.report.path);
  const cockpit = readJson(practice.cockpit.statePath);
  assert(report.windows.seven_day.session_count === 1, "report should count skill simulation session");
  assert(report.generated_artifacts.latest_scene?.scene_id === practice.scene.id, "report should link scene");
  assert(cockpit.journey.latest_generated_scene?.scene_id === practice.scene.id, "cockpit should link scene");
  assert(cockpit.journey.latest_learner_report?.html, "cockpit should link learner report");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        transcriptTurns: simulatedTranscript.length,
        missionId: practice.mission.id,
        sceneId: practice.scene.id,
        sessionId: practice.session.id,
        reportPath: practice.report.path,
        cockpitPath: practice.cockpit.htmlPath,
        claimBoundary:
          "This validates a local skill-level transcript fixture and Codex-operated persistence path only.",
      },
      null,
      2,
    ),
  );
}

main();
