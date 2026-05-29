#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-6-public-clean-clone", String(process.pid));
const cloneRoot = resolve(smokeRoot, "repo");
const learnerRoot = resolve(smokeRoot, "learner");

const exactCommands = [
  'git clone https://github.com/bborok1234/english-learning-harness.git',
  "node scripts/english-learning-harness.mjs setup",
  "node scripts/english-learning-harness.mjs daily --json",
  'node scripts/english-learning-harness.mjs today --say "I want to practice today." --json',
  "node scripts/english-learning-harness.mjs weekly --json",
  "node scripts/english-learning-harness.mjs home --json",
  "node scripts/english-learning-harness.mjs export --json",
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

function runOptional(command, args) {
  try {
    return run(command, args).trim();
  } catch {
    return "";
  }
}

function repoMetadata() {
  const output = runOptional("gh", [
    "repo",
    "view",
    "--json",
    "url,sshUrl,visibility,isPrivate",
  ]);
  if (!output) {
    return {
      url: "",
      sshUrl: "",
      visibility: "UNKNOWN",
      isPrivate: undefined,
    };
  }
  return JSON.parse(output);
}

function clonePlan() {
  if (process.env.ENGLISH_LEARNING_PUBLIC_CLONE_URL) {
    return {
      url: process.env.ENGLISH_LEARNING_PUBLIC_CLONE_URL,
      publicAccessStatus: "env_override",
      visibility: "UNKNOWN",
    };
  }
  const metadata = repoMetadata();
  if (metadata.isPrivate === true && process.env.ENGLISH_LEARNING_ALLOW_PRIVATE_CLONE_SMOKE !== "1") {
    throw new Error(
      [
        "Public clone smoke is blocked because the GitHub repository is PRIVATE.",
        "Set ENGLISH_LEARNING_ALLOW_PRIVATE_CLONE_SMOKE=1 to verify the authenticated clone mechanics only.",
        "Do not treat the private authenticated mode as public release evidence.",
      ].join(" "),
    );
  }

  if (metadata.isPrivate === true) {
    return {
      url: metadata.sshUrl || run("git", ["remote", "get-url", "origin"]).trim(),
      publicAccessStatus: "private_authenticated_clone_only",
      visibility: metadata.visibility,
    };
  }

  return {
    url: metadata.url || runOptional("gh", ["repo", "view", "--json", "url", "-q", ".url"]) || run("git", ["remote", "get-url", "origin"]).trim(),
    publicAccessStatus: "public",
    visibility: metadata.visibility,
  };
}

function runJson(args) {
  return JSON.parse(
    run("node", args, {
      cwd: cloneRoot,
      env: {
        ENGLISH_LEARNING_HOME: learnerRoot,
      },
    }),
  );
}

function assertReadmeMatchesVerifiedPath() {
  const readme = readFileSync(resolve(repoRoot, "README.md"), "utf8");
  for (const command of exactCommands) {
    assert(readme.includes(command), `README is missing verified command: ${command}`);
  }
}

function assertCloneStaysClean() {
  const status = run("git", ["status", "--short"], { cwd: cloneRoot });
  assert(status.trim() === "", `public clone produced untracked or modified files:\n${status}`);
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  mkdirSync(smokeRoot, { recursive: true });
  assertReadmeMatchesVerifiedPath();

  const plan = clonePlan();
  run("git", ["clone", "--depth", "1", plan.url, cloneRoot], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  const setup = runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--name",
    "Public Clone Learner",
    "--motivation",
    "I want to start speaking English after cloning this repository.",
    "--correction-style",
    "gentle recast first",
    "--json",
  ]);
  assert(setup.status === "pass", "public clone setup failed");
  assert(setup.health?.profileReady === true, "public clone setup did not create a ready profile");

  const dailyBefore = runJson(["scripts/english-learning-harness.mjs", "daily", "--json"]);
  assert(dailyBefore.status === "pass", "public clone daily cockpit failed");
  assert(dailyBefore.cockpit?.next_commands?.length >= 1, "daily cockpit did not return next commands");

  const today = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--say",
    "I want to practice today.",
    "--say",
    "I need a gentle correction.",
    "--json",
  ]);
  assert(today.status === "pass", "public clone today failed");
  assert(today.finalizesSession === true, "today did not finalize a session");
  assert(existsSync(today.artifactPath), "today artifact is missing");
  assert(existsSync(today.journalPath), "today journal is missing");

  const weekly = runJson(["scripts/english-learning-harness.mjs", "weekly", "--json"]);
  assert(weekly.status === "pass", "public clone weekly mirror failed");
  assert(existsSync(weekly.mirrorPath), "weekly mirror file is missing");
  assert(weekly.mirror?.window?.session_count >= 1, "weekly mirror did not include the session");

  const home = runJson(["scripts/english-learning-harness.mjs", "home", "--json"]);
  assert(home.status === "pass", "public clone learner home failed");
  assert(existsSync(home.homePath), "learner home file is missing");

  const exported = runJson(["scripts/english-learning-harness.mjs", "export", "--json"]);
  assert(exported.status === "pass", "public clone evidence export failed");
  assert(existsSync(exported.evidencePackPath), "evidence JSON pack is missing");
  assert(existsSync(exported.evidenceMarkdownPath), "evidence Markdown pack is missing");
  assert(exported.summary.session_count >= 1, "evidence export did not include the session");

  const health = runJson(["scripts/english-learning-harness.mjs", "health", "--json"]);
  assert(health.status === "pass", "public clone health failed");
  assert(health.sessionCount >= 1, "public clone health did not see the session");

  const progressValidation = JSON.parse(
    run("node", ["scripts/validate-progress.mjs", resolve(learnerRoot, "progress.json")], {
      cwd: cloneRoot,
    }),
  );
  assert(progressValidation.status === "pass", "public clone progress validation failed");

  assertCloneStaysClean();

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M6-1",
        cloneUrl: plan.url,
        repositoryVisibility: plan.visibility,
        publicAccessStatus: plan.publicAccessStatus,
        cloneRoot,
        learnerRoot,
        verifiedCommands: exactCommands,
        sessionCount: health.sessionCount,
        weeklyMirrorPath: weekly.mirrorPath,
        learnerHomePath: home.homePath,
        evidencePackPath: exported.evidencePackPath,
        evidenceMarkdownPath: exported.evidenceMarkdownPath,
        cloneGitStatusClean: true,
        claimBoundary:
          plan.publicAccessStatus === "public"
            ? "This proves the public GitHub clone-to-local-learning command path, not long-term learner outcomes or public marketplace install."
            : "This proves authenticated clone mechanics only. Public clone-to-learning remains blocked while the repository is private.",
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
        issue: "M6-1",
        error: error.message,
        claimBoundary:
          "A failing public clone smoke is release evidence, not a learner outcome claim.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
