#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { packagePublicArtifact } from "./package-public-artifact.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-7-public-artifact", String(process.pid));
const distRoot = resolve(smokeRoot, "dist");
const extractRoot = resolve(smokeRoot, "extract");
const learnerRoot = resolve(smokeRoot, "learner");
const artifactPackageRoot = resolve(extractRoot, "english-learning-harness");

const documentedBoundary = "does not publish or host the artifact";

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

function runJson(args, cwd = artifactPackageRoot) {
  return JSON.parse(
    run("node", args, {
      cwd,
      env: {
        ENGLISH_LEARNING_HOME: learnerRoot,
      },
    }),
  );
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  mkdirSync(extractRoot, { recursive: true });

  const packaged = packagePublicArtifact({ target: distRoot });
  assert(packaged.status === "pass", "public artifact packaging failed");
  assert(existsSync(packaged.artifactPath), "public artifact tarball missing");
  assert(packaged.claimBoundary.includes(documentedBoundary), "artifact package boundary missing");

  const listing = run("tar", ["-tzf", packaged.artifactPath], { cwd: repoRoot });
  for (const forbidden of [".git", ".omx", "tmp/", "node_modules"]) {
    assert(!listing.includes(`english-learning-harness/${forbidden}`), `artifact includes forbidden path: ${forbidden}`);
  }
  for (const required of [
    "README.md",
    "README.en.md",
    "setup",
    "docs/distribution-policy.json",
    "scripts/english-learning-harness.mjs",
  ]) {
    assert(listing.includes(`english-learning-harness/${required}`), `artifact missing ${required}`);
  }

  run("tar", ["-xzf", packaged.artifactPath, "-C", extractRoot]);
  assert(existsSync(resolve(artifactPackageRoot, "README.md")), "extracted README missing");
  assert(existsSync(resolve(artifactPackageRoot, "README.en.md")), "extracted English README missing");
  assert(existsSync(resolve(artifactPackageRoot, "setup")), "extracted setup missing");
  assert(existsSync(resolve(artifactPackageRoot, "scripts/english-learning-harness.mjs")), "extracted command wrapper missing");

  const policy = JSON.parse(readFileSync(resolve(artifactPackageRoot, "docs/distribution-policy.json"), "utf8"));
  assert(
    ["deferred", "preparing-public-source", "public-source-live"].includes(policy.publicReleaseStatus),
    "artifact should preserve a recognized public release status",
  );

  const setup = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--name",
    "Artifact Learner",
    "--motivation",
    "I want to test a downloadable English practice harness.",
    "--json",
  ]);
  assert(setup.status === "pass", "artifact setup failed");
  assert(setup.support?.nativeHooksStatus === "optional", "artifact setup should keep native hooks optional");

  const daily = runJson(["scripts/english-learning-harness.mjs", "daily", "--json"]);
  assert(daily.status === "pass", "artifact daily cockpit failed");
  assert(daily.cockpit?.next_commands?.some((command) => command.includes("today")), "daily cockpit missing today command");

  const today = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--say",
    "I can start from a downloaded artifact.",
    "--json",
  ]);
  assert(today.status === "pass", "artifact today failed");
  assert(existsSync(today.artifactPath), "artifact session file missing");

  const weekly = runJson(["scripts/english-learning-harness.mjs", "weekly", "--json"]);
  assert(weekly.status === "pass", "artifact weekly failed");

  const home = runJson(["scripts/english-learning-harness.mjs", "home", "--json"]);
  assert(home.status === "pass", "artifact home failed");
  assert(existsSync(home.homePath), "artifact home file missing");

  const exported = runJson(["scripts/english-learning-harness.mjs", "export", "--json"]);
  assert(exported.status === "pass", "artifact evidence export failed");
  assert(existsSync(exported.evidencePackPath), "artifact evidence JSON missing");
  assert(existsSync(exported.evidenceMarkdownPath), "artifact evidence Markdown missing");

  const progressValidation = JSON.parse(
    run("node", ["scripts/validate-progress.mjs", resolve(learnerRoot, "progress.json")], {
      cwd: artifactPackageRoot,
    }),
  );
  assert(progressValidation.status === "pass", "artifact progress validation failed");

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M7-1",
        artifactPath: packaged.artifactPath,
        artifactBytes: packaged.artifactBytes,
        extractRoot,
        learnerRoot,
        sessionCount: exported.summary.session_count,
        publicReleaseStatus: policy.publicReleaseStatus,
        claimBoundary:
          "This proves public artifact mechanics from a tarball candidate only. It does not prove that the artifact is publicly hosted or downloadable.",
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
          "A failing public artifact smoke means the distribution artifact is not ready to publish.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
