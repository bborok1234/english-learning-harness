#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { preparePublicArtifactHandoff } from "./prepare-public-artifact-handoff.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-7-public-artifact-handoff", String(process.pid));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: options.cwd ?? repoRoot,
    encoding: "utf8",
    stdio: options.stdio ?? ["ignore", "pipe", "pipe"],
  });
}

function main() {
  const result = preparePublicArtifactHandoff({ target: smokeRoot });
  assert(result.status === "pass", "handoff preparation failed");
  assert(result.publicationPerformed === false, "handoff smoke must not publish");
  assert(existsSync(resolve(result.handoffRoot, result.artifactName)), "handoff artifact missing");
  assert(existsSync(resolve(result.handoffRoot, "SHA256SUMS")), "handoff checksum missing");
  assert(existsSync(resolve(result.handoffRoot, "PUBLIC-ARTIFACT-MANIFEST.json")), "handoff manifest missing");
  assert(existsSync(resolve(result.handoffRoot, "RELEASE-NOTES.md")), "handoff release notes missing");
  assert(existsSync(resolve(result.handoffRoot, "README.md")), "handoff public README missing");

  const manifest = JSON.parse(readFileSync(resolve(result.handoffRoot, "PUBLIC-ARTIFACT-MANIFEST.json"), "utf8"));
  assert(manifest.schemaVersion === 1, "manifest schema mismatch");
  assert(manifest.issue === 94, "manifest should track issue 94");
  assert(manifest.publicationPerformed === false, "manifest should record that no publication happened");
  assert(manifest.artifactSha256 === result.artifactSha256, "manifest checksum mismatch");
  assert(manifest.files.includes(result.artifactName), "manifest missing artifact file");
  assert(manifest.files.includes("README.md"), "manifest missing public README");
  assert(manifest.files.includes("SHA256SUMS"), "manifest missing SHA256SUMS");
  assert(manifest.latestReleaseDownloadUrl?.includes(result.artifactName), "manifest missing latest release URL");
  assert(manifest.publishCommand.includes("--repo"), "manifest publish command missing repo target");
  assert(
    manifest.publicUrlSmokeCommand.includes("phase7-hosted-artifact-smoke.mjs"),
    "manifest missing public URL smoke command",
  );
  assert(
    manifest.claimBoundary.includes("does not create a repository"),
    "manifest claim boundary should avoid publication claims",
  );

  const publicReadme = readFileSync(resolve(result.handoffRoot, "README.md"), "utf8");
  for (const required of [
    "curl -L -o english-learning-harness-public.tar.gz",
    "shasum -a 256 -c SHA256SUMS",
    "tar -xzf english-learning-harness-public.tar.gz",
    "node scripts/english-learning-harness.mjs setup --json",
    "node scripts/english-learning-harness.mjs daily --json",
    "node scripts/english-learning-harness.mjs today --say",
    "ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL=",
    "phase7-hosted-artifact-smoke.mjs",
    "does not prove",
  ]) {
    assert(publicReadme.includes(required), `handoff public README missing ${required}`);
  }

  run("shasum", ["-a", "256", "-c", "SHA256SUMS"], { cwd: result.handoffRoot });
  const listing = run("tar", ["-tzf", result.artifactName], { cwd: result.handoffRoot });
  for (const required of ["english-learning-harness/README.md", "english-learning-harness/scripts/english-learning-harness.mjs"]) {
    assert(listing.includes(required), `handoff artifact missing ${required}`);
  }
  for (const forbidden of [".git", ".omx", "tmp/", "node_modules"]) {
    assert(!listing.includes(`english-learning-harness/${forbidden}`), `handoff artifact includes forbidden path: ${forbidden}`);
  }

  console.log(JSON.stringify(result, null, 2));
}

try {
  main();
} catch (error) {
  console.error(
    JSON.stringify(
      {
        status: "fail",
        issue: "M7-2",
        error: error.message,
        claimBoundary:
          "A failing public artifact handoff smoke means the public artifact repository bundle is not ready for owner-approved publication.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
