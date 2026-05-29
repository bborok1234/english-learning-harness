#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { packageLocalMarketplace } from "./package-local-marketplace.mjs";
import { validateProgress } from "./validate-progress.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/phase-1-scaffold-smoke");
const learnerRoot = resolve(tmpRoot, "learner");
const hooksTarget = resolve(tmpRoot, "hooks.json");
const marketplaceRoot = resolve(tmpRoot, "marketplace");
const codexHome = resolve(tmpRoot, "codex-home");

const requiredFiles = [
  ".codex-plugin/plugin.json",
  "README.md",
  "README.en.md",
  "setup",
  ".github/workflows/public-artifact.yml",
  "skills/onboarding/SKILL.md",
  "skills/daily-session/SKILL.md",
  "skills/mini-mirror/SKILL.md",
  "skills/picture-description/SKILL.md",
  "hooks/english-learning-hook.mjs",
  "hooks/hook-chain-runner.mjs",
  "hooks/hooks.json",
  "scripts/validate-progress.mjs",
  "scripts/install-native-hooks.mjs",
  "scripts/english-learning-harness.mjs",
  "scripts/english-learning.mjs",
  "scripts/lib/english-learning-store.mjs",
  "scripts/lib/scenario-engine.mjs",
  "scripts/lib/persona-fixtures.mjs",
  "scripts/package-local-marketplace.mjs",
  "scripts/package-public-artifact.mjs",
  "scripts/prepare-public-artifact-handoff.mjs",
  "scripts/phase1-command-wrapper-smoke.mjs",
  "scripts/phase1-vocabulary-history-smoke.mjs",
  "scripts/phase1-scenario-loop-smoke.mjs",
  "scripts/phase1-persona-fixture-smoke.mjs",
  "scripts/phase1-stop-finalization-smoke.mjs",
  "scripts/phase1-setup-recovery-smoke.mjs",
  "scripts/phase1-clean-clone-smoke.mjs",
  "scripts/phase2-learner-model-smoke.mjs",
  "scripts/phase2-review-vault-smoke.mjs",
  "scripts/phase2-scenario-planner-smoke.mjs",
  "scripts/phase2-tutor-policy-smoke.mjs",
  "scripts/phase2-weekly-mirror-smoke.mjs",
  "scripts/phase3-daily-cockpit-smoke.mjs",
  "scripts/phase3-learner-home-smoke.mjs",
  "scripts/phase3-no-streak-return-smoke.mjs",
  "scripts/phase3-seven-day-simulation-smoke.mjs",
  "scripts/phase3-m3-gate-smoke.mjs",
  "scripts/phase4-interaction-event-schema-smoke.mjs",
  "scripts/phase4-text-event-persistence-smoke.mjs",
  "scripts/phase4-voice-event-import-smoke.mjs",
  "scripts/phase4-image-information-gap-smoke.mjs",
  "scripts/phase4-multimodal-gate-smoke.mjs",
  "scripts/phase5-evidence-export-smoke.mjs",
  "scripts/phase5-transcript-rubric-smoke.mjs",
  "scripts/phase5-persona-validation-smoke.mjs",
  "scripts/phase5-m5-gate-smoke.mjs",
  "scripts/phase6-public-clean-clone-smoke.mjs",
  "scripts/phase6-distribution-policy-smoke.mjs",
  "scripts/phase6-marketplace-install-smoke.mjs",
  "scripts/phase6-onboarding-diagnostics-smoke.mjs",
  "scripts/phase6-release-gate-smoke.mjs",
  "scripts/phase7-public-artifact-smoke.mjs",
  "scripts/phase7-hosted-artifact-smoke.mjs",
  "scripts/phase7-release-workflow-smoke.mjs",
  "scripts/phase7-public-release-decision-smoke.mjs",
  "scripts/phase7-public-artifact-handoff-smoke.mjs",
  "scripts/phase7-public-release-url-smoke.mjs",
  "scripts/phase7-public-artifact-install-smoke.mjs",
  "scripts/prepare-public-release-approval.mjs",
  "scripts/phase7-public-release-approval-smoke.mjs",
  "scripts/phase7-open-source-readiness-smoke.mjs",
  "scripts/phase7-open-source-history-audit-smoke.mjs",
  "scripts/phase7-publication-preflight.mjs",
  "scripts/phase7-learner-readme-smoke.mjs",
  "scripts/phase7-agent-install-smoke.mjs",
  "scripts/phase8-speaking-skill-os-smoke.mjs",
  "scripts/phase8-speaking-skill-os-queue-smoke.mjs",
  "scripts/phase8-speaking-skill-os-seven-day-smoke.mjs",
];

function readJson(path) {
  return JSON.parse(readFileSync(resolve(repoRoot, path), "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function validateManifest() {
  const manifest = readJson(".codex-plugin/plugin.json");
  assert(manifest.name === "english-learning-harness", "manifest name mismatch");
  assert(manifest.skills === "./skills/", "manifest skills path mismatch");
  assert(!Object.hasOwn(manifest, "hooks"), "manifest must not rely on plugin-scoped hooks");
  assert(manifest.interface?.shortDescription, "manifest interface shortDescription missing");
}

function validateSkillSkeletons() {
  for (const file of requiredFiles) {
    assert(existsSync(resolve(repoRoot, file)), `${file} missing`);
  }
}

function validateNativeHookInstaller() {
  const output = execFileSync("node", ["scripts/install-native-hooks.mjs", "--install", "--target", hooksTarget], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  const result = JSON.parse(output);
  assert(result.status === "pass", "hook installer did not pass");

  const hooks = JSON.parse(readFileSync(hooksTarget, "utf8")).hooks;
  for (const event of ["SessionStart", "PreToolUse", "Stop", "PreCompact"]) {
    assert(Array.isArray(hooks[event]), `native hook config missing ${event}`);
  }
}

function validateHookScript() {
  const output = execFileSync("node", ["hooks/english-learning-hook.mjs", "SessionStart"], {
    cwd: repoRoot,
    env: {
      ...process.env,
      ENGLISH_LEARNING_HOME: learnerRoot,
    },
    encoding: "utf8",
  });
  const result = JSON.parse(output);
  assert(result.hookSpecificOutput?.additionalContext, "SessionStart did not emit context");
  assert(existsSync(resolve(learnerRoot, "profile.md")), "profile.md was not created");
  assert(existsSync(resolve(learnerRoot, "progress.json")), "progress.json was not created");
}

function validateProgressSchema() {
  const progressPath = resolve(learnerRoot, "progress.json");
  const errors = validateProgress(JSON.parse(readFileSync(progressPath, "utf8")), progressPath);
  assert(errors.length === 0, `progress schema errors: ${errors.join("; ")}`);

  const cliOutput = execFileSync("node", ["scripts/validate-progress.mjs", progressPath], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  assert(JSON.parse(cliOutput).status === "pass", "progress validator CLI failed");
}

function prepareMarketplace() {
  packageLocalMarketplace({
    target: marketplaceRoot,
    marketplaceName: "phase1-scaffold",
    displayName: "Phase 1 Scaffold",
  });
}

function validateInstallPath() {
  prepareMarketplace();
  mkdirSync(codexHome, { recursive: true });
  const env = { ...process.env, CODEX_HOME: codexHome };

  execFileSync("codex", ["plugin", "marketplace", "add", marketplaceRoot], {
    cwd: repoRoot,
    env,
    encoding: "utf8",
  });

  execFileSync("codex", ["plugin", "add", "english-learning-harness@phase1-scaffold"], {
    cwd: repoRoot,
    env,
    encoding: "utf8",
  });

  const listOutput = execFileSync("codex", ["plugin", "list"], {
    cwd: repoRoot,
    env,
    encoding: "utf8",
  });

  assert(
    listOutput.includes("english-learning-harness@phase1-scaffold") &&
      listOutput.includes("installed, enabled"),
    "isolated local marketplace install was not listed as installed",
  );
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });
  mkdirSync(tmpRoot, { recursive: true });

  validateManifest();
  validateSkillSkeletons();
  validateNativeHookInstaller();
  validateHookScript();
  validateProgressSchema();
  validateInstallPath();

  console.log(
    JSON.stringify(
      {
        status: "pass",
        requiredFiles,
        learnerRoot,
        hooksTarget,
        marketplaceRoot,
        codexHome,
      },
      null,
      2,
    ),
  );
}

main();
