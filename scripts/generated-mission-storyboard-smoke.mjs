#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const tmpRoot = resolve(repoRoot, "tmp/generated-mission-storyboard");
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

function assertNoProductSurfaceLeak(text, label) {
  const lower = text.toLowerCase();
  for (const forbidden of ["github", "pull request", "pr #", "issue #", "smoke", "implementation log", "milestone"]) {
    assert(!lower.includes(forbidden), `${label} leaked engineering language: ${forbidden}`);
  }
}

function assertNoUnsupportedClaims(text, label) {
  const lower = text.toLowerCase();
  for (const forbidden of [
    "proves fluency",
    "guaranteed",
    "native speaker",
    "your level",
    "realtime voice adventure is supported",
    "generated media improves learning",
    "rendered video",
  ]) {
    assert(!lower.includes(forbidden), `${label} leaked unsupported claim: ${forbidden}`);
  }
}

function assertStoryboard(state, html) {
  assert(state.schema_version === 1, "storyboard schema mismatch");
  assert(state.mode === "remotion-storyboard", "storyboard mode mismatch");
  assert(state.completion_role === "optional-preparation-asset", "storyboard completion role mismatch");
  assert(state.expected_evidence.session_artifact === "artifacts/sessions/*.json", "storyboard evidence mismatch");
  assert(state.frames.length === 4, "storyboard should render four frames");
  assert(state.frames.some((frame) => frame.label === "Evidence checkpoint"), "storyboard should include evidence checkpoint");
  assert(state.claim_boundary.includes("local preparation artifact"), "storyboard claim boundary should be explicit");
  assert(html.includes("Generated mission storyboard"), "storyboard HTML title missing");
  assert(html.includes("data-storyboard-play"), "storyboard HTML play control missing");
  assert(html.includes("Required evidence: artifacts/sessions/*.json"), "storyboard HTML evidence requirement missing");
  assert(html.includes("This generated storyboard is a local preparation artifact"), "storyboard HTML boundary missing");
  assertNoProductSurfaceLeak(JSON.stringify(state), "storyboard state");
  assertNoProductSurfaceLeak(html, "storyboard HTML");
  const { blocked_claims: _blockedClaims, ...claimCheckedState } = state;
  assertNoUnsupportedClaims(JSON.stringify(claimCheckedState), "storyboard state");
  assertNoUnsupportedClaims(html, "storyboard HTML");
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
    "I want generated storyboards to support speaking practice without replacing evidence.",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "diagnose",
    "--learner-root",
    learnerRoot,
    "--say",
    "I can start, but I need help turning a scene into one spoken sentence.",
    "--json",
  ]);

  const storyboard = runJson([
    "scripts/english-learning-harness.mjs",
    "storyboard",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T12:00:00.000Z",
    "--json",
  ]);
  assert(storyboard.status === "pass", "storyboard command should pass");
  assert(existsSync(storyboard.storyboardStatePath), "storyboard state missing");
  assert(existsSync(storyboard.storyboardHtmlPath), "storyboard HTML missing");
  const storyboardState = readJson(storyboard.storyboardStatePath);
  const storyboardHtml = readFileSync(storyboard.storyboardHtmlPath, "utf8");
  assertStoryboard(storyboardState, storyboardHtml);

  const deck = runJson([
    "scripts/english-learning-harness.mjs",
    "asset-deck",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T12:00:00.000Z",
    "--json",
  ]);
  assert(deck.deck.storyboardArtifact?.html, "asset-deck command should expose storyboard artifact");
  const deckState = readJson(deck.deckStatePath);
  const deckHtml = readFileSync(deck.deckHtmlPath, "utf8");
  const remotionAsset = deckState.assets.find((asset) => asset.id === "remotion-storyboard");
  assert(remotionAsset?.artifact?.html, "deck state should link storyboard artifact from remotion asset");
  assert(deckHtml.includes(remotionAsset.artifact.html), "deck HTML should render storyboard artifact path");
  assert(existsSync(resolve(learnerRoot, remotionAsset.artifact.html)), "linked storyboard HTML should exist");
  assertNoProductSurfaceLeak(deckHtml, "deck HTML");
  assertNoUnsupportedClaims(deckHtml, "deck HTML");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-13",
        learnerRoot,
        storyboardStatePath: storyboard.storyboardStatePath,
        storyboardHtmlPath: storyboard.storyboardHtmlPath,
        deckStatePath: deck.deckStatePath,
        deckHtmlPath: deck.deckHtmlPath,
        linkedStoryboard: remotionAsset.artifact.html,
        frameCount: storyboard.storyboard.frameCount,
        claimBoundary: storyboard.claimBoundary,
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
        issue: "AIOS-13",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
