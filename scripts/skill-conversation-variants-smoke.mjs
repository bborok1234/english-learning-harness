#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/skill-conversation-variants-smoke");

const variants = [
  {
    id: "office-clarification",
    scene: "office clarification",
    date: "2026-06-02T09:00:00.000Z",
    transcript: [
      {
        role: "codex",
        text:
          '사무실에서 동료가 "the usual file"이라고 했는데 어떤 파일인지 애매합니다. 영어로 한 번만 확인해보세요.',
      },
      { role: "learner", text: "Which file do you mean?" },
      {
        role: "codex",
        text:
          '좋아요. 자연스럽게는 "Which file do you mean?" 그대로 쓸 수 있어요. 한 번 더 천천히 말해볼게요.',
      },
      { role: "learner", text: "Could you tell me which file you mean?" },
      {
        role: "codex",
        text:
          "오늘 전달한 것: 애매한 파일을 확인했어요.\n자연스럽게 바꾸면: Which file do you mean?\n다음에 써볼 한 문장: Could you tell me which file you mean?",
      },
    ],
  },
  {
    id: "cafe-repair",
    scene: "cafe ordering repair",
    date: "2026-06-03T09:00:00.000Z",
    transcript: [
      {
        role: "codex",
        text:
          "카페에서 원하는 음료 이름이 바로 생각나지 않습니다. 모르는 단어를 피해서 주문을 이어가보세요.",
      },
      { role: "learner", text: "I do not know the name, but I want cold coffee with milk." },
      {
        role: "codex",
        text:
          "좋아요. 자연스럽게는 \"I don't know the name, but I want cold coffee with milk.\"라고 할 수 있어요.",
      },
      { role: "learner", text: "What I want to say is cold coffee with milk, please." },
      {
        role: "codex",
        text:
          "오늘 전달한 것: 단어가 막혀도 주문을 이어갔어요.\n자연스럽게 바꾸면: I don't know the name, but I want cold coffee with milk.\n다음에 써볼 한 문장: What I want to say is cold coffee with milk.",
      },
    ],
  },
  {
    id: "desk-description",
    scene: "nearby object description",
    date: "2026-06-04T09:00:00.000Z",
    transcript: [
      {
        role: "codex",
        text:
          "책상 위를 한 컷 사진처럼 상상해볼게요. 보이는 물건 세 가지와 사람들의 분위기를 영어로 짧게 말해보세요.",
      },
      {
        role: "learner",
        text: "There are desks, chairs, and monitors. People are working quietly.",
      },
      {
        role: "codex",
        text:
          '좋아요. 자연스럽게는 "There are desks, chairs, and monitors. People are working quietly."라고 할 수 있어요.',
      },
      {
        role: "learner",
        text: "I can see many desks and monitors, and people are working now.",
      },
      {
        role: "codex",
        text:
          "오늘 전달한 것: 공간의 물건과 분위기를 설명했어요.\n자연스럽게 바꾸면: I can see desks, chairs, and monitors. People are working quietly.\n다음에 써볼 한 문장: I can see many desks and monitors.",
      },
    ],
  },
  {
    id: "lunch-soft-disagreement",
    scene: "lunch preference disagreement",
    date: "2026-06-05T09:00:00.000Z",
    transcript: [
      {
        role: "codex",
        text:
          "친구가 매운 음식을 먹자고 합니다. 당신은 배고프지만 오늘은 매운 음식이 부담스럽습니다. 부드럽게 다른 선택을 말해보세요.",
      },
      { role: "learner", text: "I see your point, but I want something light today." },
      {
        role: "codex",
        text:
          '좋아요. 자연스럽게는 "I see your point, but I want something light today."라고 말할 수 있어요.',
      },
      { role: "learner", text: "I am hungry, but spicy food is too much for me today." },
      {
        role: "codex",
        text:
          "오늘 전달한 것: 배고픈 상태와 선호를 부드럽게 말했어요.\n자연스럽게 바꾸면: I see your point, but I want something light today.\n다음에 써볼 한 문장: Spicy food is too much for me today.",
      },
    ],
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

function transcriptText(variant) {
  return variant.transcript.map((turn) => `${turn.role}: ${turn.text}`).join("\n");
}

function learnerTurns(variant) {
  return variant.transcript.filter((turn) => turn.role === "learner").map((turn) => turn.text);
}

function assertSkillContract() {
  const daily = readFileSync(resolve(repoRoot, "skills/daily-session/SKILL.md"), "utf8");
  assert(daily.includes("First-Use Variant Coverage"), "daily skill should define first-use variant coverage");
  assert(daily.includes("cafe ordering repair"), "daily skill should include cafe repair variant");
  assert(daily.includes("soft disagreement"), "daily skill should include soft disagreement variant");
  assert(daily.includes("nearby object description"), "daily skill should include description variant");
}

function assertTranscriptSafe(variant) {
  const text = transcriptText(variant);
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
    assert(!lower.includes(forbidden), `${variant.id} leaked forbidden learner-facing text: ${forbidden}`);
  }
  assert(text.includes("오늘 전달한 것:"), `${variant.id} should end with mini mirror success`);
  assert(text.includes("자연스럽게 바꾸면:"), `${variant.id} should include recast`);
  assert(text.includes("다음에 써볼 한 문장:"), `${variant.id} should include next phrase`);
  assert(learnerTurns(variant).length >= 2, `${variant.id} should include at least two learner turns`);
}

function assertNoUnsupportedClaims(value, label) {
  const lower = JSON.stringify(value).toLowerCase();
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

function runVariant(variant) {
  const learnerRoot = resolve(tmpRoot, variant.id);
  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "learner",
    "--motivation",
    `I want Codex to lead a ${variant.scene} first-use English scene.`,
    "--json",
  ]);

  const args = [
    "scripts/english-learning-harness.mjs",
    "practice",
    "--learner-root",
    learnerRoot,
    "--date",
    variant.date,
    "--scene-preset",
    variant.id,
  ];
  for (const turn of learnerTurns(variant)) {
    args.push("--say", turn);
  }
  args.push("--json");
  const practice = runJson(args);

  assert(practice.status === "pass", `${variant.id} practice should pass`);
  assert(practice.path === "codex-operated-practice-flow", `${variant.id} should use practice flow`);
  assert(existsSync(practice.mission.htmlPath), `${variant.id} mission HTML missing`);
  assert(existsSync(practice.scene.htmlPath), `${variant.id} scene HTML missing`);
  assert(existsSync(practice.session.artifactPath), `${variant.id} session artifact missing`);
  assert(existsSync(practice.report.path), `${variant.id} learner report missing`);
  assert(existsSync(practice.cockpit.htmlPath), `${variant.id} cockpit HTML missing`);
  assertNoUnsupportedClaims(practice.learnerFacing, `${variant.id} learner-facing summary`);

  const report = readJson(practice.report.path);
  const cockpit = readJson(practice.cockpit.statePath);
  const sceneState = readJson(practice.scene.htmlPath.replace(/\.html$/, ".json"));
  const missionState = readJson(practice.mission.htmlPath.replace(/\.html$/, ".json"));
  assert(report.windows.seven_day.session_count === 1, `${variant.id} report should count one session`);
  assert(report.generated_artifacts.latest_mission?.mission_id === practice.mission.id, `${variant.id} report should link mission`);
  assert(report.generated_artifacts.latest_scene?.scene_id === practice.scene.id, `${variant.id} report should link scene`);
  assert(cockpit.journey.latest_learner_report?.html, `${variant.id} cockpit should link learner report`);
  assert(cockpit.journey.latest_generated_scene?.scene_id === practice.scene.id, `${variant.id} cockpit should link scene`);
  assert(missionState.scene_preset === variant.id, `${variant.id} mission should keep scene preset`);
  assert(sceneState.variant?.id === variant.id, `${variant.id} scene variant should match transcript preset`);
  assert(sceneState.required_evidence.session_artifact === "artifacts/sessions/*.json", `${variant.id} scene should require session evidence`);
  assertNoUnsupportedClaims(report, `${variant.id} learner report`);
  assertNoUnsupportedClaims(cockpit, `${variant.id} cockpit`);

  return {
    id: variant.id,
    scene: variant.scene,
    missionId: practice.mission.id,
    sceneId: practice.scene.id,
    sceneVariant: sceneState.variant?.id ?? "none",
    sessionId: practice.session.id,
    reportPath: practice.report.path,
    cockpitPath: practice.cockpit.htmlPath,
  };
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });
  assertSkillContract();

  const scenes = new Set();
  const results = [];
  for (const variant of variants) {
    assertTranscriptSafe(variant);
    scenes.add(variant.scene);
    results.push(runVariant(variant));
  }
  assert(variants.length >= 4, "at least four first-use variants should be covered");
  assert(scenes.size === variants.length, "first-use variants should cover distinct scenes");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-8",
        variantCount: variants.length,
        learnerRoot: tmpRoot,
        results,
        claimBoundary:
          "This validates local first-use conversation variants and Codex-operated persistence only, not real learner outcomes.",
      },
      null,
      2,
    ),
  );
}

main();
