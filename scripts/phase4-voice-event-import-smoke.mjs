#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateInteractionEvent } from "./lib/english-learning-store.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/phase-4-voice-event-import");
const learnerRoot = resolve(tmpRoot, "learner");
const transcriptPath = resolve(tmpRoot, "voice-transcript.txt");
const audioPath = resolve(tmpRoot, "practice-audio-placeholder.wav");

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
    "accent score",
    "realtime conversation",
  ]) {
    assert(!text.includes(claim), `unsupported voice claim appeared: ${claim}`);
  }
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });
  mkdirSync(tmpRoot, { recursive: true });
  writeFileSync(transcriptPath, "I don't know how to say it, but my voice practice was okay.\n");
  writeFileSync(audioPath, "placeholder audio metadata only\n");

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  const voice = runJson([
    "scripts/english-learning-harness.mjs",
    "voice",
    "--learner-root",
    learnerRoot,
    "--scenario",
    "stuck-repair",
    "--transcript",
    transcriptPath,
    "--audio-file",
    audioPath,
    "--json",
  ]);
  assert(voice.status === "pass", "voice command failed");
  assert(voice.mode === "voice-transcript", "voice session mode mismatch");
  assert(voice.eventModality === "voice", "voice event modality missing");
  assert(voice.audioFile === audioPath, "voice command should echo local audio path");
  assert(existsSync(voice.artifactPath), "voice artifact missing");
  assertNoUnsupportedClaims(voice);

  const artifact = readJson(voice.artifactPath);
  assert(artifact.mode === "voice-transcript", "artifact mode mismatch");
  assert(artifact.interaction_events.length === 1, "voice artifact should contain one event");
  const event = artifact.interaction_events[0];
  validateInteractionEvent(event, "voice.interaction_events[0]");
  assert(event.modality === "voice", "interaction event should be voice modality");
  assert(event.source_artifact?.path === audioPath, "voice event missing local audio metadata");
  assert(event.source_artifact?.type === "audio", "voice event source artifact type mismatch");
  assert(event.learner_output.includes("voice practice"), "voice event missing transcript output");
  assertNoUnsupportedClaims(event);

  const weekly = runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  assert(weekly.mirror.interaction_event_summary.modalities.includes("voice"), "weekly summary missing voice modality");
  assertNoUnsupportedClaims(weekly.mirror);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        artifactPath: voice.artifactPath,
        eventId: event.event_id,
        modality: event.modality,
        audioPath: event.source_artifact.path,
        weeklyModalities: weekly.mirror.interaction_event_summary.modalities,
      },
      null,
      2,
    ),
  );
}

main();
