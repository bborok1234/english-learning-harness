#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateInteractionEvent } from "./lib/english-learning-store.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/phase-4-image-information-gap");
const learnerRoot = resolve(tmpRoot, "learner");
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
    "image proves learning",
    "visual learning transfer",
  ]) {
    assert(!text.includes(claim), `unsupported image claim appeared: ${claim}`);
  }
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });
  mkdirSync(tmpRoot, { recursive: true });
  writeFileSync(
    imagePath,
    "Fixture placeholder for a cafe counter scene: cup on the left, wallet partly hidden.",
  );

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  const image = runJson([
    "scripts/english-learning-harness.mjs",
    "image",
    "--learner-root",
    learnerRoot,
    "--image-file",
    imagePath,
    "--hidden-detail",
    "the wallet is partly hidden near the cup",
    "--clarification-prompt",
    "Where is the wallet compared with the cup?",
    "--say",
    "The cup is on the left and I think something small is next to it.",
    "--json",
  ]);
  assert(image.status === "pass", "image command failed");
  assert(image.mode === "image-info-gap", "image session mode mismatch");
  assert(image.eventModality === "image", "image event modality missing");
  assert(image.imageFile === imagePath, "image command should echo local image path");
  assert(image.hiddenDetail.includes("wallet"), "image command missing hidden detail");
  assert(image.clarificationPrompt.includes("wallet"), "image command missing clarification prompt");
  assert(existsSync(image.artifactPath), "image artifact missing");
  assertNoUnsupportedClaims(image);

  const artifact = readJson(image.artifactPath);
  assert(artifact.mode === "image-info-gap", "artifact mode mismatch");
  assert(artifact.scenario.selection_reason.source === "image-information-gap", "selection reason mismatch");
  assert(artifact.interaction_events.length === 1, "image artifact should contain one event");
  const event = artifact.interaction_events[0];
  validateInteractionEvent(event, "image.interaction_events[0]");
  assert(event.modality === "image", "interaction event should be image modality");
  assert(event.source_artifact?.path === imagePath, "image event missing local image metadata");
  assert(event.source_artifact?.type === "image", "image event source artifact type mismatch");
  assert(event.source_artifact?.hidden_detail.includes("wallet"), "image event missing hidden detail");
  assert(event.source_artifact?.clarification_prompt.includes("wallet"), "image event missing clarification prompt");
  assert(event.learner_output.includes("cup"), "image event missing learner image description");
  assertNoUnsupportedClaims(event);

  const weekly = runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(weekly.mirror.interaction_event_summary.modalities.includes("image"), "weekly summary missing image modality");
  assertNoUnsupportedClaims(weekly.mirror);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        artifactPath: image.artifactPath,
        eventId: event.event_id,
        modality: event.modality,
        imagePath: event.source_artifact.path,
        hiddenDetail: event.source_artifact.hidden_detail,
        weeklyModalities: weekly.mirror.interaction_event_summary.modalities,
      },
      null,
      2,
    ),
  );
}

main();
