#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { packagePublicArtifact } from "./package-public-artifact.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultTarget = resolve(repoRoot, "tmp/public-artifact-handoff");
const defaultArtifactRepo = "bborok1234/english-learning-harness-public";
const releaseTag = "public-artifact-candidate";

function parseArgs(argv) {
  const options = {
    target: defaultTarget,
    artifactRepo: defaultArtifactRepo,
  };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--target") {
      options.target = resolve(argv[index + 1]);
      index += 1;
    } else if (arg === "--artifact-repo") {
      options.artifactRepo = argv[index + 1];
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

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function latestReleaseDownloadUrl(artifactRepo, artifactName) {
  return `https://github.com/${artifactRepo}/releases/latest/download/${artifactName}`;
}

function main(options = {}) {
  const target = resolve(options.target || defaultTarget);
  const artifactRepo = options.artifactRepo || defaultArtifactRepo;
  const distRoot = resolve(target, "dist");
  const handoffRoot = resolve(target, "handoff");

  assert(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(artifactRepo), "artifact repo must look like owner/repo");

  rmSync(target, { recursive: true, force: true });
  mkdirSync(handoffRoot, { recursive: true });

  const packaged = packagePublicArtifact({ target: distRoot });
  const artifactName = basename(packaged.artifactPath);
  const artifactBytes = statSync(packaged.artifactPath).size;
  const artifactSha256 = sha256(packaged.artifactPath);
  const artifactUrl = latestReleaseDownloadUrl(artifactRepo, artifactName);
  const artifactTarget = resolve(handoffRoot, artifactName);

  writeFileSync(artifactTarget, readFileSync(packaged.artifactPath));

  const checksumsPath = resolve(handoffRoot, "SHA256SUMS");
  writeFileSync(checksumsPath, `${artifactSha256}  ${artifactName}\n`);

  const publicReadmePath = resolve(handoffRoot, "README.md");
  writeFileSync(
    publicReadmePath,
    [
      "# English Learning Harness Public Artifact",
      "",
      "This repository hosts the downloadable English Learning Harness artifact. Use it when the source repository is private but you want to start local English practice from a public URL.",
      "",
      "## Start",
      "",
      "```bash",
      `curl -L -o ${artifactName} ${artifactUrl}`,
      "curl -L -o SHA256SUMS https://github.com/" + artifactRepo + "/releases/latest/download/SHA256SUMS",
      "shasum -a 256 -c SHA256SUMS",
      "mkdir -p english-learning-harness-public",
      `tar -xzf ${artifactName} -C english-learning-harness-public`,
      "cd english-learning-harness-public/english-learning-harness",
      "node scripts/english-learning-harness.mjs setup --json",
      "node scripts/english-learning-harness.mjs daily --json",
      "node scripts/english-learning-harness.mjs today --say \"I want to practice today.\" --json",
      "```",
      "",
      "## Optional Codex Plugin Install",
      "",
      "If you want to install the harness as a local Codex plugin from the downloaded artifact:",
      "",
      "```bash",
      "node scripts/package-local-marketplace.mjs --target tmp/english-learning-marketplace --marketplace-name phase7-public-artifact --display-name \"English Learning Public Artifact\"",
      "CODEX_HOME=\"$PWD/tmp/codex-home\" codex plugin marketplace add \"$PWD/tmp/english-learning-marketplace\"",
      "CODEX_HOME=\"$PWD/tmp/codex-home\" codex plugin add english-learning-harness@phase7-public-artifact",
      "CODEX_HOME=\"$PWD/tmp/codex-home\" codex plugin list",
      "```",
      "",
      "This is a local marketplace install from the downloaded artifact. It is not a public Git-backed plugin install.",
      "",
      "## Verify The Public URL",
      "",
      "The source project can claim public distribution only after the real artifact URL passes the hosted artifact smoke:",
      "",
      "```bash",
      `ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL=\"${artifactUrl}\" node scripts/phase7-hosted-artifact-smoke.mjs`,
      "```",
      "",
      "## Claim Boundary",
      "",
      "This README is a publication handoff file. It does not prove that the artifact is already public, current, or reachable. Verify the final release URL before claiming public distribution.",
      "",
    ].join("\n"),
  );

  const releaseNotesPath = resolve(handoffRoot, "RELEASE-NOTES.md");
  writeFileSync(
    releaseNotesPath,
    [
      "# English Learning Harness Public Artifact Candidate",
      "",
      "This release contains the distributable English Learning Harness tarball.",
      "",
      "## Verify",
      "",
      "```bash",
      "shasum -a 256 -c SHA256SUMS",
      "tar -tzf english-learning-harness-public.tar.gz | head",
      "```",
      "",
      "## Claim Boundary",
      "",
      "Publishing this artifact is not enough to close public distribution. The real public URL must pass `node scripts/phase7-hosted-artifact-smoke.mjs` with `ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL` set.",
      "",
    ].join("\n"),
  );

  const publishCommand = [
    "gh",
    "release",
    "create",
    releaseTag,
    artifactName,
    "SHA256SUMS",
    "PUBLIC-ARTIFACT-MANIFEST.json",
    "RELEASE-NOTES.md",
    "--repo",
    artifactRepo,
    "--title",
    "\"English Learning Harness public artifact candidate\"",
    "--notes-file",
    "RELEASE-NOTES.md",
  ].join(" ");

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    issue: 94,
    artifactRepo,
    releaseTag,
    artifactName,
    artifactBytes,
    artifactSha256,
    files: [
      "README.md",
      artifactName,
      "SHA256SUMS",
      "PUBLIC-ARTIFACT-MANIFEST.json",
      "RELEASE-NOTES.md",
    ],
    publicReadmePath: "README.md",
    latestReleaseDownloadUrl: artifactUrl,
    publishCommand,
    publicUrlSmokeCommand:
      'ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL="https://..." node scripts/phase7-hosted-artifact-smoke.mjs',
    publicationPerformed: false,
    claimBoundary:
      "This prepares a public artifact repository handoff bundle only. It does not create a repository, publish a release, or prove a public URL.",
  };
  const manifestPath = resolve(handoffRoot, "PUBLIC-ARTIFACT-MANIFEST.json");
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  return {
    status: "pass",
    issue: "M7-2",
    handoffRoot,
    artifactRepo,
    artifactName,
    artifactBytes,
    artifactSha256,
    manifestPath,
    checksumsPath,
    releaseNotesPath,
    publicReadmePath,
    latestReleaseDownloadUrl: artifactUrl,
    publishCommand,
    publicationPerformed: false,
    claimBoundary: manifest.claimBoundary,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    console.log(JSON.stringify(main(parseArgs(process.argv)), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ status: "fail", issue: "M7-2", error: error.message }, null, 2));
    process.exit(1);
  }
}

export { main as preparePublicArtifactHandoff };
