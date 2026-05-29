#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readText(path) {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

function includesAll(text, tokens, label) {
  const missing = tokens.filter((token) => !text.includes(token));
  assert(missing.length === 0, `${label} missing: ${missing.join(", ")}`);
}

function main() {
  const researchPath = "docs/RESEARCH-BASIS.md";
  assert(existsSync(resolve(repoRoot, researchPath)), `${researchPath} missing`);

  const research = readText(researchPath);
  const readmeKo = readText("README.md");
  const readmeEn = readText("README.en.md");
  const learningEngine = readText("docs/LEARNING-ENGINE.md");

  includesAll(
    research,
    [
      "Claim Boundary",
      "Evidence Map",
      "Speaking Skill OS",
      "Output Before Explanation",
      "Repair Is A Skill",
      "Feedback Must Preserve Conversation",
      "Practice Must Return",
      "Scenarios Need Transfer Evidence",
    ],
    "research basis sections",
  );

  includesAll(
    research,
    [
      "https://www.coe.int/en/web/education/-/common-european-framework-of-reference-for-languages-learning-teaching-assessment-14",
      "https://www.coe.int/en/web/common-european-framework-reference-languages/online-interaction",
      "https://academic.oup.com/applij/article/16/3/371/184113",
      "https://www.cambridge.org/core/journals/language-teaching/article/interaction-and-instructed-second-language-acquisition/78A156EE200F744F5978F99BFB073DBE",
      "https://www.cambridge.org/core/journals/studies-in-second-language-acquisition/article/abs/corrective-feedback-and-learner-uptake/59229F0CA2F085F5F5016FB4674877BF",
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC9995700/",
      "https://pubmed.ncbi.nlm.nih.gov/16507066/",
      "https://journals.sagepub.com/doi/10.1177/136216880000400302",
      "https://www.wgtn.ac.nz/lals/resources/paul-nations-resources/paul-nations-publications/publications/documents/2007-Four-strands.pdf",
    ],
    "research basis source URLs",
  );

  includesAll(
    readmeKo,
    [
      "## 학습 방식의 근거",
      "docs/RESEARCH-BASIS.md",
      "output practice",
      "interaction repair",
      "corrective feedback",
      "retrieval practice",
      "task-based conversation",
      "장기 회화 능력 향상 claim은 실제 multi-day learner pilot 전까지 보류",
    ],
    "Korean README research basis",
  );

  includesAll(
    readmeEn,
    ["## Learning Basis", "docs/RESEARCH-BASIS.md", "source-to-feature map", "claim boundaries"],
    "English README research basis",
  );

  includesAll(
    learningEngine,
    [
      "docs/RESEARCH-BASIS.md",
      "### Speaking Skill OS",
      "Merrill Swain",
      "Alison Mackey",
      "Roy Lyster",
    ],
    "learning engine research basis",
  );

  for (const forbidden of ["guarantees fluency", "proves real-world transfer"]) {
    assert(!research.toLowerCase().includes(forbidden), `unsupported claim present: ${forbidden}`);
  }

  console.log(
    JSON.stringify(
      {
        status: "pass",
        issue: "M8-4",
        researchPath,
        checkedSources: 9,
        claimBoundary:
          "Research sources justify design principles, while real learner outcome claims remain blocked until pilot evidence.",
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
        issue: "M8-4",
        error: error.message,
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
}
