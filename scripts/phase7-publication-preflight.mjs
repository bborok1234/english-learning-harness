#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { preparePublicArtifactHandoff } from "./prepare-public-artifact-handoff.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const policyPath = resolve(repoRoot, "docs/distribution-policy.json");
const workflowPath = resolve(repoRoot, ".github/workflows/public-artifact.yml");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runOptional(command, args) {
  try {
    return {
      status: "available",
      output: execFileSync(command, args, {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      }).trim(),
    };
  } catch (error) {
    return {
      status: "unavailable",
      error: error.stderr?.toString()?.trim() || error.message,
    };
  }
}

function repoMetadata(repo) {
  const result = runOptional("gh", ["repo", "view", repo, "--json", "visibility,isPrivate,url"]);
  if (result.status !== "available") {
    return {
      status: "unavailable",
      repo,
      visibility: "UNKNOWN",
      isPrivate: undefined,
      url: "",
      error: result.error,
    };
  }
  return {
    status: "available",
    repo,
    ...JSON.parse(result.output),
  };
}

function main() {
  assert(existsSync(policyPath), "distribution policy missing");

  const policy = JSON.parse(readFileSync(policyPath, "utf8"));
  const decision = policy.publicReleaseDecision;
  assert(decision?.issue === 90, "public release decision should be tracked by issue 90");

  if (decision.recommendedSurface === "public_source_repository") {
    const repo = repoMetadata("bborok1234/english-learning-harness");
    const blockers = [];
    if (!["approved", "approved_pending_visibility_change"].includes(decision.status)) {
      blockers.push("public source release decision is not approved");
    }
    if (decision.codexMayChangeRepositoryVisibilityWithoutFinalAudit !== false) {
      blockers.push("repository visibility change boundary is not explicit");
    }
    if (repo.status !== "available") {
      blockers.push("source repository is not visible to gh repo view");
    } else if (repo.isPrivate === true || repo.visibility !== "PUBLIC") {
      blockers.push("source repository is not public yet");
    }

    const publicationReady = blockers.length === 0;
    console.log(
      JSON.stringify(
        {
          status: "pass",
          issue: "M7-7",
          decisionStatus: decision.status,
          recommendedSurface: decision.recommendedSurface,
          sourceRepo: "bborok1234/english-learning-harness",
          sourceRepoStatus: repo.status,
          sourceRepoVisibility: repo.visibility,
          sourceRepoUrl: repo.url,
          publicationReady,
          canPublishNow: publicationReady,
          blockers,
          nextProof: "node scripts/phase6-public-clean-clone-smoke.mjs",
          claimBoundary:
            "This preflight inspects open-source publication readiness only. It does not change repository visibility or prove public clone access.",
        },
        null,
        2,
      ),
    );
    return;
  }

  assert(existsSync(workflowPath), "public artifact workflow missing");
  assert(
    decision.recommendedSurface === "public_artifact_repository_release",
    "recommended surface should be public_artifact_repository_release or public_source_repository",
  );

  const smokeRoot = resolve(repoRoot, "tmp/phase-7-publication-preflight", String(process.pid));

  const workflow = readFileSync(workflowPath, "utf8");
  for (const required of [
    "artifact_repo:",
    "PUBLIC_ARTIFACT_REPO_TOKEN",
    "ARTIFACT_REPO: ${{ inputs.artifact_repo }}",
    "--repo \"$ARTIFACT_REPO\"",
    "contents: read",
    "publish_release:",
  ]) {
    assert(workflow.includes(required), `workflow missing ${required}`);
  }

  const handoff = preparePublicArtifactHandoff({ target: smokeRoot });
  const manifest = JSON.parse(readFileSync(handoff.manifestPath, "utf8"));
  assert(manifest.publicationPerformed === false, "handoff should not publish");
  assert(manifest.files.includes("README.md"), "handoff manifest missing public README");
  assert(manifest.files.includes("SHA256SUMS"), "handoff manifest missing SHA256SUMS");
  assert(
    manifest.publicUrlSmokeCommand.includes("phase7-hosted-artifact-smoke.mjs") ||
      manifest.latestReleaseDownloadUrl.includes("releases/latest/download"),
    "handoff should include public URL proof guidance",
  );

  const repo = repoMetadata(handoff.artifactRepo);
  const blockers = [];
  if (decision.status !== "approved") {
    blockers.push("public release decision is not approved");
  }
  if (decision.codexMayPublishWithoutExplicitApproval !== false) {
    blockers.push("Codex publication authority boundary is not explicit");
  }
  if (repo.status !== "available") {
    blockers.push(`artifact repository ${handoff.artifactRepo} is not visible to gh repo view`);
  } else if (repo.isPrivate === true || repo.visibility !== "PUBLIC") {
    blockers.push(`artifact repository ${handoff.artifactRepo} is not public`);
  }

  const publicationReady = blockers.length === 0;

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M7-7",
        decisionStatus: decision.status,
        recommendedSurface: decision.recommendedSurface,
        artifactRepo: handoff.artifactRepo,
        artifactRepoStatus: repo.status,
        artifactRepoVisibility: repo.visibility,
        artifactRepoUrl: repo.url,
        handoffRoot: handoff.handoffRoot,
        publicationReady,
        canPublishNow: publicationReady,
        blockers,
        nextProof:
          'ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL="https://..." ENGLISH_LEARNING_PUBLIC_SHA256SUMS_URL="https://..." node scripts/phase7-public-release-url-smoke.mjs',
        claimBoundary:
          "This preflight inspects readiness only. It does not create a repository, publish a release, or prove public URL access.",
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
        issue: "M7-7",
        error: error.message,
        claimBoundary:
          "A failing publication preflight means the project cannot safely proceed to public publication.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
