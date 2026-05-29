#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const maxObjectBytes = 5 * 1024 * 1024;

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

function runOptional(command, args) {
  try {
    return run(command, args).trim();
  } catch (error) {
    return `${error.stdout || ""}${error.stderr || ""}`.trim();
  }
}

function lines(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function committedPaths() {
  return Array.from(new Set(lines(run("git", ["log", "--all", "--name-only", "--pretty=format:"])))).sort();
}

function forbiddenPathFindings(paths) {
  const findings = [];
  const forbiddenSegment = /(^|\/)(\.omx|tmp|node_modules)(\/|$)/;
  const forbiddenFile = /(^|\/)(\.env(\..*)?|.*\.(pem|key|p12|pfx)|.*secret.*|.*credential.*)(\/|$)/i;
  const localMedia = /\.(wav|mp3|m4a|mp4|mov|png|jpg|jpeg|heic)$/i;
  for (const path of paths) {
    if (
      forbiddenSegment.test(path) ||
      forbiddenFile.test(path) ||
      (localMedia.test(path) && !path.startsWith("docs/") && !path.startsWith("design/"))
    ) {
      findings.push(path);
    }
  }
  return findings;
}

function secretContentFindings(revisions) {
  const patterns = [
    "sk-[A-Za-z0-9_-]{20,}",
    "github_pat_[A-Za-z0-9_]{20,}",
    "gh[pousr]_[A-Za-z0-9_]{20,}",
    "AKIA[0-9A-Z]{16}",
    "AIza[0-9A-Za-z_-]{35}",
    "xox[baprs]-[A-Za-z0-9-]{20,}",
    "-----BEGIN (RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----",
  ];
  const grepPattern = patterns.join("|");
  const findings = [];
  for (const revision of revisions) {
    const output = runOptional("git", ["grep", "-I", "-n", "-E", grepPattern, revision, "--", "."]);
    if (!output) continue;
    for (const line of lines(output)) {
      findings.push(line.replace(/^(.{160}).+$/, "$1..."));
    }
  }
  return Array.from(new Set(findings)).sort();
}

function largeObjectFindings() {
  const objects = lines(run("git", ["rev-list", "--objects", "--all"]));
  const findings = [];
  for (const objectLine of objects) {
    const [oid, ...pathParts] = objectLine.split(" ");
    const path = pathParts.join(" ");
    if (!path) continue;
    const size = Number(run("git", ["cat-file", "-s", oid]).trim());
    if (size > maxObjectBytes) {
      findings.push({ path, bytes: size });
    }
  }
  return findings;
}

function main() {
  assert(existsSync(resolve(repoRoot, ".git")), "git repository missing");
  const revisions = lines(run("git", ["rev-list", "--all"]));
  assert(revisions.length > 0, "git history is empty");

  const paths = committedPaths();
  const pathFindings = forbiddenPathFindings(paths);
  const secretFindings = secretContentFindings(revisions);
  const largeObjects = largeObjectFindings();

  assert(pathFindings.length === 0, `forbidden historical paths found: ${pathFindings.join(", ")}`);
  assert(secretFindings.length === 0, `secret-like historical content found: ${secretFindings.slice(0, 5).join(" | ")}`);
  assert(
    largeObjects.length === 0,
    `large historical objects found: ${largeObjects.map((item) => `${item.path}:${item.bytes}`).join(", ")}`,
  );

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M7-12",
        revisionsScanned: revisions.length,
        committedPathsScanned: paths.length,
        maxObjectBytes,
        forbiddenPathFindings: pathFindings.length,
        secretContentFindings: secretFindings.length,
        largeObjectFindings: largeObjects.length,
        claimBoundary:
          "This scans git history for obvious public-release blockers only. It does not change repository visibility or prove public clone access.",
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
        issue: "M7-12",
        error: error.message,
        claimBoundary:
          "A failing git history audit means the repository should not be made public until findings are reviewed and remediated.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
