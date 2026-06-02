#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { validateMissionAssetContract } from "./lib/english-learning-store.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const tmpRoot = resolve(repoRoot, "tmp/multimodal-mission-asset-contract-smoke");
const learnerRoot = resolve(tmpRoot, "learner");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  return JSON.parse(
    execFileSync("node", args, {
      cwd: repoRoot,
      encoding: "utf8",
    }),
  );
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertNoUnsupportedClaims(value, label) {
  const lower = JSON.stringify(value).toLowerCase();
  for (const forbidden of [
    "proves fluency",
    "guaranteed",
    "native speaker",
    "your level",
    "realtime voice adventure is supported",
    "generated media improves learning",
  ]) {
    assert(!lower.includes(forbidden), `${label} leaked unsupported claim: ${forbidden}`);
  }
}

function assertContract(contract) {
  const errors = validateMissionAssetContract(contract);
  assert(errors.length === 0, `valid asset contract should pass: ${errors.join("; ")}`);
  assert(contract.canonical_completion_path === "text-first", "text-first fallback should be canonical");
  assert(contract.assets.length >= 5, "contract should include text/html/image/voice/remotion assets");
  const byId = Object.fromEntries(contract.assets.map((asset) => [asset.id, asset]));
  for (const requiredId of [
    "text-practice",
    "interactive-html-scene",
    "image-information-gap",
    "voice-transcript",
    "remotion-storyboard",
  ]) {
    assert(byId[requiredId], `missing ${requiredId}`);
    assert(byId[requiredId].target_skill === contract.target_skill, `${requiredId} target skill mismatch`);
    assert(byId[requiredId].requires_learner_output === true, `${requiredId} should require learner output`);
    assert(
      byId[requiredId].expected_evidence.session_artifact === "artifacts/sessions/*.json",
      `${requiredId} should require session artifact evidence`,
    );
  }
  assert(byId["text-practice"].completion_role === "canonical", "text asset should be canonical");
  assert(byId["interactive-html-scene"].completion_role === "evidence-guided", "HTML scene should guide evidence");
  assert(byId["image-information-gap"].mode === "image", "image asset mode mismatch");
  assert(byId["voice-transcript"].mode === "voice-transcript", "voice transcript asset mode mismatch");
  assert(byId["remotion-storyboard"].mode === "remotion-storyboard", "Remotion-style storyboard asset missing");
  assert(
    contract.blocked_claims.includes("realtime voice is supported"),
    "realtime voice support should remain blocked",
  );
  assert(
    contract.blocked_claims.includes("generated media improves learning outcomes"),
    "generated-media learning gains should remain blocked",
  );
  assertNoUnsupportedClaims(contract.claim_boundary, "contract claim boundary");
  for (const asset of contract.assets) {
    assertNoUnsupportedClaims(asset.claim_boundary, `${asset.id} claim boundary`);
  }
}

function expectInvalid(contract, expectedFragment) {
  const errors = validateMissionAssetContract(contract);
  assert(errors.some((error) => error.includes(expectedFragment)), `expected invalid contract error: ${expectedFragment}`);
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "learner",
    "--motivation",
    "I want multimodal mission assets to require real speaking evidence.",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "diagnose",
    "--learner-root",
    learnerRoot,
    "--say",
    "I do not know how to say the exact word, but I want to keep talking.",
    "--json",
  ]);

  const mission = runJson([
    "scripts/english-learning-harness.mjs",
    "mission",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T10:00:00.000Z",
    "--json",
  ]);
  assert(existsSync(mission.missionStatePath), "mission state should exist");
  assert(existsSync(mission.missionHtmlPath), "mission HTML should exist");
  const missionState = readJson(mission.missionStatePath);
  assertContract(missionState.asset_contract);
  assert(missionState.asset_contract.target_skill === missionState.target_skill, "contract target should match mission");

  const html = readFileSync(mission.missionHtmlPath, "utf8");
  assert(html.includes("Asset evidence contract"), "mission HTML should render asset contract summary");
  assert(html.includes("remotion-storyboard"), "mission HTML should expose Remotion-style storyboard as optional asset");
  assert(html.includes("artifacts/sessions/*.json"), "mission HTML should show session evidence requirement");
  assertNoUnsupportedClaims(html, "mission HTML");

  const scene = runJson([
    "scripts/english-learning-harness.mjs",
    "scene",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T10:00:00.000Z",
    "--json",
  ]);
  assert(existsSync(scene.sceneStatePath), "scene state should exist");
  const sceneState = readJson(scene.sceneStatePath);
  assert(
    sceneState.required_evidence.session_artifact === missionState.asset_contract.expected_evidence.session_artifact,
    "scene evidence requirement should match mission asset contract",
  );

  const decorative = structuredClone(missionState.asset_contract);
  decorative.assets[1] = {
    ...decorative.assets[1],
    completion_role: "decorative",
    requires_learner_output: false,
  };
  expectInvalid(decorative, "must require learner output");
  expectInvalid(decorative, "cannot be decorative");

  const noText = {
    ...missionState.asset_contract,
    assets: missionState.asset_contract.assets.filter((asset) => asset.id !== "text-practice"),
  };
  expectInvalid(noText, "missing text-practice");
  expectInvalid(noText, "canonical text asset");

  const noEvidence = structuredClone(missionState.asset_contract);
  delete noEvidence.assets[2].expected_evidence.session_artifact;
  expectInvalid(noEvidence, "expected_evidence.session_artifact is required");

  const unsupportedClaim = structuredClone(missionState.asset_contract);
  unsupportedClaim.assets[0].claim_boundary = "This proves fluency.";
  expectInvalid(unsupportedClaim, "unsupported claim");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-9",
        learnerRoot,
        missionStatePath: mission.missionStatePath,
        missionHtmlPath: mission.missionHtmlPath,
        sceneStatePath: scene.sceneStatePath,
        assetCount: missionState.asset_contract.assets.length,
        canonicalCompletionPath: missionState.asset_contract.canonical_completion_path,
        blockedClaims: missionState.asset_contract.blocked_claims,
        claimBoundary: missionState.asset_contract.claim_boundary,
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
        issue: "AIOS-9",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
