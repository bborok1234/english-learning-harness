#!/usr/bin/env node
import { createServer } from "node:http";
import { execFileSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { packagePublicArtifact } from "./package-public-artifact.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const smokeRoot = resolve(repoRoot, "tmp/phase-7-hosted-artifact", String(process.pid));
const distRoot = resolve(smokeRoot, "dist");
const downloadRoot = resolve(smokeRoot, "download");
const extractRoot = resolve(smokeRoot, "extract");
const learnerRoot = resolve(smokeRoot, "learner");
const downloadedArtifact = resolve(downloadRoot, "english-learning-harness-public.tar.gz");
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

async function serveLocalArtifact(artifactPath) {
  const server = createServer((request, response) => {
    if (request.url !== "/english-learning-harness-public.tar.gz") {
      response.writeHead(404);
      response.end("not found");
      return;
    }
    response.writeHead(200, {
      "content-type": "application/gzip",
    });
    createReadStream(artifactPath).pipe(response);
  });

  await new Promise((resolveServer) => server.listen(0, "127.0.0.1", resolveServer));
  const address = server.address();
  return {
    server,
    url: `http://127.0.0.1:${address.port}/english-learning-harness-public.tar.gz`,
  };
}

async function download(url, target) {
  const response = await fetch(url, {
    redirect: "follow",
  });
  assert(response.ok, `download failed: ${response.status} ${response.statusText}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  assert(bytes.length > 0, "downloaded artifact is empty");
  writeFileSync(target, bytes);
  return bytes.length;
}

async function main() {
  rmSync(smokeRoot, { recursive: true, force: true });
  mkdirSync(downloadRoot, { recursive: true });
  mkdirSync(extractRoot, { recursive: true });

  const packaged = packagePublicArtifact({ target: distRoot });
  assert(packaged.status === "pass", "public artifact packaging failed");

  let server;
  let url = process.env.ENGLISH_LEARNING_PUBLIC_ARTIFACT_URL || "";
  if (!url) {
    const local = await serveLocalArtifact(packaged.artifactPath);
    server = local.server;
    url = local.url;
  }

  try {
    assert(/^https?:\/\//.test(url), "artifact URL must be http(s)");
    const hostedAccessStatus = accessStatus(url);
    const downloadedBytes = await download(url, downloadedArtifact);
    assert(existsSync(downloadedArtifact), "downloaded artifact missing");

    const listing = run("tar", ["-tzf", downloadedArtifact]);
    for (const forbidden of [".git", ".omx", "tmp/", "node_modules"]) {
      assert(!listing.includes(`english-learning-harness/${forbidden}`), `downloaded artifact includes forbidden path: ${forbidden}`);
    }
    for (const required of ["README.md", "docs/distribution-policy.json", "scripts/english-learning-harness.mjs"]) {
      assert(listing.includes(`english-learning-harness/${required}`), `downloaded artifact missing ${required}`);
    }

    run("tar", ["-xzf", downloadedArtifact, "-C", extractRoot]);
    const policy = JSON.parse(readFileSync(resolve(artifactPackageRoot, "docs/distribution-policy.json"), "utf8"));

    const setup = runJson([
      "scripts/english-learning-harness.mjs",
      "setup",
      "--name",
      "Hosted Artifact Learner",
      "--motivation",
      "I want to start from a downloaded package.",
      "--json",
    ]);
    assert(setup.status === "pass", "hosted artifact setup failed");

    const today = runJson([
      "scripts/english-learning-harness.mjs",
      "today",
      "--say",
      "I can practice from a downloaded harness.",
      "--json",
    ]);
    assert(today.status === "pass", "hosted artifact today failed");
    assert(existsSync(today.artifactPath), "hosted artifact session missing");

    const daily = runJson(["scripts/english-learning-harness.mjs", "daily", "--json"]);
    assert(daily.status === "pass", "hosted artifact daily failed");

    const weekly = runJson(["scripts/english-learning-harness.mjs", "weekly", "--json"]);
    assert(weekly.status === "pass", "hosted artifact weekly failed");

    const home = runJson(["scripts/english-learning-harness.mjs", "home", "--json"]);
    assert(home.status === "pass", "hosted artifact home failed");

    const exported = runJson(["scripts/english-learning-harness.mjs", "export", "--json"]);
    assert(exported.status === "pass", "hosted artifact export failed");

    const progressValidation = JSON.parse(
      run("node", ["scripts/validate-progress.mjs", resolve(learnerRoot, "progress.json")], {
        cwd: artifactPackageRoot,
      }),
    );
    assert(progressValidation.status === "pass", "hosted artifact progress validation failed");

    console.log(
      JSON.stringify(
        {
          status: "pass",
          issue: "M7-1",
          artifactUrl: url,
          hostedAccessStatus,
          downloadedBytes,
          learnerRoot,
          sessionCount: exported.summary.session_count,
          publicReleaseStatus: policy.publicReleaseStatus,
          canClosePublicDistribution: hostedAccessStatus === "public_url_candidate",
          claimBoundary:
            hostedAccessStatus === "public_url_candidate"
              ? "This proves an unauthenticated hosted artifact URL can start the local learning loop."
              : "This proves hosted-download mechanics through local loopback only. It does not prove public hosting or public download.",
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
        issue: "M7-1",
        error: error.message,
        claimBoundary:
          "A failing hosted artifact smoke means the download-to-learning path is not release-ready.",
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
