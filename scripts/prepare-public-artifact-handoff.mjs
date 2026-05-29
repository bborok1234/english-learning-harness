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
  const artifactTarget = resolve(handoffRoot, artifactName);

  writeFileSync(artifactTarget, readFileSync(packaged.artifactPath));

  const checksumsPath = resolve(handoffRoot, "SHA256SUMS");
  writeFileSync(checksumsPath, `${artifactSha256}  ${artifactName}\n`);

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
      artifactName,
      "SHA256SUMS",
      "PUBLIC-ARTIFACT-MANIFEST.json",
      "RELEASE-NOTES.md",
    ],
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
