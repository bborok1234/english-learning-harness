#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-6-marketplace-install", String(process.pid));
const cloneRoot = resolve(smokeRoot, "repo");
const marketplaceRoot = resolve(smokeRoot, "marketplace");
const codexHome = resolve(smokeRoot, "codex-home");

const documentedCommands = [
  "node scripts/package-local-marketplace.mjs --target tmp/english-learning-marketplace",
  'CODEX_HOME="$PWD/tmp/codex-home" codex plugin marketplace add "$PWD/tmp/english-learning-marketplace"',
  "CODEX_HOME=\"$PWD/tmp/codex-home\" codex plugin add english-learning-harness@english-learning-local",
  'CODEX_HOME="$PWD/tmp/codex-home" codex plugin list',
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

function originUrl() {
  return process.env.ENGLISH_LEARNING_CLONE_URL || run("git", ["remote", "get-url", "origin"]).trim();
}

function assertReadmeInstallClaims() {
  const readme = readFileSync(resolve(repoRoot, "README.md"), "utf8");
  for (const command of documentedCommands) {
    assert(readme.includes(command), `README is missing verified marketplace command: ${command}`);
  }
  assert(
    readme.includes("Public Git-backed install remains unverified"),
    "README must explicitly mark public Git-backed install as unverified",
  );
  assert(!/codex plugin add\s+https?:\/\//.test(readme), "README must not advertise URL-backed plugin install");
  assert(!/codex plugin add\s+github/i.test(readme), "README must not advertise GitHub-backed plugin install");
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  assertReadmeInstallClaims();

  const url = originUrl();
  run("git", ["clone", "--depth", "1", url, cloneRoot]);

  const packaged = JSON.parse(
    run("node", [
      "scripts/package-local-marketplace.mjs",
      "--target",
      marketplaceRoot,
      "--marketplace-name",
      "phase6-marketplace",
      "--display-name",
      "Phase 6 Marketplace",
    ], {
      cwd: cloneRoot,
    }),
  );
  assert(packaged.status === "pass", "marketplace packaging failed");
  assert(existsSync(packaged.marketplaceManifest), "marketplace manifest missing");
  assert(existsSync(resolve(packaged.pluginRoot, ".codex-plugin/plugin.json")), "packaged plugin manifest missing");
  assert(existsSync(resolve(packaged.pluginRoot, "scripts/english-learning-harness.mjs")), "packaged command wrapper missing");

  mkdirSync(codexHome, { recursive: true });
  const env = { CODEX_HOME: codexHome };
  run("codex", ["plugin", "marketplace", "add", marketplaceRoot], {
    cwd: cloneRoot,
    env,
  });
  run("codex", ["plugin", "add", "english-learning-harness@phase6-marketplace"], {
    cwd: cloneRoot,
    env,
  });
  const listOutput = run("codex", ["plugin", "list"], {
    cwd: cloneRoot,
    env,
  });
  assert(listOutput.includes("english-learning-harness@phase6-marketplace"), "installed plugin missing from list");
  assert(listOutput.includes("installed, enabled"), "installed plugin is not enabled");

  const cloneStatus = run("git", ["status", "--short"], { cwd: cloneRoot });
  assert(cloneStatus.trim() === "", `marketplace install smoke dirtied clone:\n${cloneStatus}`);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M6-2",
        cloneUrl: url,
        cloneRoot,
        marketplaceRoot,
        codexHome,
        marketplaceManifest: packaged.marketplaceManifest,
        pluginRoot: packaged.pluginRoot,
        documentedCommands,
        installedPlugin: "english-learning-harness@phase6-marketplace",
        cloneGitStatusClean: true,
        claimBoundary:
          "This proves local marketplace packaging and isolated CODEX_HOME install only. Public Git-backed install remains unverified.",
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
        issue: "M6-2",
        error: error.message,
        claimBoundary:
          "A failing marketplace smoke means documented install mechanics are not release-ready.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
