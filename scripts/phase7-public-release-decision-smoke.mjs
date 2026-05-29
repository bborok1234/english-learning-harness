#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const policyPath = resolve(repoRoot, "docs/distribution-policy.json");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const policy = JSON.parse(readFileSync(policyPath, "utf8"));
  const decision = policy.publicReleaseDecision;

  assert(policy.schemaVersion === 1, "distribution policy schema mismatch");
  assert(decision, "publicReleaseDecision missing");
  assert(decision.issue === 90, "public release decision should be tracked by issue 90");
  assert(
    ["owner_decision_required", "approved"].includes(decision.status),
    "public release decision status must be owner_decision_required or approved",
  );
  assert(
    decision.recommendedSurface === "public_artifact_repository_release",
    "recommended public surface should be a separate public artifact repository release",
  );
  assert(
    decision.codexMayPublishWithoutExplicitApproval === false,
    "Codex must not be allowed to publish public release assets without explicit approval",
  );
  assert(
    policy.publicReleaseRequirements.some((requirement) => requirement.includes("#90")),
    "public release requirements should mention the issue 90 decision",
  );

  const canPublishNow =
    decision.status === "approved" && decision.codexMayPublishWithoutExplicitApproval === false;

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M7-D",
        policyPath: "docs/distribution-policy.json",
        decisionStatus: decision.status,
        recommendedSurface: decision.recommendedSurface,
        codexMayPublishWithoutExplicitApproval:
          decision.codexMayPublishWithoutExplicitApproval,
        canPublishNow,
        nextGate:
          decision.status === "approved"
            ? "Run the manually approved public artifact repository or static URL publication path, then verify the real URL with phase7-hosted-artifact-smoke."
            : "Resolve the public release surface and publication authority before publishing any release asset.",
        claimBoundary:
          "This proves the release decision gate is explicit. It does not publish or prove a public URL.",
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
        issue: "M7-D",
        error: error.message,
        claimBoundary:
          "A failing public release decision smoke means the project may overclaim public distribution readiness.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
