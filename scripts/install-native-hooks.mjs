#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const hookScript = resolve(repoRoot, "hooks/english-learning-hook.mjs");
const hookChainRunner = resolve(repoRoot, "hooks/hook-chain-runner.mjs");

const managedEvents = ["SessionStart", "UserPromptSubmit", "PreToolUse", "Stop", "PreCompact"];

const hookConfig = {
  hooks: {
    SessionStart: [
      {
        matcher: "startup|resume|clear",
        hooks: [
          {
            type: "command",
            command: `node "${hookScript}" SessionStart`,
          },
        ],
      },
    ],
    PreToolUse: [
      {
        hooks: [
          {
            type: "command",
            command: `node "${hookScript}" PreToolUse`,
          },
        ],
      },
    ],
    UserPromptSubmit: [
      {
        hooks: [
          {
            type: "command",
            command: `node "${hookScript}" UserPromptSubmit`,
          },
        ],
      },
    ],
    Stop: [
      {
        hooks: [
          {
            type: "command",
            command: `node "${hookScript}" Stop`,
            timeout: 30,
          },
        ],
      },
    ],
    PreCompact: [
      {
        hooks: [
          {
            type: "command",
            command: `node "${hookScript}" PreCompact`,
          },
        ],
      },
    ],
  },
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    mode: "print",
    target: resolve(homedir(), ".codex/hooks.json"),
    backup: true,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--print") options.mode = "print";
    else if (arg === "--install") options.mode = "install";
    else if (arg === "--uninstall") options.mode = "uninstall";
    else if (arg === "--target") {
      options.target = args[index + 1] ?? "";
      index += 1;
    } else if (arg === "--no-backup") {
      options.backup = false;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

function readConfig(targetPath) {
  if (!existsSync(targetPath)) return { hooks: {} };
  const parsed = JSON.parse(readFileSync(targetPath, "utf8"));
  parsed.hooks ||= {};
  return parsed;
}

function isManagedHook(hook) {
  return (
    typeof hook?.command === "string" &&
    (hook.command.includes("english-learning-hook.mjs") ||
      hook.command.includes("hook-chain-runner.mjs"))
  );
}

function decodeOriginalHooks(command) {
  const match = command.match(/hook-chain-runner\.mjs" (\S+) ([A-Za-z0-9_-]+)/);
  if (!match) return [];
  return JSON.parse(Buffer.from(match[2], "base64url").toString("utf8"));
}

function stripManaged(config) {
  const next = structuredClone(config);
  next.hooks ||= {};

  for (const event of managedEvents) {
    next.hooks[event] = (next.hooks[event] ?? [])
      .map((entry) => {
        const restoredHooks = [];
        for (const hook of entry.hooks ?? []) {
          if (typeof hook?.command === "string" && hook.command.includes("hook-chain-runner.mjs")) {
            restoredHooks.push(...decodeOriginalHooks(hook.command));
          } else if (!isManagedHook(hook)) {
            restoredHooks.push(hook);
          }
        }

        return {
          ...entry,
          hooks: restoredHooks,
        };
      })
      .filter((entry) => (entry.hooks ?? []).length > 0);

    if (next.hooks[event].length === 0) {
      delete next.hooks[event];
    }
  }

  return next;
}

function encodedHooks(hooks) {
  return Buffer.from(JSON.stringify(hooks), "utf8").toString("base64url");
}

function chainHook(event, originalHooks) {
  const encoded = encodedHooks(originalHooks ?? []);
  const hook = {
    type: "command",
    command: `node "${hookChainRunner}" ${event} ${encoded}`,
  };

  if (event === "Stop") hook.timeout = 30;
  return hook;
}

function mergeConfig(existing) {
  const next = stripManaged(existing);
  next.hooks ||= {};

  for (const event of managedEvents) {
    next.hooks[event] ||= [];
    for (const managedEntry of hookConfig.hooks[event]) {
      const targetEntry = next.hooks[event].find(
        (entry) => (entry.matcher ?? "") === (managedEntry.matcher ?? ""),
      );

      if (targetEntry) {
        targetEntry.hooks = [chainHook(event, targetEntry.hooks ?? [])];
      } else {
        next.hooks[event].push({
          ...managedEntry,
          hooks: [chainHook(event, [])],
        });
      }
    }
  }

  return next;
}

function writeConfig(targetPath, config, backup) {
  mkdirSync(dirname(targetPath), { recursive: true });

  let backupPath = "";
  if (backup && existsSync(targetPath)) {
    backupPath = `${targetPath}.english-learning-backup-${new Date()
      .toISOString()
      .replaceAll(/[:.]/g, "-")}`;
    copyFileSync(targetPath, backupPath);
  }

  writeFileSync(targetPath, `${JSON.stringify(config, null, 2)}\n`);
  return backupPath;
}

function main() {
  const options = parseArgs();

  if (options.mode === "print") {
    console.log(JSON.stringify(hookConfig, null, 2));
    return;
  }

  const targetPath = resolve(options.target);
  const existing = readConfig(targetPath);

  if (options.mode === "install") {
    const backupPath = writeConfig(targetPath, mergeConfig(existing), options.backup);
    console.log(
      JSON.stringify(
        {
          status: "pass",
          action: "install",
          target: targetPath,
          backupPath,
          managedEvents,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (options.mode === "uninstall") {
    const backupPath = writeConfig(targetPath, stripManaged(existing), options.backup);
    console.log(
      JSON.stringify(
        {
          status: "pass",
          action: "uninstall",
          target: targetPath,
          backupPath,
          managedEvents,
        },
        null,
        2,
      ),
    );
    return;
  }

  throw new Error(`Unsupported mode: ${options.mode}`);
}

main();
