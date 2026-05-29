#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateInteractionEvent } from "./lib/english-learning-store.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/phase-4-interaction-event-schema");
const learnerRoot = resolve(tmpRoot, "learner");

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

function assertRejects(event, expectedMessage) {
  try {
    validateInteractionEvent(event, "invalid-fixture");
  } catch (error) {
    assert(error.message.includes(expectedMessage), `expected "${expectedMessage}", got "${error.message}"`);
    return;
  }
  throw new Error(`expected invalid fixture to fail: ${expectedMessage}`);
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  const today = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--scenario",
    "stuck-repair",
    "--say",
    "I don't know how to say it, but the meeting was okay.",
    "--json",
  ]);
  assert(today.status === "pass", "today command failed");

  const artifact = readJson(today.artifactPath);
  assert(Array.isArray(artifact.interaction_events), "session artifact missing interaction_events");
  assert(artifact.interaction_events.length === 1, "expected one interaction event");
  const event = artifact.interaction_events[0];
  validateInteractionEvent(event, "artifact.interaction_events[0]");
  assert(event.modality === "text", "text-first session should write text event");
  assert(event.scenario_id === "stuck-repair", "event scenario mismatch");
  assert(event.learner_output.includes("meeting"), "event learner output missing");
  assert(event.trouble_source.includes("stuck"), "event trouble source should reflect repair scenario");
  assert(event.saved_phrase, "event saved phrase missing");
  assert(event.transfer_targets.length >= 1, "event transfer targets missing");

  const invalidBase = { ...event };
  assertRejects({ ...invalidBase, modality: "smell" }, "modality must be one of");
  assertRejects({ ...invalidBase, learner_output: "" }, "learner_output must be a non-empty string");
  assertRejects({ ...invalidBase, mediation_level: "" }, "mediation_level must be one of");
  assertRejects({ ...invalidBase, claim_boundary: "" }, "claim_boundary must be a non-empty string");
  assertRejects(
    { ...invalidBase, claim_boundary: "This guarantees fluent speech." },
    "unsupported learning claim",
  );

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        artifactPath: today.artifactPath,
        eventId: event.event_id,
        modality: event.modality,
        transferTargets: event.transfer_targets,
      },
      null,
      2,
    ),
  );
}

main();
