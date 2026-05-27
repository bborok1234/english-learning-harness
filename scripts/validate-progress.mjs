#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const mvpSessionMetricKeys = [
  "attendance",
  "english_word_ratio",
  "new_vocabulary_count",
  "utterance_word_count",
  "voluntary_speaking_seconds",
];

export function validateProgress(progress, source = "progress.json") {
  const errors = [];

  if (!progress || typeof progress !== "object" || Array.isArray(progress)) {
    return [`${source}: root must be an object`];
  }

  if (progress.version !== 2) {
    errors.push(`${source}: version must be 2`);
  }

  const metrics = progress.mvp_session_metrics;
  if (!metrics || typeof metrics !== "object" || Array.isArray(metrics)) {
    errors.push(`${source}: mvp_session_metrics must be an object`);
  } else {
    const actualKeys = Object.keys(metrics).sort();
    const expectedKeys = [...mvpSessionMetricKeys].sort();
    const missing = expectedKeys.filter((key) => !actualKeys.includes(key));
    const extra = actualKeys.filter((key) => !expectedKeys.includes(key));

    if (missing.length) {
      errors.push(`${source}: missing MVP metric keys: ${missing.join(", ")}`);
    }

    if (extra.length) {
      errors.push(`${source}: unexpected per-session metric keys: ${extra.join(", ")}`);
    }

    for (const key of expectedKeys) {
      if (typeof metrics[key] !== "number" || Number.isNaN(metrics[key])) {
        errors.push(`${source}: ${key} must be a number`);
      }
    }
  }

  if (
    !progress.monthly_optional_metrics ||
    typeof progress.monthly_optional_metrics !== "object" ||
    Array.isArray(progress.monthly_optional_metrics)
  ) {
    errors.push(`${source}: monthly_optional_metrics must be an object`);
  }

  return errors;
}

function runCli() {
  const target = process.argv[2];
  if (!target) {
    console.error("Usage: node scripts/validate-progress.mjs <progress.json>");
    process.exit(2);
  }

  const progressPath = resolve(target);
  const progress = JSON.parse(readFileSync(progressPath, "utf8"));
  const errors = validateProgress(progress, progressPath);

  if (errors.length) {
    console.error(JSON.stringify({ status: "fail", errors }, null, 2));
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        status: "pass",
        path: progressPath,
        version: progress.version,
        mvp_session_metrics: mvpSessionMetricKeys,
      },
      null,
      2,
    ),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
