#!/usr/bin/env node
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { preparePublicReleaseApproval } from "./prepare-public-release-approval.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-7-public-release-approval", String(process.pid));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  const result = preparePublicReleaseApproval({ target: smokeRoot });
  assert(result.status === "pass", "approval packet generation failed");
  assert(existsSync(result.markdownPath), "approval markdown missing");
  assert(existsSync(result.jsonPath), "approval json missing");

  const packet = JSON.parse(readFileSync(result.jsonPath, "utf8"));
  const markdown = readFileSync(result.markdownPath, "utf8");

  assert(packet.decisionIssue === 90, "packet must point to #90 decision");
  assert(packet.distributionIssue === 83, "packet must point to #83 proof");
  assert(packet.approvalRequired === true, "packet must require owner approval");
  assert(packet.decisionStatus === "owner_decision_required", "packet should preserve current owner decision blocker");
  assert(packet.publicationPerformed === false, "packet must not publish");
  assert(packet.canPublishNow === false, "packet must not authorize publication");
  assert(packet.canClosePublicDistribution === false, "packet must not claim public distribution complete");
  assert(packet.workflowDispatchCommand.includes("publish_release=true"), "packet missing approval-time workflow command");
  assert(packet.workflowDispatchCommand.includes("artifact_repo=bborok1234/english-learning-harness-public"), "packet missing artifact repo target");
  assert(packet.proofCommand.includes("ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL"), "packet missing artifact proof URL");
  assert(packet.proofCommand.includes("ENGLISH_LEARNING_PUBLIC_SHA256SUMS_URL"), "packet missing checksum proof URL");
  assert(packet.proofCommand.includes("phase7-public-release-url-smoke.mjs"), "packet missing checksum-aware smoke");

  for (const required of [
    "Do not execute this command until #90 records explicit owner approval",
    "Required Proof After Publication",
    "hostedAccessStatus=public_url_candidate",
    "checksumVerified=true",
    "canClosePublicDistribution=true",
    "This packet is for the owner decision in #90",
  ]) {
    assert(markdown.includes(required), `approval markdown missing ${required}`);
  }

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M7-9",
        target: smokeRoot,
        markdownPath: result.markdownPath,
        jsonPath: result.jsonPath,
        artifactRepo: packet.artifactRepo,
        decisionStatus: packet.decisionStatus,
        publicationPerformed: packet.publicationPerformed,
        canPublishNow: packet.canPublishNow,
        canClosePublicDistribution: packet.canClosePublicDistribution,
        claimBoundary: packet.claimBoundary,
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
        issue: "M7-9",
        error: error.message,
        claimBoundary:
          "A failing approval packet smoke means the owner approval handoff is not safe enough to support public publication.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
