#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const workflowPath = resolve(repoRoot, ".github/workflows/public-artifact.yml");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  assert(existsSync(workflowPath), "public artifact workflow missing");
  const workflow = readFileSync(workflowPath, "utf8");

  for (const required of [
    "workflow_dispatch:",
    "publish_release:",
    "release_tag:",
    "artifact_repo:",
    "bborok1234/english-learning-harness-public",
    "node scripts/package-public-artifact.mjs --target tmp/public-artifact",
    "node scripts/phase7-public-artifact-smoke.mjs",
    "actions/upload-artifact@v4",
    "gh release upload",
    "PUBLIC_ARTIFACT_REPO_TOKEN",
    "ARTIFACT_REPO: ${{ inputs.artifact_repo }}",
    "--repo \"$ARTIFACT_REPO\"",
    "if: ${{ inputs.publish_release == 'true' }}",
    "FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: \"true\"",
  ]) {
    assert(workflow.includes(required), `workflow missing ${required}`);
  }

  assert(
    workflow.includes("permissions:") && workflow.includes("contents: read"),
    "workflow should keep source repository permissions read-only",
  );
  assert(
    workflow.includes("node-version: \"24\""),
    "workflow should use Node 24 to match local smoke runtime",
  );

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M7-1",
        workflowPath: ".github/workflows/public-artifact.yml",
        artifactRepoDefault: "bborok1234/english-learning-harness-public",
        packageCommand: "node scripts/package-public-artifact.mjs --target tmp/public-artifact",
        verificationCommand: "node scripts/phase7-public-artifact-smoke.mjs",
        publishReleaseDefault: false,
        claimBoundary:
          "This proves the release workflow is wired for artifact generation and owner-approved optional upload to a separate artifact repository. It does not prove that a public URL exists.",
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
        issue: "M7-1",
        error: error.message,
        claimBoundary:
          "A failing release workflow smoke means public artifact publication is not operationally prepared.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
