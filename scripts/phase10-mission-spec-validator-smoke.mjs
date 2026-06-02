#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  validateMissionSpec,
  validateNarrativeMissionBundle,
} from "./lib/narrative-mission.mjs";

const repoRoot = resolve(import.meta.dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validSpeakingBacklog() {
  return {
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
  };
}

function expectFailure(label, missionSpec, expectedText, context) {
  const errors = validateMissionSpec(missionSpec, context);
  assert(errors.length > 0, `${label} should fail`);
  assert(
    errors.some((error) => error.includes(expectedText)),
    `${label} should include "${expectedText}", got: ${errors.join("; ")}`,
  );
  return { label, errors };
}

function main() {
  const missionSchema = readJson("docs/narrative-missions/schemas/mission-spec.schema.json");
  assert(missionSchema.title === "English Learning Harness Narrative Mission Spec", "mission spec schema title mismatch");

  const missionSpec = readJson("docs/narrative-missions/fixtures/usual-place-clarification.mission-spec.json");
  const worldState = readJson("docs/narrative-missions/fixtures/daily-life.world-state.json");
  const toolCapabilities = readJson("docs/narrative-missions/fixtures/light.tool-capabilities.json");
  const speakingBacklog = validSpeakingBacklog();

  const positiveErrors = validateNarrativeMissionBundle({
    missionSpec,
    worldState,
    toolCapabilities,
    speakingBacklog,
  });
  assert(positiveErrors.length === 0, `positive narrative mission should pass: ${positiveErrors.join("; ")}`);

  const context = { speakingBacklog, worldState, toolCapabilities };
  const failures = [];

  {
    const invalid = clone(missionSpec);
    invalid.backlog_item_id = "speaking-missing";
    invalid.win_condition.must_pass_backlog_item = "speaking-missing";
    failures.push(expectFailure("missing backlog item", invalid, "existing Speaking Skill OS backlog item", context));
  }

  {
    const invalid = clone(missionSpec);
    invalid.target_skill = "repair";
    failures.push(expectFailure("target skill mismatch", invalid, "target_skill must match", context));
  }

  {
    const invalid = clone(missionSpec);
    invalid.win_condition.must_pass_backlog_item = "speaking-repair";
    failures.push(expectFailure("win condition mismatch", invalid, "must equal backlog_item_id", context));
  }

  {
    const invalid = clone(missionSpec);
    invalid.real_world_transfer_target = [];
    failures.push(expectFailure("missing real-world transfer target", invalid, "real_world_transfer_target", context));
  }

  {
    const invalid = clone(missionSpec);
    invalid.capability_requirements.required = ["text", "image"];
    failures.push(expectFailure("media required without fallback", invalid, "optional only", context));
  }

  {
    const invalid = clone(missionSpec);
    invalid.claim_boundary = "Narrative immersion improves fluency.";
    failures.push(expectFailure("unsupported learning claim", invalid, "unsupported claim phrase", context));
  }

  {
    const invalid = clone(missionSpec);
    invalid.backlog_item_id = "";
    invalid.required_learner_action = "";
    invalid.transfer_test = "";
    invalid.win_condition = { type: "story_completed", must_pass_backlog_item: "" };
    invalid.story_consequence.on_pass = "The world advances before the learner says anything.";
    invalid.real_world_transfer_target = [];
    invalid.claim_boundary = "Engagement proves learning.";
    failures.push(expectFailure("decorative mission", invalid, "win_condition.type", context));
  }

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issues: ["M10-2", "M10-3"],
        schema: "docs/narrative-missions/schemas/mission-spec.schema.json",
        positiveMission: missionSpec.mission_id,
        rejectedFixtures: failures.map((failure) => failure.label),
        claimBoundary:
          "The validator accepts only missions tied to Speaking Skill OS transfer evidence and rejects decorative roleplay.",
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
        issues: ["M10-2", "M10-3"],
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
