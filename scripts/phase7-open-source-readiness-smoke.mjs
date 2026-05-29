#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");

const requiredFiles = [
  "LICENSE",
  "CONTRIBUTING.md",
  "CODE_OF_CONDUCT.md",
  "SECURITY.md",
  "SUPPORT.md",
  "GOVERNANCE.md",
  ".github/PULL_REQUEST_TEMPLATE.md",
  ".github/ISSUE_TEMPLATE/config.yml",
  ".github/ISSUE_TEMPLATE/bug_report.yml",
  ".github/ISSUE_TEMPLATE/feature_request.yml",
  ".github/ISSUE_TEMPLATE/learning_experience.yml",
];

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

function repoMetadata() {
  const result = runOptional("gh", [
    "repo",
    "view",
    "bborok1234/english-learning-harness",
    "--json",
    "visibility,isPrivate,url",
  ]);
  if (result.status !== "available") {
    return {
      status: "unavailable",
      visibility: "UNKNOWN",
      isPrivate: undefined,
      url: "",
      error: result.error,
    };
  }
  return {
    status: "available",
    ...JSON.parse(result.output),
  };
}

function findForbiddenLocalFiles() {
  const forbiddenNames = new Set([".env", ".env.local", ".env.production"]);
  const forbiddenSuffixes = [".pem", ".key"];
  const findings = [];
  const stack = [repoRoot];
  while (stack.length > 0) {
    const dir = stack.pop();
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if ([".git", ".omx", "tmp", "node_modules"].includes(entry.name)) continue;
      const path = resolve(dir, entry.name);
      const relative = path.slice(repoRoot.length + 1);
      if (entry.isDirectory()) {
        stack.push(path);
        continue;
      }
      if (
        forbiddenNames.has(entry.name) ||
        forbiddenSuffixes.some((suffix) => entry.name.endsWith(suffix)) ||
        /secret|token/i.test(entry.name)
      ) {
        findings.push(relative);
      }
    }
  }
  return findings;
}

function main() {
  for (const file of requiredFiles) {
    assert(existsSync(resolve(repoRoot, file)), `${file} missing`);
  }

  const readme = readFileSync(resolve(repoRoot, "README.md"), "utf8");
  for (const required of [
    "Open-source, local-first",
    "git clone https://github.com/bborok1234/english-learning-harness.git",
    "node scripts/phase6-public-clean-clone-smoke.mjs",
    "LICENSE",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "SECURITY.md",
  ]) {
    assert(readme.includes(required), `README missing ${required}`);
  }
  assert(!readme.includes("From a fresh private beta / invited-user clone"), "README still frames quick start as private beta");

  const policy = JSON.parse(readFileSync(resolve(repoRoot, "docs/distribution-policy.json"), "utf8"));
  assert(
    ["open-source-prep", "open-source-public"].includes(policy.currentPolicy),
    "policy should be open-source-prep or open-source-public",
  );
  assert(policy.releaseClaim === "public source clone-to-learn", "release claim should be public source clone-to-learn");
  assert(policy.publicReleaseDecision.recommendedSurface === "public_source_repository", "recommended surface should be public source repository");
  assert(policy.repositoryVisibilityRequired === "public", "repository visibility requirement should be public");
  assert(policy.cloneMode === "public-git-clone", "clone mode should be public-git-clone");
  assert(
    policy.publicReleaseRequirements.publicSourceRepository.some((requirement) =>
      requirement.includes("default public clone smoke"),
    ),
    "public source repository requirements should include public clone smoke",
  );

  const forbiddenLocalFiles = findForbiddenLocalFiles();
  assert(forbiddenLocalFiles.length === 0, `forbidden local files found: ${forbiddenLocalFiles.join(", ")}`);

  const repo = repoMetadata();
  const blockers = [];
  if (repo.status !== "available") {
    blockers.push("source repository is not visible to gh repo view");
  } else if (repo.isPrivate === true || repo.visibility !== "PUBLIC") {
    blockers.push("source repository is not public yet");
  }

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M7-11",
        requiredFiles,
        repositoryVisibility: repo.visibility,
        repositoryIsPrivate: repo.isPrivate,
        visibilityReady: blockers.length === 0,
        blockers,
        nextProof: "node scripts/phase6-public-clean-clone-smoke.mjs",
        claimBoundary:
          "This proves open-source repository readiness files and policy alignment only. It does not change repository visibility or prove public clone access.",
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
        issue: "M7-11",
        error: error.message,
        claimBoundary:
          "A failing open-source readiness smoke means the repository should not be made public yet.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
