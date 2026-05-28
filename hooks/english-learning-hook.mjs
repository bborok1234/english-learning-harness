#!/usr/bin/env node
import { readFileSync } from "node:fs";
import {
  buildAdditionalContext,
  defaultLearnerRoot,
  ensureLearnerStore,
  readProgress,
  writeProgress,
} from "../scripts/lib/english-learning-store.mjs";

const event = process.argv[2] ?? "Unknown";
const learnerRoot = defaultLearnerRoot();

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

function writeHookOutput(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

function handleSessionStart() {
  ensureLearnerStore(learnerRoot);
  writeHookOutput({
    hookSpecificOutput: {
      additionalContext: buildAdditionalContext(learnerRoot),
    },
  });
}

function handlePreCompact() {
  ensureLearnerStore(learnerRoot);
  writeHookOutput({
    hookSpecificOutput: {
      additionalContext: buildAdditionalContext(learnerRoot),
    },
  });
}

function handlePreToolUse(rawInput) {
  ensureLearnerStore(learnerRoot);
  const input = rawInput ? JSON.parse(rawInput) : {};
  const toolName = input.tool_name ?? input.toolName ?? "";
  const requestedVoice = /voice|audio|realtime/i.test(JSON.stringify(input));

  if (requestedVoice) {
    writeHookOutput({
      decision: "approve",
      hookSpecificOutput: {
        additionalContext:
          `English Learning Harness note: ${toolName || "tool"} appears voice/audio related. ` +
          "Realtime voice is not an MVP-default path; prefer text/transcription-first unless a stable voice path was explicitly selected.",
      },
    });
    return;
  }

  writeHookOutput({ decision: "approve" });
}

function handleStop() {
  const paths = ensureLearnerStore(learnerRoot);
  const progress = readProgress(paths.progress);
  progress.last_stop_at = new Date().toISOString();
  progress.last_stop_contract = "marker-only";
  writeProgress(paths.progress, progress);
  writeHookOutput({
    hookSpecificOutput: {
      additionalContext:
        `English Learning Harness saved a Stop marker under ${learnerRoot}. ` +
        "Session finalization belongs to the explicit command-wrapper `today` path.",
      finalizesSession: false,
      supportedFinalizationPath: "node scripts/english-learning-harness.mjs today",
      claimBoundary:
        "Stop hook records a marker and context only; it does not create or finalize session artifacts.",
    },
  });
}

try {
  const rawInput = readStdin();
  if (event === "SessionStart") handleSessionStart();
  else if (event === "UserPromptSubmit") handleSessionStart();
  else if (event === "PreCompact") handlePreCompact();
  else if (event === "PreToolUse") handlePreToolUse(rawInput);
  else if (event === "Stop") handleStop();
  else writeHookOutput({ decision: "approve" });
} catch (error) {
  writeHookOutput({
    decision: "approve",
    hookSpecificOutput: {
      additionalContext: `English Learning Harness hook failed visibly: ${error.message}`,
    },
  });
}
