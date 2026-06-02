#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const blockedClaims = [
  "narrative immersion improves fluency",
  "engagement proves learning",
  "generated worlds increase retention",
  "child mode is ready",
  "realtime voice adventure is supported",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(path) {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

function main() {
  const prd = readText("docs/M10-NARRATIVE-MISSION-PRD.md").toLowerCase();
  const spec = readText("docs/M10-NARRATIVE-MISSION-TEST-SPEC.md").toLowerCase();
  const state = readText("docs/ops/project-state.json").toLowerCase();
  const dashboard = readText("docs/ops/engineering-dashboard.html").toLowerCase();

  assert(prd.includes("allowed claim"), "PRD must include allowed claim section");
  assert(prd.includes("blocked claims"), "PRD must include blocked claims section");
  assert(spec.includes("claim guard"), "test spec must include claim guard gate");
  assert(state.includes("remaining blocked claims"), "project state must preserve blocked-claim visibility");

  for (const claim of blockedClaims) {
    assert(prd.includes(claim), `PRD missing blocked claim: ${claim}`);
    assert(spec.includes(claim), `test spec missing rejected claim: ${claim}`);
    assert(state.includes(claim), `project state missing blocked claim: ${claim}`);
    assert(dashboard.includes(claim), `dashboard missing blocked claim: ${claim}`);
  }

  const forbiddenAssertions = [
    "allowed claim: narrative immersion improves fluency",
    "allowed claim: engagement proves learning",
    "allowed claim: generated worlds increase retention",
    "allowed claim: child mode is ready",
    "allowed claim: realtime voice adventure is supported",
    "proves real learner outcomes",
    "proves speaking improvement",
    "status: child mode ready",
    "status: realtime voice ready",
  ];
  const combined = [prd, spec, state, dashboard].join("\n");
  for (const forbidden of forbiddenAssertions) {
    assert(!combined.includes(forbidden), `unsupported assertion found: ${forbidden}`);
  }

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M10-6",
        blockedClaims,
        claimBoundary:
          "Claim guard keeps blocked narrative, engagement, child-mode, and realtime claims visible without asserting outcomes.",
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
        issue: "M10-6",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
