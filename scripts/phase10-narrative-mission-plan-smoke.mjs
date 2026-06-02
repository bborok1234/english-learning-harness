#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(path) {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

function includesAll(text, tokens, label) {
  const missing = tokens.filter((token) => !text.includes(token));
  assert(missing.length === 0, `${label} missing: ${missing.join(", ")}`);
}

function main() {
  const requiredFiles = [
    "docs/M10-NARRATIVE-MISSION-PRD.md",
    "docs/M10-NARRATIVE-MISSION-TEST-SPEC.md",
    "docs/phase-10-evidence/M10-1-narrative-mission-design.md",
  ];
  for (const file of requiredFiles) {
    assert(existsSync(resolve(repoRoot, file)), `${file} missing`);
  }

  const prd = readText("docs/M10-NARRATIVE-MISSION-PRD.md");
  const spec = readText("docs/M10-NARRATIVE-MISSION-TEST-SPEC.md");
  const contracts = readText("docs/DATA-CONTRACTS.md");
  const issueIndex = readText("docs/ISSUE-INDEX.md");
  const status = readText("docs/STATUS.md");
  const projectState = readText("docs/project-state.json");

  includesAll(
    prd,
    [
      "If a mission can be completed without the target speaking skill, it is decorative roleplay and must be rejected.",
      "M10 starts the narrative layer by proving one thing",
      "Capability-Aware Design",
      "Story Consequence Rule",
      "usual-place-clarification",
      "Blocked claims",
      "narrative immersion improves fluency",
      "engagement proves learning",
      "child mode is ready",
      "realtime voice adventure is supported",
    ],
    "M10 PRD",
  );

  includesAll(
    spec,
    [
      "Gate M10-2: Mission Spec Validator",
      "backlog item",
      "real-world transfer target",
      "No-Generation Fallback",
      "Claim Guard",
      "Stop Condition",
    ],
    "M10 test spec",
  );

  includesAll(
    contracts,
    [
      "## M10 Narrative Mission Contracts",
      "\"mission_id\": \"usual-place-clarification\"",
      "\"backlog_item_id\": \"speaking-clarification\"",
      "\"real_world_transfer_target\"",
      "\"text_scene_card_required\": true",
      "M10 must reject child mode",
    ],
    "M10 data contracts",
  );

  includesAll(
    issueIndex,
    ["#143", "#144", "#145", "#146", "#147", "#148", "M10 Narrative Mission Layer"],
    "M10 issue index",
  );

  includesAll(
    status,
    ["M10 Narrative Mission Layer", "M10-1", "Narrative Mission Layer"],
    "M10 status",
  );

  includesAll(
    projectState,
    ["M10 Narrative Mission Layer", "Verified transfer wrapper", "M10-1"],
    "M10 project state",
  );

  for (const forbidden of [
    "allowed claim: narrative immersion improves fluency",
    "allowed claim: engagement proves learning",
    "allowed claim: child mode is ready",
    "allowed claim: realtime voice adventure is supported",
  ]) {
    assert(!prd.toLowerCase().includes(forbidden), `unsupported unblocked claim in PRD: ${forbidden}`);
  }

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M10-1",
        checkedFiles: requiredFiles.length + 4,
        claimBoundary:
          "M10 planning defines narrative missions as verified transfer wrappers only; it does not implement or prove learning outcomes.",
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
        issue: "M10-1",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
