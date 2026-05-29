#!/usr/bin/env node
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { preparePublicArtifactHandoff } from "./prepare-public-artifact-handoff.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const defaultTarget = resolve(repoRoot, "tmp/public-release-approval-packet");
const policyPath = resolve(repoRoot, "docs/distribution-policy.json");

function parseArgs(argv) {
  const options = {
    target: defaultTarget,
  };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--target") {
      options.target = resolve(argv[index + 1]);
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return options;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main(options = {}) {
  const target = resolve(options.target || defaultTarget);
  rmSync(target, { recursive: true, force: true });
  mkdirSync(target, { recursive: true });

  const policy = JSON.parse(readFileSync(policyPath, "utf8"));
  const decision = policy.publicReleaseDecision;
  assert(decision?.issue === 90, "public release decision should be tracked by #90");
  assert(
    decision.codexMayPublishWithoutExplicitApproval === false,
    "Codex publication authority boundary must remain explicit",
  );

  const handoff = preparePublicArtifactHandoff({ target: resolve(target, "handoff") });
  const manifest = JSON.parse(readFileSync(handoff.manifestPath, "utf8"));
  const artifactUrl = manifest.latestReleaseDownloadUrl;
  const checksumsUrl = artifactUrl.replace(/\/[^/]+$/, "/SHA256SUMS");
  const workflowDispatchCommand = [
    "gh",
    "workflow",
    "run",
    "public-artifact.yml",
    "--ref",
    "main",
    "-f",
    "publish_release=true",
    "-f",
    `artifact_repo=${handoff.artifactRepo}`,
  ].join(" ");
  const proofCommand = [
    `ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL="${artifactUrl}"`,
    `ENGLISH_LEARNING_PUBLIC_SHA256SUMS_URL="${checksumsUrl}"`,
    "node scripts/phase7-public-release-url-smoke.mjs",
  ].join(" \\\n+  ");

  const packet = {
    schemaVersion: 1,
    issue: "M7-9",
    decisionIssue: 90,
    distributionIssue: 83,
    generatedAt: new Date().toISOString(),
    approvalRequired: true,
    decisionStatus: decision.status,
    recommendedSurface: decision.recommendedSurface,
    artifactRepo: handoff.artifactRepo,
    releaseTag: manifest.releaseTag,
    artifactName: handoff.artifactName,
    artifactBytes: handoff.artifactBytes,
    artifactSha256: handoff.artifactSha256,
    artifactUrl,
    checksumsUrl,
    files: manifest.files,
    workflowDispatchCommand,
    manualFallbackCommand: handoff.publishCommand,
    proofCommand,
    requiredOwnerDecisions: [
      "Approve the public distribution surface in #90.",
      `Confirm that ${handoff.artifactRepo} is a public repository or replace it with another public artifact URL.`,
      "Provide or configure PUBLIC_ARTIFACT_REPO_TOKEN only if the workflow publication path is approved.",
      "Run the public release URL smoke against the real artifact and SHA256SUMS URLs before claiming #83 complete.",
    ],
    forbiddenBeforeApproval: [
      "Do not run publish_release=true.",
      "Do not create or upload a public release asset.",
      "Do not claim unauthenticated public distribution.",
      "Do not claim public Git-backed plugin install.",
    ],
    publicationPerformed: false,
    canPublishNow: false,
    canClosePublicDistribution: false,
    claimBoundary:
      "This approval packet is non-publishing preparation only. It does not approve publication, create a repository, publish a release, prove public URL access, or complete #83/#90.",
  };

  const jsonPath = resolve(target, "PUBLIC-RELEASE-APPROVAL.json");
  const markdownPath = resolve(target, "PUBLIC-RELEASE-APPROVAL.md");
  writeFileSync(jsonPath, `${JSON.stringify(packet, null, 2)}\n`);
  writeFileSync(
    markdownPath,
    [
      "# Public Release Approval Packet",
      "",
      "This packet is for the owner decision in #90. It does not publish anything.",
      "",
      "## Decision Requested",
      "",
      `- Approve or reject publishing the artifact to \`${handoff.artifactRepo}\`.`,
      "- Confirm who is allowed to run the publication workflow.",
      "- Confirm whether `PUBLIC_ARTIFACT_REPO_TOKEN` may be configured for the workflow.",
      "",
      "## Target",
      "",
      `- Artifact repository: \`${handoff.artifactRepo}\``,
      `- Release tag: \`${manifest.releaseTag}\``,
      `- Artifact: \`${handoff.artifactName}\``,
      `- SHA256: \`${handoff.artifactSha256}\``,
      "",
      "## Files To Publish",
      "",
      ...manifest.files.map((file) => `- \`${file}\``),
      "",
      "## Command After Explicit Approval",
      "",
      "Do not execute this command until #90 records explicit owner approval and the public artifact repository/token are ready.",
      "",
      "```bash",
      workflowDispatchCommand,
      "```",
      "",
      "Manual fallback from the generated handoff directory:",
      "",
      "```bash",
      handoff.publishCommand,
      "```",
      "",
      "## Required Proof After Publication",
      "",
      "Run this against the real public URLs before claiming public distribution complete:",
      "",
      "```bash",
      proofCommand,
      "```",
      "",
      "Expected proof: `hostedAccessStatus=public_url_candidate`, `checksumVerified=true`, and `canClosePublicDistribution=true`.",
      "",
      "## Forbidden Before Approval",
      "",
      ...packet.forbiddenBeforeApproval.map((item) => `- ${item}`),
      "",
      "## Claim Boundary",
      "",
      packet.claimBoundary,
      "",
    ].join("\n"),
  );

  return {
    status: "pass",
    issue: "M7-9",
    target,
    markdownPath,
    jsonPath,
    handoffRoot: handoff.handoffRoot,
    approvalRequired: packet.approvalRequired,
    decisionStatus: packet.decisionStatus,
    artifactRepo: packet.artifactRepo,
    publicationPerformed: packet.publicationPerformed,
    canPublishNow: packet.canPublishNow,
    canClosePublicDistribution: packet.canClosePublicDistribution,
    proofCommand: packet.proofCommand,
    claimBoundary: packet.claimBoundary,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    console.log(JSON.stringify(main(parseArgs(process.argv)), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ status: "fail", issue: "M7-9", error: error.message }, null, 2));
    process.exit(1);
  }
}

export { main as preparePublicReleaseApproval };
