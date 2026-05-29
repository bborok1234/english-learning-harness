#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateInteractionEvent } from "./lib/english-learning-store.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/phase-4-multimodal-gate");
const learnerRoot = resolve(tmpRoot, "learner");
const audioPath = resolve(tmpRoot, "coffee-chat-audio-placeholder.wav");
const imagePath = resolve(tmpRoot, "cafe-counter-scene.txt");

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

function assertNoUnsupportedClaims(value) {
  const text = JSON.stringify(value).toLowerCase();
  for (const claim of [
    "native speaker",
    "guaranteed",
    "fluent",
    "your level",
    "pronunciation score",
    "realtime conversation",
    "image proves learning",
    "visual learning transfer",
    "video simulation proves transfer",
  ]) {
    assert(!text.includes(claim), `unsupported multimodal claim appeared: ${claim}`);
  }
}

function sessionEvent(commandResult, expectedModality, source) {
  assert(existsSync(commandResult.artifactPath), `${source} artifact missing`);
  const artifact = readJson(commandResult.artifactPath);
  assert(Array.isArray(artifact.interaction_events), `${source} artifact missing interaction_events`);
  assert(artifact.interaction_events.length === 1, `${source} artifact should contain one event`);
  const event = artifact.interaction_events[0];
  validateInteractionEvent(event, `${source}.interaction_events[0]`);
  assert(event.modality === expectedModality, `${source} event modality mismatch`);
  assertNoUnsupportedClaims(artifact);
  return event;
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });
  mkdirSync(tmpRoot, { recursive: true });
  writeFileSync(audioPath, "Fixture placeholder for learner-recorded cafe chat audio.");
  writeFileSync(imagePath, "Fixture placeholder for a cafe counter scene with a hidden wallet.");

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);

  const text = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-05-29T09:00:00.000Z",
    "--say",
    "I need a small coffee and I want to ask where the counter is.",
    "--json",
  ]);
  const voice = runJson([
    "scripts/english-learning-harness.mjs",
    "voice",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-05-29T09:05:00.000Z",
    "--audio-file",
    audioPath,
    "--say",
    "Could you repeat the price slowly?",
    "--json",
  ]);
  const image = runJson([
    "scripts/english-learning-harness.mjs",
    "image",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-05-29T09:10:00.000Z",
    "--image-file",
    imagePath,
    "--hidden-detail",
    "the wallet is partly hidden near the cup",
    "--clarification-prompt",
    "Where is the wallet compared with the cup?",
    "--say",
    "The cup is beside the counter, but I need to check what is behind it.",
    "--json",
  ]);

  const events = [
    sessionEvent(text, "text", "text"),
    sessionEvent(voice, "voice", "voice"),
    sessionEvent(image, "image", "image"),
  ];
  const modalities = new Set(events.map((event) => event.modality));
  for (const modality of ["text", "voice", "image"]) {
    assert(modalities.has(modality), `missing ${modality} event`);
  }
  assert(voice.interactionEvents[0].source_artifact?.path === audioPath, "voice output missing audio metadata");
  assert(image.interactionEvents[0].source_artifact?.path === imagePath, "image output missing image metadata");
  assert(image.interactionEvents[0].source_artifact?.hidden_detail.includes("wallet"), "image output missing hidden detail");

  const weekly = runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--learner-root",
    learnerRoot,
    "--date",
    "2026-05-29T09:15:00.000Z",
    "--json",
  ]);
  const summary = weekly.mirror.interaction_event_summary;
  assert(summary.event_count === 3, "weekly summary event count mismatch");
  for (const modality of ["text", "voice", "image"]) {
    assert(summary.modalities.includes(modality), `weekly summary missing ${modality} modality`);
  }
  assert(summary.transfer_targets.length > 0, "weekly summary should preserve transfer targets");
  assertNoUnsupportedClaims(weekly.mirror);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        eventCount: summary.event_count,
        modalities: summary.modalities,
        transferTargets: summary.transfer_targets,
        artifactPaths: [text.artifactPath, voice.artifactPath, image.artifactPath],
      },
      null,
      2,
    ),
  );
}

main();
