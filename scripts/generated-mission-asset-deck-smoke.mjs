#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const tmpRoot = resolve(repoRoot, "tmp/generated-mission-asset-deck");
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
  for (const forbidden of [
    "github",
    "pull request",
    "pr #",
    "issue #",
    "smoke",
    "implementation log",
    "milestone",
  ]) {
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
  ]) {
    assert(!lower.includes(forbidden), `${label} leaked unsupported claim: ${forbidden}`);
  }
}

function assertDeck(deckState, deckHtml) {
  assert(deckState.schema_version === 1, "deck schema mismatch");
  assert(deckState.canonical_completion_path === "text-first", "deck should keep text-first canonical");
  assert(deckState.evidence_required === "artifacts/sessions/*.json", "deck should require session evidence");
  assert(deckState.completion_policy.can_mark_complete_without_session_evidence === false, "deck should not complete without evidence");
  assert(deckState.assets.length >= 6, "deck should render all contract assets");
  for (const id of [
    "text-practice",
    "interactive-html-scene",
    "image-information-gap",
    "voice-transcript",
    "remotion-storyboard",
    "future-realtime-hook",
  ]) {
    const asset = deckState.assets.find((candidate) => candidate.id === id);
    assert(asset, `deck missing ${id}`);
    assert(asset.requires_learner_output === true, `${id} should require learner output`);
    assert(asset.expected_evidence.session_artifact === deckState.evidence_required, `${id} evidence mismatch`);
  }
  assert(deckHtml.includes("Generated mission asset deck"), "deck HTML title missing");
  assert(deckHtml.includes("remotion-storyboard"), "deck HTML should include Remotion-style storyboard");
  assert(deckState.storyboard_artifact?.html, "deck state should link generated storyboard artifact");
  assert(deckHtml.includes(deckState.storyboard_artifact.html), "deck HTML should render generated storyboard artifact path");
  assert(deckHtml.includes("learner output required: true"), "deck HTML should show learner output requirement");
  assert(deckHtml.includes("완료는 learner output"), "deck HTML should state completion policy");
  assertNoProductSurfaceLeak(JSON.stringify(deckState), "deck state");
  assertNoProductSurfaceLeak(deckHtml, "deck HTML");
  const { blocked_claims: _blockedClaims, ...claimCheckedState } = deckState;
  assertNoUnsupportedClaims(JSON.stringify(claimCheckedState), "deck state");
  assertNoUnsupportedClaims(deckHtml, "deck HTML");
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
    "I want a generated asset deck that still requires speaking evidence.",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "diagnose",
    "--learner-root",
    learnerRoot,
    "--say",
    "I get stuck when I do not know the exact word.",
    "--json",
  ]);

  const deck = runJson([
    "scripts/english-learning-harness.mjs",
    "asset-deck",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T11:00:00.000Z",
    "--json",
  ]);
  assert(deck.status === "pass", "asset-deck command should pass");
  assert(existsSync(deck.deckStatePath), "deck state should exist");
  assert(existsSync(deck.deckHtmlPath), "deck HTML should exist");
  const deckState = readJson(deck.deckStatePath);
  const deckHtml = readFileSync(deck.deckHtmlPath, "utf8");
  assertDeck(deckState, deckHtml);

  const practice = runJson([
    "scripts/english-learning-harness.mjs",
    "practice",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-03T11:00:00.000Z",
    "--say",
    "I do not know the exact word, but I can describe it simply.",
    "--json",
  ]);
  assert(practice.assetDeck?.htmlPath && existsSync(practice.assetDeck.htmlPath), "practice should create asset deck");
  assert(practice.assetDeck.assetCount >= 6, "practice deck should include contract assets");

  const report = readJson(practice.report.path);
  assert(report.generated_artifacts.latest_asset_deck?.html, "learner report should link latest asset deck");
  assert(
    report.generated_artifacts.latest_asset_deck.asset_count === practice.assetDeck.assetCount,
    "report asset deck count mismatch",
  );
  const cockpit = readJson(practice.cockpit.statePath);
  assert(cockpit.journey.latest_mission_asset_deck?.html, "cockpit should link latest asset deck");
  assert(cockpit.files.latest_mission_asset_deck, "cockpit files should expose latest asset deck");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-10",
        learnerRoot,
        deckStatePath: deck.deckStatePath,
        deckHtmlPath: deck.deckHtmlPath,
        practiceDeckHtmlPath: practice.assetDeck.htmlPath,
        assetCount: practice.assetDeck.assetCount,
        linkedReportDeck: report.generated_artifacts.latest_asset_deck.html,
        linkedCockpitDeck: cockpit.journey.latest_mission_asset_deck.html,
        claimBoundary: deck.claimBoundary,
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
        issue: "AIOS-10",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
