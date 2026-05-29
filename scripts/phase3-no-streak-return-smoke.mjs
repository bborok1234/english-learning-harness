#!/usr/bin/env node
import { readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildDailyCockpit,
  emptyMetrics,
  ensureLearnerStore,
  learnerPaths,
  readProgress,
  writeLearnerHome,
  writeProgress,
} from "./lib/english-learning-store.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const tmpRoot = resolve(repoRoot, "tmp/phase-3-no-streak-return");
const fixtureDate = new Date("2026-05-29T12:00:00.000Z");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSafeReturnCopy(value) {
  const text = JSON.stringify(value).toLowerCase();
  for (const phrase of [
    "lost your streak",
    "streak lost",
    "you failed",
    "failure",
    "you are behind",
    "lazy",
    "should have practiced",
    "guilt",
    "punish",
  ]) {
    assert(!text.includes(phrase), `unsafe return copy appeared: ${phrase}`);
  }
}

function setProgressCase(root, { lastSessionAt = "", sessionDate = "2026-05-29", sessionCount = 1 }) {
  const paths = ensureLearnerStore(root);
  const progress = readProgress(paths.progress);
  progress.mvp_session_metrics = emptyMetrics();
  progress.sessions = Array.from({ length: sessionCount }, (_, index) => ({
    id: `fixture-${index + 1}`,
    date: sessionDate,
    mode: "text-first",
    artifact: `artifacts/sessions/fixture-${index + 1}.json`,
    session_metrics: emptyMetrics(),
  }));
  if (lastSessionAt) {
    progress.last_session_at = lastSessionAt;
  } else {
    delete progress.last_session_at;
  }
  writeProgress(paths.progress, progress);
}

function assertCase({ name, lastSessionAt, sessionDate, sessionCount, expectedGap, expectedDays }) {
  const root = resolve(tmpRoot, name);
  setProgressCase(root, { lastSessionAt, sessionDate, sessionCount });
  const cockpit = buildDailyCockpit(root, fixtureDate);
  assert(cockpit.return_state.gap_kind === expectedGap, `${name}: gap kind mismatch`);
  assert(cockpit.return_state.days_since_last_session === expectedDays, `${name}: days mismatch`);
  assert(cockpit.return_state.restart_action, `${name}: restart action missing`);
  if (expectedGap !== "fresh") {
    assert(cockpit.return_state.message.includes("no streak penalty"), `${name}: no-streak copy missing`);
  }
  assertSafeReturnCopy(cockpit.return_state);
  return { root, cockpit };
}

function main() {
  rmSync(tmpRoot, { recursive: true, force: true });

  const fresh = assertCase({
    name: "fresh",
    sessionCount: 0,
    expectedGap: "fresh",
    expectedDays: null,
  });
  const sameDay = assertCase({
    name: "same-day",
    lastSessionAt: "2026-05-29T00:30:00.000Z",
    sessionDate: "2026-05-20",
    expectedGap: "same-day",
    expectedDays: 0,
  });
  const nextDay = assertCase({
    name: "next-day",
    lastSessionAt: "2026-05-28T12:00:00.000Z",
    sessionDate: "2026-05-29",
    expectedGap: "next-day",
    expectedDays: 1,
  });
  const longGap = assertCase({
    name: "long-gap",
    lastSessionAt: "2026-05-20T12:00:00.000Z",
    sessionDate: "2026-05-29",
    expectedGap: "long-gap",
    expectedDays: 9,
  });

  const home = writeLearnerHome(longGap.root, fixtureDate);
  const html = readFileSync(home.homePath, "utf8");
  assert(html.includes("Restart with one familiar topic"), "learner home missing long-gap restart action");
  assertSafeReturnCopy(html);

  console.log(
    JSON.stringify(
      {
        status: "pass",
        fixtureDate: fixtureDate.toISOString(),
        cases: {
          fresh: fresh.cockpit.return_state,
          sameDay: sameDay.cockpit.return_state,
          nextDay: nextDay.cockpit.return_state,
          longGap: longGap.cockpit.return_state,
        },
        homePath: home.homePath,
      },
      null,
      2,
    ),
  );
}

main();
