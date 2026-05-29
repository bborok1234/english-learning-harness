#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultTarget = resolve(repoRoot, "tmp/public-artifact");
const packageName = "english-learning-harness";
const artifactName = "english-learning-harness-public.tar.gz";

const includedPaths = [
  "README.md",
  "setup",
  "DESIGN.md",
  "AGENTS.md",
  ".codex-plugin",
  "skills",
  "hooks",
  "scripts",
  "docs",
  "design",
];

const forbiddenPaths = [
  ".git",
  ".omx",
  "tmp",
  "node_modules",
];

function parseArgs(argv) {
  const options = {
    target: defaultTarget,
  };
  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--target") {
      options.target = resolve(argv[index + 1]);
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

export function packagePublicArtifact(options = {}) {
  const target = resolve(options.target || defaultTarget);
  const stageRoot = resolve(target, "stage");
  const packageRoot = resolve(stageRoot, packageName);
  const artifactPath = resolve(target, artifactName);

  rmSync(stageRoot, { recursive: true, force: true });
  rmSync(artifactPath, { force: true });
  mkdirSync(packageRoot, { recursive: true });

  for (const entry of includedPaths) {
    const source = resolve(repoRoot, entry);
    assert(existsSync(source), `${entry} missing`);
    cpSync(source, resolve(packageRoot, entry), {
      recursive: true,
      dereference: true,
    });
  }

  for (const entry of forbiddenPaths) {
    assert(!existsSync(resolve(packageRoot, entry)), `artifact must not include ${entry}`);
  }

  execFileSync("tar", ["-czf", artifactPath, packageName], {
    cwd: stageRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });
  const artifactBytes = statSync(artifactPath).size;
  assert(artifactBytes > 0, "artifact is empty");

  return {
    status: "pass",
    artifactPath,
    artifactName: basename(artifactPath),
    packageRoot,
    artifactBytes,
    includedPaths,
    forbiddenPaths,
    claimBoundary:
      "This creates a public-distribution artifact candidate. It does not publish or host the artifact.",
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    console.log(JSON.stringify(packagePublicArtifact(parseArgs(process.argv)), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ status: "fail", error: error.message }, null, 2));
    process.exit(1);
  }
}
