#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/adaptive-scene-variants-smoke");

const cases = [
  {
    skill: "clarification",
    sample: "Could you repeat what you mean?",
    expectedCue: "확인 질문",
  },
  {
    skill: "repair",
    sample: "I don't know how to say it, but this place feels nice.",
    expectedCue: "이어가기",
  },
  {
    skill: "soft_disagreement",
    sample: "I see your point, but I think we should eat first.",
    expectedCue: "부드럽게",
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

function assertNoUnsupportedClaims(text, label) {
  const lower = text.toLowerCase();
  for (const forbidden of [
    "proves fluency",
    "guaranteed",
    "generated worlds increase retention",
    "realtime voice adventure is supported",
    "native speaker",
    "your level",
  ]) {
    assert(!lower.includes(forbidden), `${label} leaked unsupported claim: ${forbidden}`);
  }
}

function runCase(testCase, index) {
  const learnerRoot = resolve(tmpRoot, `${testCase.skill}-learner`);
  const date = `2026-06-0${index + 2}T09:00:00.000Z`;
  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  const diagnosis = runJson([
    "scripts/english-learning-harness.mjs",
    "diagnose",
    "--learner-root",
    learnerRoot,
    "--say",
    testCase.sample,
    "--json",
  ]);
  assert(diagnosis.backlogItem.skill === testCase.skill, `diagnosis should target ${testCase.skill}`);
  const scene = runJson([
    "scripts/english-learning-harness.mjs",
    "scene",
    "--learner-root",
    learnerRoot,
    "--date",
    date,
    "--json",
  ]);
  const sceneState = readJson(scene.sceneStatePath);
  const sceneHtml = readFileSync(scene.sceneHtmlPath, "utf8");
  assert(sceneState.target_skill === testCase.skill, `scene target skill mismatch for ${testCase.skill}`);
  assert(sceneState.variant?.id, `scene variant missing for ${testCase.skill}`);
  assert(sceneState.variant?.setting, `scene variant setting missing for ${testCase.skill}`);
  assert(sceneState.variant?.cue_style.includes(testCase.expectedCue), `scene cue style mismatch for ${testCase.skill}`);
  assert(sceneState.required_evidence.speaking_backlog_item_id === diagnosis.backlogItem.id, "scene should keep backlog evidence link");
  assert(sceneState.frames.length === 4, "scene should keep four learning frames");
  assert(sceneHtml.includes(sceneState.variant.label), "scene HTML should show variant label");
  assert(sceneHtml.includes(sceneState.variant.setting), "scene HTML should show variant setting");
  assertNoUnsupportedClaims(JSON.stringify(sceneState), `${testCase.skill} scene state`);
  assertNoUnsupportedClaims(sceneHtml, `${testCase.skill} scene html`);
  return {
    skill: testCase.skill,
    variantId: sceneState.variant.id,
    variantLabel: sceneState.variant.label,
    sceneStatePath: scene.sceneStatePath,
  };
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });
  const results = cases.map(runCase);
  const variantIds = new Set(results.map((result) => result.variantId));
  assert(variantIds.size === results.length, "expected different variants across target skills");
  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot: tmpRoot,
        variants: results,
        claimBoundary:
          "This validates local scene variant generation mechanics only, not engagement or learning outcomes.",
      },
      null,
      2,
    ),
  );
}

main();
