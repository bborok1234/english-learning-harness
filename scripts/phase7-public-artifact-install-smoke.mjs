#!/usr/bin/env node
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { preparePublicArtifactHandoff } from "./prepare-public-artifact-handoff.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-7-public-artifact-install", String(process.pid));
const handoffRoot = resolve(smokeRoot, "handoff-source");
const downloadRoot = resolve(smokeRoot, "download");
const extractRoot = resolve(smokeRoot, "extract");
const marketplaceRoot = resolve(smokeRoot, "marketplace");
const codexHome = resolve(smokeRoot, "codex-home");
const downloadedArtifact = resolve(downloadRoot, "english-learning-harness-public.tar.gz");
const downloadedChecksums = resolve(downloadRoot, "SHA256SUMS");
const artifactPackageRoot = resolve(extractRoot, "english-learning-harness");

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

async function serveHandoff(handoff) {
  const routes = new Map([
    ["/releases/latest/download/english-learning-harness-public.tar.gz", resolve(handoff.handoffRoot, handoff.artifactName)],
    ["/releases/latest/download/SHA256SUMS", resolve(handoff.handoffRoot, "SHA256SUMS")],
  ]);

  const server = createServer((request, response) => {
    const target = routes.get(request.url ?? "");
    if (!target) {
      response.writeHead(404);
      response.end("not found");
      return;
    }
    response.writeHead(200, {
      "content-type": target.endsWith(".tar.gz") ? "application/gzip" : "text/plain",
    });
    createReadStream(target).pipe(response);
  });

  await new Promise((resolveServer) => server.listen(0, "127.0.0.1", resolveServer));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/releases/latest/download`;
  return {
    server,
    artifactUrl: `${baseUrl}/english-learning-harness-public.tar.gz`,
    checksumsUrl: `${baseUrl}/SHA256SUMS`,
  };
}

async function download(url, target) {
  const response = await fetch(url, { redirect: "follow" });
  assert(response.ok, `download failed: ${url} ${response.status} ${response.statusText}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert(bytes.length > 0, `downloaded file is empty: ${url}`);
  writeFileSync(target, bytes);
  return bytes.length;
}

async function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  mkdirSync(downloadRoot, { recursive: true });
  mkdirSync(extractRoot, { recursive: true });
  mkdirSync(codexHome, { recursive: true });

  const handoff = preparePublicArtifactHandoff({ target: handoffRoot });
  const local = await serveHandoff(handoff);

  try {
    const artifactBytes = await download(local.artifactUrl, downloadedArtifact);
    await download(local.checksumsUrl, downloadedChecksums);
    run("shasum", ["-a", "256", "-c", "SHA256SUMS"], { cwd: downloadRoot });

    run("tar", ["-xzf", downloadedArtifact, "-C", extractRoot]);
    assert(existsSync(resolve(artifactPackageRoot, "scripts/package-local-marketplace.mjs")), "extracted marketplace packager missing");

    const publicReadme = readFileSync(resolve(handoff.handoffRoot, "README.md"), "utf8");
    for (const required of [
      "codex plugin marketplace add",
      "codex plugin add english-learning-harness@phase7-public-artifact",
      "CODEX_HOME",
    ]) {
      assert(publicReadme.includes(required), `public artifact README missing install guidance: ${required}`);
    }

    const packaged = JSON.parse(
      run("node", [
        "scripts/package-local-marketplace.mjs",
        "--target",
        marketplaceRoot,
        "--marketplace-name",
        "phase7-public-artifact",
        "--display-name",
        "Phase 7 Public Artifact",
      ], {
        cwd: artifactPackageRoot,
      }),
    );
    assert(packaged.status === "pass", "marketplace packaging from public artifact failed");
    assert(existsSync(packaged.marketplaceManifest), "marketplace manifest missing");
    assert(existsSync(resolve(packaged.pluginRoot, ".codex-plugin/plugin.json")), "packaged plugin manifest missing");

    const env = { CODEX_HOME: codexHome };
    run("codex", ["plugin", "marketplace", "add", marketplaceRoot], {
      cwd: artifactPackageRoot,
      env,
    });
    run("codex", ["plugin", "add", "english-learning-harness@phase7-public-artifact"], {
      cwd: artifactPackageRoot,
      env,
    });
    const listOutput = run("codex", ["plugin", "list"], {
      cwd: artifactPackageRoot,
      env,
    });
    assert(listOutput.includes("english-learning-harness@phase7-public-artifact"), "installed plugin missing from list");
    assert(listOutput.includes("installed, enabled"), "installed plugin is not enabled");

    console.log(
      JSON.stringify(
        {
          status: "pass",
          issue: "M7-8",
          artifactUrl: local.artifactUrl,
          checksumsUrl: local.checksumsUrl,
          artifactBytes,
          checksumVerified: true,
          marketplaceRoot,
          codexHome,
          installedPlugin: "english-learning-harness@phase7-public-artifact",
          claimBoundary:
            "This proves plugin installation from a checksum-verified downloaded public artifact through local loopback only. It does not prove public hosting or public Git-backed plugin install.",
        },
        null,
        2,
      ),
    );
  } finally {
    await new Promise((resolveServer) => local.server.close(resolveServer));
  }
}

try {
  await main();
} catch (error) {
  console.error(
    JSON.stringify(
      {
        status: "fail",
        issue: "M7-8",
        error: error.message,
        claimBoundary:
          "A failing public artifact install smoke means plugin install from the downloadable artifact is not ready.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
