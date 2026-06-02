#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const tmpRoot = resolve(repoRoot, "tmp/adaptive-mission-asset-priority");
const learnerRoot = resolve(tmpRoot, "learner");
const imagePath = resolve(tmpRoot, "desk-scene.txt");
const audioPath = resolve(tmpRoot, "voice-note.wav");

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

function topAsset(deckPath) {
  const state = readJson(deckPath);
  const top = state.assets.find((asset) => asset.priority?.recommended_next);
  assert(top, "deck should mark a recommended next asset");
  assert(state.top_asset_action.asset_id === top.id, "top_asset_action should match recommended asset");
  assert(top.priority.rank === 1, "top asset should have rank 1");
  return { state, top };
}

function assertTop(deckPath, expectedId, expectedReasonFragment) {
  const { state, top } = topAsset(deckPath);
  assert(top.id === expectedId, `expected top asset ${expectedId}, got ${top.id}`);
  assert(
    top.priority.reason.includes(expectedReasonFragment),
    `expected reason to include ${expectedReasonFragment}, got ${top.priority.reason}`,
  );
  assert(state.completion_policy.can_mark_complete_without_session_evidence === false, "deck should require evidence");
  assert(state.evidence_required === "artifacts/sessions/*.json", "deck evidence requirement mismatch");
  return { state, top };
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });
  mkdirSync(tmpRoot, { recursive: true });
  writeFileSync(imagePath, "Fixture image placeholder for desk object description.");
  writeFileSync(audioPath, "Fixture audio placeholder for transcript-backed voice.");

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--name",
    "learner",
    "--motivation",
    "I want the asset deck to adapt to what I have already practiced.",
    "--json",
  ]);
  runJson([
    "scripts/english-learning-harness.mjs",
    "diagnose",
    "--learner-root",
    learnerRoot,
    "--say",
    "I do not know how to say the exact word when I explain my desk.",
    "--json",
  ]);

  const emptyDeck = runJson([
    "scripts/english-learning-harness.mjs",
    "asset-deck",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T08:00:00.000Z",
    "--json",
  ]);
  assertTop(emptyDeck.deckStatePath, "text-practice", "canonical completion path");

  runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-02T08:10:00.000Z",
    "--say",
    "I do not know the exact word, but it is a small thing on my desk.",
    "--json",
  ]);
  const textDeck = runJson([
    "scripts/english-learning-harness.mjs",
    "asset-deck",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-03T08:00:00.000Z",
    "--json",
  ]);
  assertTop(textDeck.deckStatePath, "image-information-gap", "image modality evidence");

  runJson([
    "scripts/english-learning-harness.mjs",
    "image",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-03T08:10:00.000Z",
    "--image-file",
    imagePath,
    "--hidden-detail",
    "the notebook is behind the mug",
    "--say",
    "Where is the notebook exactly?",
    "--json",
  ]);
  const imageDeck = runJson([
    "scripts/english-learning-harness.mjs",
    "asset-deck",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-04T08:00:00.000Z",
    "--json",
  ]);
  assertTop(imageDeck.deckStatePath, "voice-transcript", "transcript-backed voice path");

  runJson([
    "scripts/english-learning-harness.mjs",
    "voice",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-04T08:10:00.000Z",
    "--audio-file",
    audioPath,
    "--say",
    "I mean the small notebook behind the mug.",
    "--json",
  ]);
  const voiceDeck = runJson([
    "scripts/english-learning-harness.mjs",
    "asset-deck",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-05T08:00:00.000Z",
    "--json",
  ]);
  assertTop(voiceDeck.deckStatePath, "interactive-html-scene", "generated scene frame");

  const cockpit = runJson([
    "scripts/english-learning-harness.mjs",
    "cockpit",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-06-05T08:20:00.000Z",
    "--json",
  ]);
  assert(cockpit.journey.latest_mission_asset_deck?.html, "cockpit should keep latest asset deck link");
  assert(cockpit.nextAssetAction?.asset_id === "interactive-html-scene", "cockpit next asset should match deck top asset");
  assert(
    cockpit.nextActions.some((action) => action.label === cockpit.nextAssetAction.label),
    "cockpit next actions should include asset action",
  );
  const cockpitHtml = readFileSync(cockpit.cockpitPath, "utf8");
  assert(cockpitHtml.includes("다음 asset action"), "cockpit HTML should show next asset action");
  assert(cockpitHtml.includes("scene frame"), "cockpit HTML should explain scene frame priority");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-11",
        learnerRoot,
        priorities: [
          { state: "no-evidence", top: "text-practice" },
          { state: "text", top: "image-information-gap" },
          { state: "text+image", top: "voice-transcript" },
          { state: "text+image+voice", top: "interactive-html-scene" },
        ],
        cockpitNextAsset: cockpit.nextAssetAction,
        claimBoundary:
          "This validates deterministic local asset prioritization mechanics only, not learning outcomes.",
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
        issue: "AIOS-11",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
