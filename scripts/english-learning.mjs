#!/usr/bin/env node
import { readFileSync } from "node:fs";
import {
  buildAdditionalContext,
  buildSession,
  defaultLearnerRoot,
  ensureLearnerStore,
  persistSession,
  readProgress,
  readProfile,
  writeProfile,
} from "./lib/english-learning-store.mjs";
import { chooseScenario } from "./lib/scenario-engine.mjs";

function parseArgs(argv) {
  const command = argv[2] || "help";
  const options = { input: [] };

  for (let index = 3; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--learner-root") {
      options.learnerRoot = argv[index + 1];
      index += 1;
    } else if (arg === "--name") {
      options.preferredName = argv[index + 1];
      index += 1;
    } else if (arg === "--motivation") {
      options.motivation = argv[index + 1];
      index += 1;
    } else if (arg === "--correction-style") {
      options.correctionStyle = argv[index + 1];
      index += 1;
    } else if (arg === "--familiar-topics") {
      options.familiarTopics = argv[index + 1];
      index += 1;
    } else if (arg === "--topics-to-avoid") {
      options.topicsToAvoid = argv[index + 1];
      index += 1;
    } else if (arg === "--input") {
      options.input.push(argv[index + 1] ?? "");
      index += 1;
    } else if (arg === "--transcript") {
      options.transcript = argv[index + 1];
      index += 1;
    } else if (arg === "--scenario") {
      options.scenario = argv[index + 1];
      index += 1;
    } else if (arg === "--json") {
      options.json = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.learnerRoot ||= defaultLearnerRoot();
  return { command, options };
}

function output(result, json = false) {
  if (json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (typeof result === "string") {
    console.log(result);
    return;
  }

  console.log(JSON.stringify(result, null, 2));
}

function transcriptInputs(options) {
  const inputs = [...options.input].filter(Boolean);
  if (options.transcript) {
    const transcript = readFileSync(options.transcript, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    inputs.push(...transcript);
  }
  if (!inputs.length) {
    inputs.push("I like coffee.", "Today morning coffee.");
  }
  return inputs;
}

function run() {
  const { command, options } = parseArgs(process.argv);

  if (command === "help") {
    output(
      [
        "Usage:",
        "  node scripts/english-learning.mjs init [--learner-root DIR] [--name NAME] [--motivation TEXT]",
        "  node scripts/english-learning.mjs session [--learner-root DIR] [--input TEXT ...] [--transcript FILE] [--scenario ID] [--json]",
        "  node scripts/english-learning.mjs context [--learner-root DIR]",
        "  node scripts/english-learning.mjs status [--learner-root DIR] [--json]",
      ].join("\n"),
    );
    return;
  }

  if (command === "init") {
    const profilePath = writeProfile(options.learnerRoot, options);
    output({
      status: "pass",
      learnerRoot: options.learnerRoot,
      profilePath,
    }, options.json);
    return;
  }

  if (command === "session") {
    const paths = ensureLearnerStore(options.learnerRoot);
    const session = buildSession(transcriptInputs(options), {
      scenario: chooseScenario({
        profileText: readProfile(paths.profile),
        preferredId: options.scenario,
      }),
    });
    const persisted = persistSession(options.learnerRoot, session);
    output({
      status: "pass",
      learnerRoot: persisted.learnerRoot,
      sessionId: session.id,
      mode: session.mode,
      scenario: session.scenario,
      sessionMetrics: session.session_metrics,
      mirror: session.mirror,
      journalPath: persisted.journalPath,
      artifactPath: persisted.artifactPath,
      relativeArtifactPath: persisted.relativeArtifactPath,
    }, options.json);
    return;
  }

  if (command === "context") {
    output(buildAdditionalContext(options.learnerRoot));
    return;
  }

  if (command === "status") {
    const paths = ensureLearnerStore(options.learnerRoot);
    output({
      status: "pass",
      learnerRoot: paths.root,
      profile: readProfile(paths.profile),
      progress: readProgress(paths.progress),
    }, options.json);
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

try {
  run();
} catch (error) {
  console.error(JSON.stringify({ status: "fail", error: error.message }, null, 2));
  process.exit(1);
}
