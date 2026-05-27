#!/usr/bin/env node
import { cpSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv) {
  const options = {
    target: resolve(repoRoot, "tmp/english-learning-marketplace"),
    marketplaceName: "english-learning-local",
    displayName: "English Learning Local",
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--target") {
      options.target = resolve(argv[index + 1]);
      index += 1;
    } else if (arg === "--marketplace-name") {
      options.marketplaceName = argv[index + 1];
      index += 1;
    } else if (arg === "--display-name") {
      options.displayName = argv[index + 1];
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return options;
}

export function packageLocalMarketplace(options = {}) {
  const target = resolve(options.target || resolve(repoRoot, "tmp/english-learning-marketplace"));
  const marketplaceName = options.marketplaceName || "english-learning-local";
  const displayName = options.displayName || "English Learning Local";
  const pluginRoot = resolve(target, "plugins/english-learning-harness");

  rmSync(pluginRoot, { recursive: true, force: true });
  mkdirSync(resolve(target, ".agents/plugins"), { recursive: true });

  for (const item of [".codex-plugin", "skills", "hooks", "scripts"]) {
    cpSync(resolve(repoRoot, item), resolve(pluginRoot, item), {
      recursive: true,
      dereference: true,
    });
  }

  writeFileSync(
    resolve(target, ".agents/plugins/marketplace.json"),
    `${JSON.stringify(
      {
        name: marketplaceName,
        interface: {
          displayName,
        },
        plugins: [
          {
            name: "english-learning-harness",
            source: {
              source: "local",
              path: "./plugins/english-learning-harness",
            },
            policy: {
              installation: "AVAILABLE",
              authentication: "ON_INSTALL",
            },
            category: "Education",
          },
        ],
      },
      null,
      2,
    )}\n`,
  );

  return {
    status: "pass",
    marketplaceRoot: target,
    pluginRoot,
    marketplaceManifest: resolve(target, ".agents/plugins/marketplace.json"),
    installCommands: [
      `codex plugin marketplace add "${target}"`,
      `codex plugin add english-learning-harness@${marketplaceName}`,
    ],
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    console.log(JSON.stringify(packageLocalMarketplace(parseArgs(process.argv)), null, 2));
  } catch (error) {
    console.error(JSON.stringify({ status: "fail", error: error.message }, null, 2));
    process.exit(1);
  }
}
