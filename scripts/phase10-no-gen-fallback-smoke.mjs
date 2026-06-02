#!/usr/bin/env node
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import {
  ensureLearnerStore,
  learnerPaths,
  readSpeakingBacklog,
  writeSpeakingBacklog,
} from "./lib/english-learning-store.mjs";
import {
  persistNarrativeMissionSession,
  routeMissionCapabilities,
  validateMissionSpec,
} from "./lib/narrative-mission.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-10-no-gen-fallback");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function seedBacklog(learnerRoot) {
  ensureLearnerStore(learnerRoot);
  const paths = learnerPaths(learnerRoot);
  writeSpeakingBacklog(paths.speakingBacklog, {
    schema_version: 1,
    items: [
      {
        id: "speaking-clarification",
        skill: "clarification",
        label: "Ask for clarification",
        status: "open",
        priority: "high",
        created_at: "2026-06-02T00:00:00.000Z",
        updated_at: "2026-06-02T00:00:00.000Z",
        source: "diagnose",
        diagnosis: "Detected clarification practice need from learner output.",
        target_behavior: "Use a clarification phrase when meaning is unclear.",
        drill_prompt: "Ask one clarification question before answering.",
        transfer_test: "Can you ask what the other person means?",
        pass_criteria: "Learner uses a question or clarification phrase.",
        evidence_count: 0,
        attempts: [],
      },
    ],
  });
  return readSpeakingBacklog(paths.speakingBacklog);
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  const learnerRoot = resolve(smokeRoot, "learner");
  const missionSpec = readJson("docs/narrative-missions/fixtures/usual-place-clarification.mission-spec.json");
  const worldState = readJson("docs/narrative-missions/fixtures/daily-life.world-state.json");
  const toolCapabilities = readJson("docs/narrative-missions/fixtures/light.tool-capabilities.json");
  const speakingBacklog = seedBacklog(learnerRoot);

  const route = routeMissionCapabilities(missionSpec, toolCapabilities);
  assert(route.presentation_mode === "light", "text-only tools should route to light mode");
  assert(route.can_complete_without_generation === true, "mission must complete without generation");
  assert(route.text_scene_card_required === true, "text scene card must be required");

  const result = persistNarrativeMissionSession({
    learnerRoot,
    learnerTurns: ["Which place do you mean?"],
    missionSpec,
    speakingBacklog,
    worldState,
    toolCapabilities,
    date: new Date("2026-06-02T03:00:00.000Z"),
  });
  assert(result.session.speaking_backlog_evidence?.result === "pass", "text-only narrative mission should pass");
  assert(
    result.session.narrative_mission.capability_route.presentation_mode === "light",
    "session should persist light capability route",
  );
  assert(result.persisted.artifactPath, "text-only narrative mission should write artifact");

  const mediaRequired = clone(missionSpec);
  mediaRequired.capability_requirements.required = ["text", "image"];
  const mediaErrors = validateMissionSpec(mediaRequired, {
    speakingBacklog,
    worldState,
    toolCapabilities,
  });
  assert(mediaErrors.some((error) => error.includes("optional only")), "media-required mission should be rejected");

  const realtimeRequired = clone(missionSpec);
  realtimeRequired.capability_requirements.required = ["text", "realtime_voice"];
  const realtimeErrors = validateMissionSpec(realtimeRequired, {
    speakingBacklog,
    worldState,
    toolCapabilities,
  });
  assert(
    realtimeErrors.some((error) => error.includes("optional only")),
    "realtime-required mission should be rejected",
  );

  const noTextFallback = clone(toolCapabilities);
  noTextFallback.fallback.text_scene_card_required = false;
  let noTextFallbackRejected = false;
  try {
    routeMissionCapabilities(missionSpec, noTextFallback);
  } catch (error) {
    noTextFallbackRejected = error.message.includes("text_scene_card_required") ||
      error.message.includes("text scene card");
  }
  assert(noTextFallbackRejected, "missing text scene fallback should be rejected");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M10-5",
        route,
        artifactPath: result.persisted.artifactPath,
        rejected: ["required image", "required realtime voice", "missing text scene fallback"],
        claimBoundary:
          "No-generation fallback proves text-first completion and evidence only. It does not prove multimodal efficacy.",
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
        issue: "M10-5",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
