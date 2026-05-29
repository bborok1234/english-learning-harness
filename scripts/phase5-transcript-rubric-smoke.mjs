#!/usr/bin/env node
import { evaluateTranscriptReview } from "./lib/transcript-review-rubric.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertViolation(input, code) {
  const result = evaluateTranscriptReview(input);
  assert(result.status === "fail", `${code}: negative fixture should fail`);
  assert(
    result.violations.some((violation) => violation.code === code),
    `${code}: expected violation not found in ${JSON.stringify(result.violations)}`,
  );
}

function assertNoUnsupportedClaims(value) {
  const text = JSON.stringify(value).toLowerCase();
  for (const claim of [
    "native speaker",
    "you are fluent",
    "certified fluent",
    "guaranteed improvement",
    "your level is",
    "real-world speaking ability proved",
  ]) {
    assert(!text.includes(claim), `unsupported rubric claim appeared: ${claim}`);
  }
}

const promptSet = ["warm_start", "clarification", "reuse", "image_info_gap", "reflection"];

const positiveFixture = {
  saved_phrases: ["I don't know how to say it, but", "Could you repeat that?"],
  baseline: {
    prompt_set: promptSet,
    comfort_rating: 2,
    transcript: [
      "Today coffee.",
      "This part is hard.",
      "It is hard.",
      "Cup there.",
      "I feel nervous.",
    ],
  },
  final: {
    prompt_set: promptSet,
    comfort_rating: 3,
    transcript: [
      "Today I made coffee before work and I can explain a little more.",
      "Could you repeat that? I want to check the price again.",
      "I don't know how to say it, but the meeting was busy.",
      "The cup is near the counter, and I mean the small cup beside the wallet.",
      "I feel nervous, but I can keep going slowly.",
    ],
  },
};

function main() {
  const result = evaluateTranscriptReview(positiveFixture);
  assert(result.status === "pass", `positive fixture failed: ${JSON.stringify(result.violations)}`);
  assert(result.decision === "continue", `positive fixture decision mismatch: ${result.decision}`);
  assert(result.metrics.deltas.word_count_delta > 0, "word count should increase");
  assert(result.metrics.deltas.clarification_delta > 0, "clarification marker should increase");
  assert(result.metrics.deltas.repair_delta > 0, "repair marker should increase");
  assert(result.metrics.deltas.reused_phrase_delta > 0, "phrase reuse should increase");
  assert(result.metrics.deltas.comfort_delta >= 0, "comfort should be stable or improved");
  assert(result.pass_signals.length >= 3, "positive fixture should produce at least three pass signals");
  assertNoUnsupportedClaims(result);

  assertViolation(
    {
      ...positiveFixture,
      reviewer_summary: "The learner is now a native speaker with guaranteed improvement.",
    },
    "unsupported_claim",
  );

  assertViolation(
    {
      ...positiveFixture,
      final: {
        ...positiveFixture.final,
        prompt_set: ["warm_start", "reuse"],
      },
    },
    "prompt_set_mismatch",
  );

  assertViolation(
    {
      final: positiveFixture.final,
    },
    "missing_sample",
  );

  console.log(
    JSON.stringify(
      {
        status: "pass",
        decision: result.decision,
        passSignals: result.pass_signals,
        deltas: result.metrics.deltas,
        negativeViolations: ["unsupported_claim", "prompt_set_mismatch", "missing_sample"],
      },
      null,
      2,
    ),
  );
}

main();
