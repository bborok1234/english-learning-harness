#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const englishHook = resolve(repoRoot, "hooks/english-learning-hook.mjs");

function decodeHooks(encoded) {
  if (!encoded) return [];
  return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
}

function runCommand(command, stdin) {
  const output = execFileSync("/bin/sh", ["-lc", command], {
    cwd: repoRoot,
    input: stdin,
    encoding: "utf8",
    env: process.env,
    stdio: ["pipe", "pipe", "pipe"],
  }).trim();

  if (!output) return {};
  return JSON.parse(output);
}

function mergeOutputs(outputs) {
  const merged = {};
  const contexts = [];

  for (const output of outputs) {
    if (!output || typeof output !== "object") continue;

    if (output.decision) merged.decision = output.decision;
    if (output.reason) merged.reason = output.reason;

    const hookOutput = output.hookSpecificOutput;
    if (hookOutput?.additionalContext) {
      contexts.push(hookOutput.additionalContext);
    }
  }

  if (contexts.length) {
    merged.hookSpecificOutput = {
      ...(merged.hookSpecificOutput ?? {}),
      additionalContext: contexts.join("\n\n"),
    };
  }

  return merged;
}

function main() {
  const event = process.argv[2] ?? "Unknown";
  const originalHooks = decodeHooks(process.argv[3]);
  const input = process.stdin.isTTY ? "" : readFileSync(0, "utf8");

  const outputs = [];
  outputs.push(runCommand(`node "${englishHook}" ${event}`, input));

  for (const hook of originalHooks) {
    if (hook?.type === "command" && hook.command) {
      outputs.push(runCommand(hook.command, input));
    }
  }

  process.stdout.write(`${JSON.stringify(mergeOutputs(outputs))}\n`);
}

try {
  main();
} catch (error) {
  process.stdout.write(
    `${JSON.stringify({
      decision: "approve",
      hookSpecificOutput: {
        additionalContext: `English Learning Harness hook chain failed visibly: ${error.message}`,
      },
    })}\n`,
  );
}
