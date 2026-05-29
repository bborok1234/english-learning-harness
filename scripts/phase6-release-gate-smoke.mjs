#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const requiredEvidence = [
  "docs/phase-6-evidence/M6-1-public-clean-clone.md",
  "docs/phase-6-evidence/M6-2-marketplace-install.md",
  "docs/phase-6-evidence/M6-3-onboarding-diagnostics.md",
  "docs/phase-6-evidence/M6-4-release-gate.md",
];

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

function runJson(command, args, options = {}) {
  return JSON.parse(run(command, args, options));
}

function runExpectedFailure(command, args, options = {}) {
  try {
    run(command, args, options);
  } catch (error) {
    return `${error.stdout || ""}${error.stderr || ""}`;
  }
  throw new Error(`${command} ${args.join(" ")} unexpectedly passed`);
}

function main() {
  for (const file of requiredEvidence) {
    assert(existsSync(resolve(repoRoot, file)), `${file} missing`);
  }

  const authenticatedClone = runJson("node", ["scripts/phase6-public-clean-clone-smoke.mjs"], {
    env: { ENGLISH_LEARNING_ALLOW_PRIVATE_CLONE_SMOKE: "1" },
  });
  assert(authenticatedClone.status === "pass", "authenticated clone mechanics failed");
  assert(
    authenticatedClone.publicAccessStatus === "private_authenticated_clone_only" ||
      authenticatedClone.publicAccessStatus === "public",
    "unexpected clone access status",
  );

  if (authenticatedClone.publicAccessStatus === "public") {
    const publicClone = runJson("node", ["scripts/phase6-public-clean-clone-smoke.mjs"]);
    assert(publicClone.status === "pass", "public clone smoke failed");
  } else {
    const publicCloneFailure = runExpectedFailure("node", ["scripts/phase6-public-clean-clone-smoke.mjs"]);
    assert(
      publicCloneFailure.includes("repository is PRIVATE"),
      "public clone failure should explain private repository visibility",
    );
  }

  const marketplace = runJson("node", ["scripts/phase6-marketplace-install-smoke.mjs"]);
  assert(marketplace.status === "pass", "marketplace install smoke failed");

  const diagnostics = runJson("node", ["scripts/phase6-onboarding-diagnostics-smoke.mjs"]);
  assert(diagnostics.status === "pass", "onboarding diagnostics smoke failed");

  const canCloseM6 = authenticatedClone.publicAccessStatus === "public";
  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M6-4",
        decision: canCloseM6 ? "ready_to_close_m6" : "blocked_by_distribution_policy",
        canCloseM6,
        blockers: canCloseM6
          ? []
          : [
              "#72 public clone smoke is not passing in default mode",
              "#78 repository visibility / distribution policy is unresolved",
            ],
        verified: {
          authenticatedClone: authenticatedClone.status,
          publicAccessStatus: authenticatedClone.publicAccessStatus,
          marketplaceInstall: marketplace.status,
          onboardingDiagnostics: diagnostics.status,
          evidenceFiles: requiredEvidence,
        },
        claimBoundary:
          "This release gate audits M6 readiness. It does not change repository visibility or claim learning outcomes.",
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
        issue: "M6-4",
        error: error.message,
        claimBoundary:
          "A failing M6 release gate means public clone-to-learn release readiness is not established.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
