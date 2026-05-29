#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validateInteractionEvent } from "./lib/english-learning-store.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/phase-4-text-event-persistence");
const learnerRoot = resolve(tmpRoot, "learner");
const require = createRequire(import.meta.url);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function runJson(args) {
  const output = execFileSync("node", args, {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return JSON.parse(output);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertNoUnsupportedClaims(value) {
  const text = JSON.stringify(value).toLowerCase();
  for (const claim of ["native speaker", "guaranteed", "fluent", "your level", "pronunciation score"]) {
    assert(!text.includes(claim), `unsupported claim appeared: ${claim}`);
  }
}

async function loadChromium() {
  try {
    return (await import("playwright")).chromium;
  } catch {
    const bundledPlaywright = resolve(
      homedir(),
      ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright",
    );
    if (existsSync(bundledPlaywright)) {
      return require(bundledPlaywright).chromium;
    }
    throw new Error("Playwright is required for text event persistence smoke");
  }
}

async function renderedText(homeUrl) {
  const chromium = await loadChromium();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(homeUrl);
  const text = await page.evaluate(() => document.body.innerText);
  await browser.close();
  return text;
}

async function main() {
  rmSync(tmpRoot, { recursive: true, force: true });

  runJson([
    "scripts/english-learning-harness.mjs",
    "setup",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  const first = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--scenario",
    "stuck-repair",
    "--say",
    "I don't know how to say it, but the meeting was okay.",
    "--json",
  ]);
  const second = runJson([
    "scripts/english-learning-harness.mjs",
    "today",
    "--learner-root",
    learnerRoot,
    "--scenario",
    "coffee-small-talk",
    "--say",
    "Coffee helps me start work.",
    "--json",
  ]);

  for (const artifactPath of [first.artifactPath, second.artifactPath]) {
    const artifact = readJson(artifactPath);
    assert(artifact.interaction_events.length === 1, "artifact should contain one text event");
    validateInteractionEvent(artifact.interaction_events[0], artifactPath);
  }

  const weekly = runJson([
    "scripts/english-learning-harness.mjs",
    "weekly",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  const summary = weekly.mirror.interaction_event_summary;
  assert(summary.event_count === 2, "weekly mirror should summarize two interaction events");
  assert(summary.modalities.includes("text"), "weekly mirror missing text modality");
  assert(summary.transfer_targets.length >= 2, "weekly mirror missing transfer targets");
  assert(summary.trouble_sources.length >= 1, "weekly mirror missing trouble sources");
  assertNoUnsupportedClaims(weekly.mirror);

  const persisted = readJson(weekly.mirrorPath);
  assert(persisted.interaction_event_summary.event_count === 2, "persisted weekly event summary mismatch");

  const home = runJson([
    "scripts/english-learning-harness.mjs",
    "home",
    "--learner-root",
    learnerRoot,
    "--json",
  ]);
  const text = await renderedText(home.homeUrl);
  assert(text.includes("Interaction evidence"), "learner home missing interaction evidence section");
  assert(text.includes("Transfer targets"), "learner home missing transfer targets");
  assert(text.includes("text"), "learner home missing text modality");
  assertNoUnsupportedClaims(text);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        learnerRoot,
        eventCount: summary.event_count,
        modalities: summary.modalities,
        transferTargets: summary.transfer_targets,
        homePath: home.homePath,
      },
      null,
      2,
    ),
  );
}

main();
