#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(path) {
  const absolutePath = resolve(repoRoot, path);
  assert(existsSync(absolutePath), `${path} missing`);
  return readFileSync(absolutePath, "utf8");
}

function countOccurrences(text, needle) {
  return text.split(needle).length - 1;
}

function assertIncludesAll(text, needles, label) {
  const missing = needles.filter((needle) => !text.includes(needle));
  assert(missing.length === 0, `${label} missing: ${missing.join(", ")}`);
}

function unsupportedClaimContext(text, claim) {
  const flags = claim.pattern.flags.includes("g") ? claim.pattern.flags : `${claim.pattern.flags}g`;
  const pattern = new RegExp(claim.pattern.source, flags);
  for (const match of text.matchAll(pattern)) {
    const start = Math.max(0, match.index - 48);
    const end = Math.min(text.length, match.index + match[0].length + 48);
    const context = text.slice(start, end);
    if (
      /(보장하지|주장하지|보류|검증해야|does not|do not|not .*claim|not .*prove|remain.*unclaimed)/i.test(context)
    ) {
      continue;
    }
    return context;
  }
  return "";
}

const learnerSurfaces = [
  {
    path: "README.md",
    text: readText("README.md"),
    required: [
      "한국인을 위한 Codex-native 영어 회화 학습 하네스.",
      "## 회화 능력에 도움이 되는 방식",
      "## 학습 방식의 근거",
      "docs/RESEARCH-BASIS.md",
      "output practice",
      "interaction repair",
      "corrective feedback",
      "retrieval practice",
      "task-based conversation",
      "장기 회화 능력 향상 claim은 실제 multi-day learner pilot 전까지 보류",
      "## 현재 한계",
    ],
  },
  {
    path: "README.en.md",
    text: readText("README.en.md"),
    required: [
      "Codex-native English conversation practice harness for Korean learners.",
      "## Learning Basis",
      "docs/RESEARCH-BASIS.md",
      "source-to-feature map",
      "claim boundaries",
      "Real learner improvement still needs real multi-day use, not only fixture smokes.",
    ],
  },
  {
    path: "docs/product/learner-cockpit-state.json",
    text: readText("docs/product/learner-cockpit-state.json"),
    required: [
      "\"audience\": \"한국인 영어 회화 학습자\"",
      "\"claimBoundary\"",
      "실제 회화 능력 향상이나 장기 학습 성과를 보장하지 않습니다.",
      "Speaking Skill OS",
      "7일 리포트",
    ],
  },
  {
    path: "docs/product/learner-cockpit.html",
    text: readText("docs/product/learner-cockpit.html"),
    required: [
      "오늘의 미션",
      "오늘의 말하기 행동",
      "7일 리포트",
      "실제 회화 능력 향상이나 장기 학습 성과를 보장하지 않습니다.",
    ],
  },
];

const forbiddenClaims = [
  {
    label: "guaranteed/proven fluency",
    pattern:
      /\b(guarantee(?:d|s)? fluency|guaranteed improvement|proves fluency|proven improvement|certif(?:y|ies|ied) fluency|real-world speaking ability (?:is )?proved)\b/i,
  },
  {
    label: "native speaker or certified level",
    pattern: /\b(native speaker|you are fluent|your level is|certified CEFR|official CEFR level)\b/i,
  },
  {
    label: "unsupported realtime voice efficacy",
    pattern: /\b(realtime voice (?:is )?(?:ready|supported|proves|improves|guarantees)|realtime voice efficacy (?:is )?proved)\b/i,
  },
  {
    label: "unsupported generated-media learning gain",
    pattern:
      /\b(generated media improves learning outcomes|generated worlds increase retention|Remotion artifacts improve retention|multimodal scenes prove speaking improvement)\b/i,
  },
  {
    label: "unsupported child mode readiness",
    pattern: /\b(child mode is ready|children mode is ready|kid mode is ready)\b/i,
  },
  {
    label: "Korean guaranteed/proven outcome",
    pattern:
      /(유창성|회화 능력|영어 실력|학습 효과|장기 학습 성과).{0,24}(보장|증명|입증|인증)|(보장|증명|입증).{0,24}(유창성|회화 능력|영어 실력|학습 효과|장기 학습 성과)/,
  },
  {
    label: "Korean native-like or level certification",
    pattern: /(원어민처럼|네이티브처럼|레벨을 인증|수준을 인증|CEFR 레벨 인증)/,
  },
  {
    label: "Korean unsupported realtime/generated-media claim",
    pattern: /(실시간 음성|생성형 미디어|생성된 세계|Remotion).{0,28}(학습 효과|회화 능력|기억|유창성).{0,16}(보장|증명|입증)/,
  },
];

function main() {
  for (const surface of learnerSurfaces) {
    assertIncludesAll(surface.text, surface.required, surface.path);
    for (const claim of forbiddenClaims) {
      const context = unsupportedClaimContext(surface.text, claim);
      assert(!context, `${surface.path} contains unsupported claim: ${claim.label}: ${context}`);
    }
  }

  const koreanReadme = learnerSurfaces.find((surface) => surface.path === "README.md").text;
  assert(
    countOccurrences(koreanReadme, "## 회화 능력에 도움이 되는 방식") === 1,
    "README should contain exactly one conversation-help heading",
  );

  const researchBasis = readText("docs/RESEARCH-BASIS.md");
  assertIncludesAll(
    researchBasis,
    [
      "Allowed product claim:",
      "The harness is designed around output practice, interaction repair, corrective feedback, retrieval, transfer practice, and task-based conversation.",
      "Blocked until real learner evidence:",
      "guaranteed fluency improvement",
      "long-term retention beyond the observed learner data",
    ],
    "research basis claim map",
  );

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "AIOS-27",
        checkedSurfaces: learnerSurfaces.map((surface) => surface.path),
        forbiddenClaimCount: forbiddenClaims.length,
        claimBoundary:
          "This guards learner-facing product/public claim language only. It does not prove real-world speaking improvement.",
      },
      null,
      2,
    ),
  );
}

try {
  main();
} catch (error) {
  console.error(
    JSON.stringify(
      {
        status: "fail",
        issue: "AIOS-27",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
