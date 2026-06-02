#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  validateToolCapabilities,
  validateWorldState,
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

function expectFailure(label, errors, expectedText) {
  assert(errors.length > 0, `${label} should fail`);
  assert(
    errors.some((error) => error.includes(expectedText)),
    `${label} should include "${expectedText}", got: ${errors.join("; ")}`,
  );
  return { label, errors };
}

function main() {
  const worldSchema = readJson("docs/narrative-missions/schemas/world-state.schema.json");
  const capabilitySchema = readJson("docs/narrative-missions/schemas/tool-capabilities.schema.json");
  assert(worldSchema.title === "English Learning Harness Narrative World State", "world state schema title mismatch");
  assert(
    capabilitySchema.title === "English Learning Harness Narrative Tool Capabilities",
    "tool capabilities schema title mismatch",
  );

  const worldState = readJson("docs/narrative-missions/fixtures/daily-life.world-state.json");
  const toolCapabilities = readJson("docs/narrative-missions/fixtures/light.tool-capabilities.json");

  const worldErrors = validateWorldState(worldState);
  assert(worldErrors.length === 0, `positive world state should pass: ${worldErrors.join("; ")}`);

  const capabilityErrors = validateToolCapabilities(toolCapabilities);
  assert(capabilityErrors.length === 0, `positive tool capabilities should pass: ${capabilityErrors.join("; ")}`);

  const failures = [];

  {
    const invalid = clone(worldState);
    invalid.npc_canon.push({
      id: "mentor-2",
      name: "another NPC",
      role: "extra lore guide",
      memory: ["adds story before the learner speaks"],
    });
    failures.push(expectFailure("multiple NPCs", validateWorldState(invalid), "exactly one NPC"));
  }

  {
    const invalid = clone(worldState);
    invalid.safety_constraints.child_mode = true;
    failures.push(expectFailure("child mode enabled", validateWorldState(invalid), "child_mode must be false"));
  }

  {
    const invalid = clone(worldState);
    invalid.current_arc.summary = "A courier arrives. A city mystery begins. The learner must read lore first.";
    failures.push(expectFailure("long lore before output", validateWorldState(invalid), "two sentences or fewer"));
  }

  {
    const invalid = clone(toolCapabilities);
    invalid.capabilities.text = false;
    failures.push(expectFailure("text capability disabled", validateToolCapabilities(invalid), "capabilities.text must be true"));
  }

  {
    const invalid = clone(toolCapabilities);
    invalid.fallback.text_scene_card_required = false;
    failures.push(expectFailure("missing text scene fallback", validateToolCapabilities(invalid), "text_scene_card_required"));
  }

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M10-2",
        schemas: [
          "docs/narrative-missions/schemas/world-state.schema.json",
          "docs/narrative-missions/schemas/tool-capabilities.schema.json",
        ],
        checked: ["world-state", "tool-capabilities"],
        rejectedFixtures: failures.map((failure) => failure.label),
        claimBoundary:
          "World state and tool capabilities route mission presentation only; they do not prove learning outcomes.",
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
        issue: "M10-2",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
