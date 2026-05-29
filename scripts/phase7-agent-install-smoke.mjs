#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-7-agent-install-smoke", String(process.pid));
const codexSkillsDir = resolve(smokeRoot, "codex-skills");
const installStateDir = resolve(smokeRoot, "install-state");

const expectedSkills = [
  "english-learning-onboarding",
  "english-learning-daily-session",
  "english-learning-mini-mirror",
  "english-learning-picture-description",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runSetup(args = []) {
  return execFileSync(resolve(repoRoot, "setup"), ["--host", "codex", "--quiet", ...args], {
    cwd: repoRoot,
    env: {
      ...process.env,
      CODEX_SKILLS_DIR: codexSkillsDir,
      ENGLISH_LEARNING_INSTALL_STATE: installStateDir,
    },
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function assertInstall(copyMode) {
  for (const skill of expectedSkills) {
    const skillDir = resolve(codexSkillsDir, skill);
    assert(existsSync(resolve(skillDir, "SKILL.md")), `${skill} SKILL.md missing`);
    const stat = lstatSync(skillDir);
    if (copyMode) {
      assert(!stat.isSymbolicLink(), `${skill} should be copied in copy mode`);
    } else {
      assert(stat.isSymbolicLink(), `${skill} should be symlinked by default`);
    }
  }

  const installState = JSON.parse(readFileSync(resolve(installStateDir, "install.json"), "utf8"));
  assert(installState.repoRoot === repoRoot, "install state repoRoot mismatch");
  assert(installState.host === "codex", "install state host mismatch");
  assert(installState.skillsDir === codexSkillsDir, "install state skillsDir mismatch");
}

function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  runSetup();
  assertInstall(false);

  rmSync(smokeRoot, { recursive: true, force: true });
  runSetup(["--copy"]);
  assertInstall(true);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "D3",
        installedSkills: expectedSkills,
        claim: "setup installs the English Learning Harness Codex skill surface without touching real user skill directories",
      },
      null,
      2,
    ),
  );
}

main();
