#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function argValue(flag, fallback) {
  const index = args.indexOf(flag);
  return index === -1 ? fallback : args[index + 1];
}

const jsonOutput = resolve(repoRoot, argValue("--json-output", "docs/ops/goal-audit.json"));
const htmlOutput = resolve(repoRoot, argValue("--html-output", "docs/ops/goal-audit.html"));
const realPilotIssueStateOverride = argValue("--real-pilot-issue-state", "");
const jsonMode = args.includes("--json");

function read(path) {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

function readJson(path) {
  return JSON.parse(read(path));
}

function fileExists(path) {
  return existsSync(resolve(repoRoot, path));
}

function fileIncludes(path, needles) {
  if (!fileExists(path)) return false;
  const text = read(path);
  return needles.every((needle) => text.includes(needle));
}

function evidence(paths, checks = []) {
  return {
    files: paths.map((path) => ({
      path,
      exists: fileExists(path),
    })),
    checks,
  };
}

function githubIssueState(issueNumber) {
  if (realPilotIssueStateOverride) {
    return {
      number: issueNumber,
      state: realPilotIssueStateOverride.toUpperCase(),
      source: "override",
    };
  }
  try {
    const issue = JSON.parse(
      execFileSync("gh", ["issue", "view", String(issueNumber), "--json", "number,state,url"], {
        cwd: repoRoot,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }),
    );
    return {
      number: issue.number,
      state: issue.state,
      url: issue.url,
      source: "github",
    };
  } catch {
    return {
      number: issueNumber,
      state: "UNKNOWN",
      source: "unavailable",
    };
  }
}

function requirement({
  id,
  title,
  stopCondition,
  status,
  evidenceSummary,
  files,
  checks,
  gap = "",
  boundary = "",
}) {
  return {
    id,
    title,
    stop_condition: stopCondition,
    status,
    evidence_summary: evidenceSummary,
    evidence: evidence(files, checks),
    gap,
    boundary,
  };
}

function buildAudit() {
  const opsState = readJson("docs/ops/project-state.json");
  const opsStateText = JSON.stringify(opsState);
  const issueIndexText = fileExists("docs/ISSUE-INDEX.md") ? read("docs/ISSUE-INDEX.md") : "";
  const openRealPilot =
    opsStateText.includes("#179") &&
    issueIndexText.includes("#179") &&
    (opsStateText.includes("real owner/self") || issueIndexText.includes("real owner/self")) &&
    !opsStateText.includes("real owner/self pilot complete");
  const realPilotIssue = githubIssueState(179);
  const realPilotBlockerStatus = !openRealPilot
    ? "missing_local_tracker"
    : realPilotIssue.state === "OPEN"
      ? "open"
      : realPilotIssue.state === "CLOSED"
        ? "closed_external_mismatch"
        : "unknown";
  const generatedAt = new Date().toISOString();

  const requirements = [
    requirement({
      id: "REQ-01-FIRST-RUN",
      title: "처음 온 사용자가 바로 학습을 시작할 수 있는가",
      stopCondition: "README/설치/첫 실행을 통해 바로 학습을 시작할 수 있다.",
      status: "verified_local_mechanics",
      evidenceSummary:
        "Korean-first README leads with a paste-into-Codex installation prompt, agent-installed skills, and learner-facing natural-language starts.",
      files: ["README.md", "setup", "skills/onboarding/SKILL.md", "scripts/phase7-agent-install-smoke.mjs"],
      checks: [
        {
          label: "README starts from Codex conversation",
          pass: fileIncludes("README.md", ["Codex에 붙여넣기", "Do not ask me to clone the repo or run Node commands manually"]),
        },
        {
          label: "Agent install smoke expects owner pilot skill",
          pass: fileIncludes("scripts/phase7-agent-install-smoke.mjs", ["english-learning-owner-pilot"]),
        },
      ],
      boundary: "This proves local/public onboarding mechanics, not real learner retention.",
    }),
    requirement({
      id: "REQ-02-DAILY-COCKPIT",
      title: "매일 학습 cockpit이 제품 표면으로 작동하는가",
      stopCondition: "매일 학습 cockpit이 실제 product surface로 작동한다.",
      status: "verified_local_mechanics",
      evidenceSummary:
        "Learner cockpit state/html exists separately from the engineering dashboard and is guarded by product-surface smoke.",
      files: [
        "docs/product/learner-cockpit-state.json",
        "docs/product/learner-cockpit.html",
        "scripts/daily-practice-start-card-smoke.mjs",
        "scripts/daily-practice-reply-routing-smoke.mjs",
        "scripts/product-surface-smoke.mjs",
        "scripts/personal-learner-cockpit-smoke.mjs",
      ],
      checks: [
        {
          label: "Learner cockpit is separated from ops board",
          pass: fileIncludes("scripts/product-surface-smoke.mjs", ["Learner cockpit is a product surface"]),
        },
        {
          label: "Daily practice has a learner-ready start card",
          pass: fileIncludes("scripts/daily-practice-start-card-smoke.mjs", [
            "learner-ready daily practice start card",
            "quickReplies",
          ]),
        },
        {
          label: "Daily practice quick replies route into persistence",
          pass: fileIncludes("scripts/daily-practice-reply-routing-smoke.mjs", [
            "practice-reply",
            "quickReplySaved",
          ]),
        },
      ],
      boundary: "Fixture/product smoke verifies surface mechanics, not daily real-world use.",
    }),
    requirement({
      id: "REQ-03-SPEAKING-SKILL-OS",
      title: "Speaking Skill OS가 약점/복습/미션/전이 증거를 연결하는가",
      stopCondition: "Speaking Skill OS가 개인 약점, 복습, 미션, 전이 증거를 연결한다.",
      status: "verified_local_mechanics",
      evidenceSummary:
        "Speaking backlog, diagnosis, adaptive ordering, transfer-test evidence, and seven-day fixture coverage are present.",
      files: [
        "scripts/phase8-speaking-skill-os-smoke.mjs",
        "scripts/phase8-speaking-skill-os-queue-smoke.mjs",
        "scripts/phase8-speaking-skill-os-seven-day-smoke.mjs",
        "docs/RESEARCH-BASIS.md",
      ],
      checks: [
        {
          label: "Speaking Skill OS smokes exist",
          pass:
            fileExists("scripts/phase8-speaking-skill-os-smoke.mjs") &&
            fileExists("scripts/phase8-speaking-skill-os-seven-day-smoke.mjs"),
        },
      ],
      boundary: "This proves fixture learning-loop mechanics, not generalized speaking improvement.",
    }),
    requirement({
      id: "REQ-04-NARRATIVE-MISSION",
      title: "Narrative mission이 말하기 행동을 요구하는가",
      stopCondition: "Narrative mission이 단순 롤플레잉이 아니라 말하기 행동을 요구한다.",
      status: "verified_local_mechanics",
      evidenceSummary:
        "M10 narrative contracts, validator, fallback gate, and transfer parity smokes guard against cosmetic roleplay.",
      files: [
        "docs/M10-NARRATIVE-MISSION-PRD.md",
        "docs/M10-NARRATIVE-MISSION-TEST-SPEC.md",
        "scripts/phase10-narrative-mission-gate-smoke.mjs",
      ],
      checks: [
        {
          label: "Narrative risk remains explicit",
          pass: JSON.stringify(opsState.project.blockedClaims ?? []).includes("narrative immersion improves fluency"),
        },
      ],
      boundary: "Narrative mechanics are local-gated; narrative immersion learning gains remain unclaimed.",
    }),
    requirement({
      id: "REQ-05-MULTIMODAL-GENERATED-ARTIFACTS",
      title: "멀티모달/생성형 artifact가 학습 루프에 연결되는가",
      stopCondition: "멀티모달/생성형 artifact가 피상적 장식이 아니라 학습 루프에 연결된다.",
      status: "verified_local_mechanics",
      evidenceSummary:
        "Text, transcript-backed voice, image information-gap, asset decks, generated scenes, and storyboards share evidence requirements and cockpit/report links.",
      files: [
        "scripts/phase4-multimodal-gate-smoke.mjs",
        "scripts/generated-daily-mission-smoke.mjs",
        "scripts/generated-scene-artifact-smoke.mjs",
        "scripts/adaptive-mission-asset-priority-smoke.mjs",
      ],
      checks: [
        {
          label: "Realtime voice remains blocked as a claim",
          pass: JSON.stringify(opsState.project.blockedClaims ?? []).includes("realtime voice adventure is supported"),
        },
      ],
      boundary: "Transcript-first voice and local image-info-gap mechanics are supported; realtime voice efficacy is not claimed.",
    }),
    requirement({
      id: "REQ-06-SEVEN-THIRTY-JOURNEY",
      title: "7일/30일 journey와 report가 생성되는가",
      stopCondition: "7일/30일 journey와 리포트가 생성된다.",
      status: "verified_local_mechanics",
      evidenceSummary:
        "Personal cockpit and learner report surfaces include 7-day/30-day windows from local learner evidence.",
      files: [
        "scripts/personal-learner-cockpit-smoke.mjs",
        "scripts/phase15-owner-pilot-journey-audit-smoke.mjs",
        "docs/product/learner-cockpit-state.json",
      ],
      checks: [
        {
          label: "Cockpit smoke checks 30-day modalities",
          pass: fileIncludes("scripts/personal-learner-cockpit-smoke.mjs", ["thirty_day", "modalities"]),
        },
      ],
      boundary: "Generated windows summarize local evidence; real multi-day owner pilot evidence is still missing.",
    }),
    requirement({
      id: "REQ-07-SURFACE-SEPARATION",
      title: "엔지니어링 dashboard와 제품 표면이 분리되는가",
      stopCondition: "엔지니어링 dashboard는 제품 표면과 분리된 채 진행/검증/의사결정을 추적한다.",
      status: "verified_local_mechanics",
      evidenceSummary:
        "Engineering dashboard is generated from ops state, while the learner cockpit is a separate product surface.",
      files: [
        "docs/ops/project-state.json",
        "docs/ops/engineering-dashboard.html",
        "docs/product/learner-cockpit.html",
        "scripts/ops-dashboard-smoke.mjs",
        "scripts/product-surface-smoke.mjs",
      ],
      checks: [
        {
          label: "Ops smoke requires learner cockpit link but separate surface",
          pass: fileIncludes("scripts/ops-dashboard-smoke.mjs", ["engineering/ops board", "docs/product/learner-cockpit.html"]),
        },
      ],
      boundary: "This verifies repo-local generated surfaces, not user comprehension in a real study.",
    }),
    requirement({
      id: "REQ-08-ADAPTIVE-GOVERNANCE",
      title: "필요하면 이슈를 만들고/죽이고/쪼개고/전환하는 governance가 작동하는가",
      stopCondition: "필요하면 이슈를 만들고, 죽이고, 쪼개고, 방향을 바꾸는 governance가 작동한다.",
      status: "verified_local_mechanics",
      evidenceSummary:
        "Adaptive execution plan, issue index, ops dashboard, and this goal audit make issue decisions and claim boundaries explicit.",
      files: [
        "docs/ADAPTIVE-EXECUTION-PLAN.md",
        "docs/ISSUE-INDEX.md",
        "docs/ops/project-state.json",
        "scripts/aios-goal-audit.mjs",
      ],
      checks: [
        {
          label: "Adaptive plan defines continue/split/pivot/kill/research",
          pass: fileIncludes("docs/ADAPTIVE-EXECUTION-PLAN.md", ["continue", "split", "pivot", "kill", "research"]),
        },
      ],
      boundary: "This proves governance mechanics and traceability; it does not replace product evidence.",
    }),
  ];

  const blockers = [
    {
      id: "BLOCK-REAL-PILOT-179",
      title: "실제 owner/self pilot transcript evidence is still missing",
      status: realPilotBlockerStatus,
      evidence: {
        local_tracker_present: openRealPilot,
        github_issue: realPilotIssue,
        summary:
          realPilotBlockerStatus === "open"
            ? "#179 is open and remains required until real owner/self transcript evidence exists."
            : "#179 tracker state is not open; reopen or restore the tracker before claiming governance is healthy.",
      },
      required_to_complete_goal:
        "At least one real Day 0 baseline, five daily sessions, final sample, friction notes, cockpit/report review, and a governance decision.",
    },
    {
      id: "BLOCK-UNSUPPORTED-LEARNING-CLAIMS",
      title: "Learning outcome claims remain intentionally blocked",
      status: "open",
      evidence: {
        blocked_claims: opsState.project.blockedClaims ?? [],
        product_claim_guard_present: fileExists("scripts/product-claim-guard-smoke.mjs"),
        product_claim_guard_evidence: fileExists("docs/phase-15-evidence/AIOS-27-product-claim-guard.md"),
        product_surfaces_checked: [
          "README.md",
          "README.en.md",
          "docs/product/learner-cockpit-state.json",
          "docs/product/learner-cockpit.html",
          "docs/RESEARCH-BASIS.md",
        ],
      },
      required_to_complete_goal:
        "Do not claim fluency, retention, realtime voice efficacy, or generated-media learning gains until real evidence supports the claim.",
    },
  ];

  const allLocalMechanicsVerified = requirements.every((item) => item.status === "verified_local_mechanics");
  const hasOpenBlockers = blockers.some((item) => item.status !== "resolved");

  return {
    schema_version: 1,
    generated_at: generatedAt,
    surface: "engineering-governance",
    objective:
      "Build the AI-Native English Learning Operating System on Codex for Korean learners with Speaking Skill OS, narrative missions, multimodal/generated artifacts, learner cockpit, journeys, reports, and adaptive governance.",
    overall_status: allLocalMechanicsVerified && !hasOpenBlockers ? "complete" : "not_complete",
    local_mechanics_status: allLocalMechanicsVerified ? "verified" : "incomplete",
    completion_blockers: blockers,
    requirements,
    next_decision:
      hasOpenBlockers
        ? "Continue the goal. Do not mark complete until real owner/self pilot evidence and blocked learning claims are resolved."
        : "Run a final completion audit before marking the goal complete.",
    claim_boundary:
      "This audit maps current repo evidence to the active goal. It is not learner outcome evidence and must not be used to claim real-world speaking improvement.",
  };
}

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

function writeHtml(audit) {
  const requirementRows = audit.requirements
    .map(
      (item) => `<article class="card ${escapeHtml(item.status)}">
      <div class="meta">${escapeHtml(item.id)} · ${escapeHtml(item.status)}</div>
      <h2>${escapeHtml(item.title)}</h2>
      <p class="stop">${escapeHtml(item.stop_condition)}</p>
      <p>${escapeHtml(item.evidence_summary)}</p>
      <ul>
        ${item.evidence.files
          .map((file) => `<li>${file.exists ? "OK" : "MISSING"} · ${escapeHtml(file.path)}</li>`)
          .join("")}
      </ul>
      ${item.boundary ? `<p class="boundary">${escapeHtml(item.boundary)}</p>` : ""}
    </article>`,
    )
    .join("");

  const blockerRows = audit.completion_blockers
    .map(
      (item) => `<article class="blocker">
      <div class="meta">${escapeHtml(item.id)} · ${escapeHtml(item.status)}</div>
      <h2>${escapeHtml(item.title)}</h2>
      <p>${escapeHtml(item.required_to_complete_goal)}</p>
      <pre>${escapeHtml(JSON.stringify(item.evidence, null, 2))}</pre>
    </article>`,
    )
    .join("");

  return `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>AIOS Goal Audit</title>
  <style>
    :root { color-scheme: light; --ink: #17211c; --muted: #627069; --line: #d9ded8; --bg: #f6f7f3; --panel: #fff; --green: #2f7d55; --amber: #9f6500; --red: #a83e3e; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif; line-height: 1.55; }
    main { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 44px; }
    header { display: grid; gap: 10px; margin-bottom: 22px; }
    h1 { margin: 0; font-size: clamp(30px, 5vw, 54px); line-height: 1.08; letter-spacing: 0; }
    h2 { margin: 6px 0 8px; font-size: 20px; letter-spacing: 0; }
    p { margin: 0; }
    .status { display: inline-flex; width: fit-content; border: 1px solid var(--line); border-radius: 8px; padding: 8px 11px; background: var(--panel); font-weight: 760; }
    .not_complete { color: var(--amber); }
    .complete { color: var(--green); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .card, .blocker { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 16px; }
    .blocker { border-color: rgba(168, 62, 62, .35); background: #fff8f8; }
    .meta { color: var(--muted); font-size: 13px; font-weight: 740; }
    .stop { color: var(--muted); margin-bottom: 8px; }
    ul { margin: 12px 0 0; padding-left: 20px; }
    li { margin: 4px 0; overflow-wrap: anywhere; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; color: var(--muted); margin: 10px 0 0; }
    .boundary { margin-top: 12px; color: var(--muted); font-size: 13px; }
    section { margin-top: 22px; }
    @media (max-width: 780px) { .grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div class="status ${escapeHtml(audit.overall_status)}">Overall: ${escapeHtml(audit.overall_status)}</div>
      <h1>AIOS Goal Audit</h1>
      <p>${escapeHtml(audit.objective)}</p>
      <p class="boundary">${escapeHtml(audit.claim_boundary)}</p>
    </header>
    <section>
      <h2>Completion Blockers</h2>
      <div class="grid">${blockerRows}</div>
    </section>
    <section>
      <h2>Stop Condition Evidence</h2>
      <div class="grid">${requirementRows}</div>
    </section>
  </main>
</body>
</html>
`;
}

const audit = buildAudit();
mkdirSync(dirname(jsonOutput), { recursive: true });
mkdirSync(dirname(htmlOutput), { recursive: true });
writeFileSync(jsonOutput, `${JSON.stringify(audit, null, 2)}\n`);
writeFileSync(htmlOutput, writeHtml(audit));

const result = {
  status: "pass",
  action: "aios-goal-audit",
  overallStatus: audit.overall_status,
  localMechanicsStatus: audit.local_mechanics_status,
  blockers: audit.completion_blockers.map((item) => item.id),
  blockerStatuses: Object.fromEntries(audit.completion_blockers.map((item) => [item.id, item.status])),
  jsonPath: jsonOutput,
  htmlPath: htmlOutput,
  url: pathToFileURL(htmlOutput).href,
  claimBoundary: audit.claim_boundary,
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`generated ${jsonOutput}`);
  console.log(`generated ${htmlOutput}`);
}
