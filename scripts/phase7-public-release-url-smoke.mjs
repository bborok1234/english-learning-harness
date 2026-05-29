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
const smokeRoot = resolve(repoRoot, "tmp/phase-7-public-release-url", String(process.pid));
const handoffRoot = resolve(smokeRoot, "handoff-source");
const downloadRoot = resolve(smokeRoot, "download");
const extractRoot = resolve(smokeRoot, "extract");
const learnerRoot = resolve(smokeRoot, "learner");
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

function runJson(args, cwd = artifactPackageRoot) {
  return JSON.parse(
    run("node", args, {
      cwd,
      env: {
        ENGLISH_LEARNING_HOME: learnerRoot,
      },
    }),
  );
}

function accessStatus(url) {
  if (/^https:\/\//.test(url) && !/localhost|127\.0\.0\.1|\[::1\]/.test(url)) {
    return "public_url_candidate";
  }
  return "local_loopback_only";
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

  const handoff = preparePublicArtifactHandoff({ target: handoffRoot });
  let server;
  let artifactUrl = process.env.ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL || "";
  let checksumsUrl = process.env.ENGLISH_LEARNING_PUBLIC_SHA256SUMS_URL || "";

  if (!artifactUrl || !checksumsUrl) {
    const local = await serveHandoff(handoff);
    server = local.server;
    artifactUrl = artifactUrl || local.artifactUrl;
    checksumsUrl = checksumsUrl || local.checksumsUrl;
  }

  try {
    assert(/^https?:\/\//.test(artifactUrl), "artifact URL must be http(s)");
    assert(/^https?:\/\//.test(checksumsUrl), "SHA256SUMS URL must be http(s)");
    const hostedAccessStatus =
      accessStatus(artifactUrl) === "public_url_candidate" &&
      accessStatus(checksumsUrl) === "public_url_candidate"
        ? "public_url_candidate"
        : "local_loopback_only";

    const artifactBytes = await download(artifactUrl, downloadedArtifact);
    await download(checksumsUrl, downloadedChecksums);
    assert(existsSync(downloadedArtifact), "downloaded artifact missing");
    assert(existsSync(downloadedChecksums), "downloaded SHA256SUMS missing");

    const checksumText = readFileSync(downloadedChecksums, "utf8");
    assert(
      checksumText.includes("english-learning-harness-public.tar.gz"),
      "SHA256SUMS should reference the artifact filename",
    );
    run("shasum", ["-a", "256", "-c", "SHA256SUMS"], { cwd: downloadRoot });

    const listing = run("tar", ["-tzf", downloadedArtifact]);
    for (const forbidden of [".git", ".omx", "tmp/", "node_modules"]) {
      assert(!listing.includes(`english-learning-harness/${forbidden}`), `artifact includes forbidden path: ${forbidden}`);
    }
    for (const required of ["README.md", "docs/distribution-policy.json", "scripts/english-learning-harness.mjs"]) {
      assert(listing.includes(`english-learning-harness/${required}`), `artifact missing ${required}`);
    }

    run("tar", ["-xzf", downloadedArtifact, "-C", extractRoot]);
    const setup = runJson([
      "scripts/english-learning-harness.mjs",
      "setup",
      "--name",
      "Public URL Learner",
      "--motivation",
      "I want to verify the public artifact URL and start practice.",
      "--json",
    ]);
    assert(setup.status === "pass", "public release URL setup failed");

    const daily = runJson(["scripts/english-learning-harness.mjs", "daily", "--json"]);
    assert(daily.status === "pass", "public release URL daily failed");

    const today = runJson([
      "scripts/english-learning-harness.mjs",
      "today",
      "--say",
      "I verified the checksum and can practice from the public artifact.",
      "--json",
    ]);
    assert(today.status === "pass", "public release URL today failed");

    console.log(
      JSON.stringify(
        {
          status: "pass",
          issue: "M7-5",
          artifactUrl,
          checksumsUrl,
          hostedAccessStatus,
          artifactBytes,
          learnerRoot,
          sessionCount: 1,
          checksumVerified: true,
          canClosePublicDistribution: hostedAccessStatus === "public_url_candidate",
          claimBoundary:
            hostedAccessStatus === "public_url_candidate"
              ? "This proves the public artifact URL and checksum URL can start the local learning loop."
              : "This proves public release URL and checksum mechanics through local loopback only. It does not prove public hosting or public download.",
        },
        null,
        2,
      ),
    );
  } finally {
    if (server) {
      await new Promise((resolveServer) => server.close(resolveServer));
    }
  }
}

try {
  await main();
} catch (error) {
  console.error(
    JSON.stringify(
      {
        status: "fail",
        issue: "M7-5",
        error: error.message,
        claimBoundary:
          "A failing public release URL smoke means the checksum-aware public download-to-learning path is not ready.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
