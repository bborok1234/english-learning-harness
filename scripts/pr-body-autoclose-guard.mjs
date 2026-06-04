#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";

const defaultProtectedIssues = ["179"];
const autoCloseKeywordPattern = /\b(close[sd]?|fix(?:e[sd])?|resolve[sd]?)\b/i;

function parseArgs(argv) {
  const options = {
    protectedIssues: [...defaultProtectedIssues],
    files: [],
    text: "",
    json: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--issue") {
      options.protectedIssues.push(String(argv[index + 1] ?? "").replace(/^#/, ""));
      index += 1;
    } else if (arg === "--text") {
      options.text = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--json") {
      options.json = true;
    } else {
      options.files.push(arg);
    }
  }

  options.protectedIssues = [...new Set(options.protectedIssues.filter(Boolean))];
  return options;
}

function issuePattern(issueNumber) {
  return new RegExp(`(?:^|[^\\w/])(?:[\\w.-]+/[\\w.-]+)?#${issueNumber}(?=$|\\D)`);
}

function sentenceFragments(text) {
  return String(text)
    .split(/(?<=[.!?])\s+|\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function checkPrBody(text, protectedIssues = defaultProtectedIssues) {
  const violations = [];
  const fragments = sentenceFragments(text);

  for (const fragment of fragments) {
    if (!autoCloseKeywordPattern.test(fragment)) continue;
    for (const issueNumber of protectedIssues) {
      if (!issuePattern(issueNumber).test(fragment)) continue;
      violations.push({
        issue: Number(issueNumber),
        fragment,
        reason:
          "GitHub auto-close keywords can close protected blocker issues even in negated phrases.",
      });
    }
  }

  return {
    status: violations.length ? "fail" : "pass",
    protectedIssues: protectedIssues.map(Number),
    violations,
    claimBoundary:
      "This guard checks PR body wording for protected issue auto-close risk. It does not inspect GitHub merge state.",
  };
}

function readInputs(options) {
  const inputs = [];
  if (options.text) {
    inputs.push({ source: "--text", text: options.text });
  }
  for (const file of options.files) {
    if (!existsSync(file)) {
      throw new Error(`PR body file not found: ${file}`);
    }
    inputs.push({ source: file, text: readFileSync(file, "utf8") });
  }
  if (!inputs.length) {
    const template = ".github/PULL_REQUEST_TEMPLATE.md";
    if (existsSync(template)) {
      inputs.push({ source: template, text: readFileSync(template, "utf8") });
    }
  }
  return inputs;
}

function main() {
  const options = parseArgs(process.argv);
  const inputs = readInputs(options);
  const results = inputs.map((input) => ({
    source: input.source,
    ...checkPrBody(input.text, options.protectedIssues),
  }));
  const failed = results.some((result) => result.status === "fail");
  const output = {
    status: failed ? "fail" : "pass",
    results,
  };
  console.log(JSON.stringify(output, null, 2));
  if (failed) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    main();
  } catch (error) {
    console.error(JSON.stringify({ status: "fail", error: error.message }, null, 2));
    process.exitCode = 1;
  }
}
