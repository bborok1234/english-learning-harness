#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policyPath = resolve(repoRoot, "docs/distribution-policy.json");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    env: { ...process.env, ...(options.env ?? {}) },
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  });
}

function runOptional(command, args) {
  try {
    return run(command, args).trim();
  } catch {
    return "";
  }
}

function repoMetadata() {
  const output = runOptional("gh", ["repo", "view", "--json", "visibility,isPrivate,url,sshUrl"]);
  if (!output) {
    return {
      visibility: "UNKNOWN",
      isPrivate: undefined,
      url: "",
      sshUrl: "",
    };
  }
  return JSON.parse(output);
}

function main() {
  const policy = JSON.parse(readFileSync(policyPath, "utf8"));
  const repo = repoMetadata();

  assert(policy.schemaVersion === 1, "distribution policy schema mismatch");
  assert(policy.currentPolicy === "private-beta", "M6 first-complete policy should be private-beta");
  assert(policy.releaseClaim === "invited-user clone-to-learn", "release claim should be invited-user clone-to-learn");
  assert(policy.publicReleaseStatus === "deferred", "public release should be explicitly deferred");
  assert(
    policy.approvedClaims.some((claim) => claim.includes("invited GitHub collaborator")),
    "approved claims should mention invited GitHub collaborator access",
  );
  assert(
    policy.blockedClaims.some((claim) => claim.includes("Unauthenticated public HTTPS clone")),
    "blocked claims should include unauthenticated public clone",
  );
  assert(policy.publicReleaseRequirements?.common, "public release requirements should be grouped by surface");
  assert(
    policy.publicReleaseRequirements.common.some((requirement) => requirement.includes("Resolve #90")),
    "common public release requirements should include #90 decision",
  );
  assert(
    policy.publicReleaseRequirements.publicSourceRepository.some((requirement) =>
      requirement.includes("default public clone smoke"),
    ),
    "public source repository requirements should include default public clone smoke",
  );
  assert(
    policy.publicReleaseRequirements.publicArtifactRepositoryRelease.some((requirement) =>
      requirement.includes("phase7-public-release-url-smoke.mjs"),
    ),
    "public artifact repository requirements should include checksum-aware public release URL smoke",
  );
  assert(
    policy.publicReleaseRequirements.publicArtifactRepositoryRelease.some((requirement) =>
      requirement.includes("checksum-verified downloaded artifact"),
    ),
    "public artifact repository requirements should preserve local marketplace install boundary",
  );

  if (repo.isPrivate === true) {
    assert(
      policy.currentPolicy === "private-beta",
      "private repositories must not use a public release policy",
    );
  }

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M6-D",
        policyPath: "docs/distribution-policy.json",
        currentPolicy: policy.currentPolicy,
        releaseClaim: policy.releaseClaim,
        publicReleaseStatus: policy.publicReleaseStatus,
        repositoryVisibility: repo.visibility,
        repositoryIsPrivate: repo.isPrivate,
        approvedClaims: policy.approvedClaims,
        blockedClaims: policy.blockedClaims,
        recommendedSurface: policy.publicReleaseDecision.recommendedSurface,
        publicArtifactProof:
          policy.publicReleaseRequirements.publicArtifactRepositoryRelease.find((requirement) =>
            requirement.includes("phase7-public-release-url-smoke.mjs"),
          ),
        claimBoundary: policy.claimBoundary,
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
        issue: "M6-D",
        error: error.message,
        claimBoundary:
          "A failing distribution policy smoke means M6 release wording is not aligned with repository visibility.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
