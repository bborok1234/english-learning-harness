import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const statePath = resolve(root, "docs/product/learner-cockpit-state.json");
const outputPath = resolve(root, "docs/product/learner-cockpit.html");

const state = JSON.parse(readFileSync(statePath, "utf8"));

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const surfaceCards = state.surfaces
  .map(
    (item) => `
        <article class="surface-card">
          <h3>${escapeHtml(item.label)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </article>`,
  )
  .join("");

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="generator" content="scripts/generate-learner-cockpit.mjs">
  <title>${escapeHtml(state.surface.name)}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #13201a;
      --muted: #5d685f;
      --line: #d9dfd8;
      --bg: #f7f8f2;
      --panel: #ffffff;
      --green: #2f7d55;
      --blue: #2d668f;
      --amber: #9c6500;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif;
      line-height: 1.55;
    }
    .page {
      width: min(1120px, calc(100% - 32px));
      margin: 0 auto;
      padding: 28px 0 44px;
    }
    header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      align-items: start;
      border-bottom: 1px solid var(--line);
      padding-bottom: 22px;
    }
    h1, h2, h3, p { margin: 0; }
    h1 {
      font-size: clamp(30px, 5vw, 52px);
      line-height: 1.08;
      letter-spacing: 0;
      max-width: 760px;
    }
    .subtitle {
      margin-top: 10px;
      max-width: 760px;
      color: var(--muted);
      font-size: 17px;
    }
    .badge {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      padding: 12px 14px;
      color: var(--muted);
      min-width: 180px;
    }
    .badge strong {
      display: block;
      color: var(--ink);
      font-size: 18px;
    }
    .mission {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
      gap: 16px;
      margin-top: 20px;
    }
    .panel, .surface-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
    }
    .panel h2 {
      font-size: 22px;
      line-height: 1.2;
    }
    .scene {
      margin-top: 14px;
      padding: 18px;
      border-radius: 8px;
      background: #e9f4ed;
      border: 1px solid #cfe3d5;
      font-size: 18px;
    }
    .ask {
      margin-top: 14px;
      font-size: 24px;
      font-weight: 760;
      line-height: 1.24;
    }
    .example, .prompt {
      margin-top: 12px;
      padding: 13px;
      border-radius: 8px;
      background: #eef5fa;
      border: 1px solid #d3e4ee;
    }
    code {
      white-space: normal;
      overflow-wrap: anywhere;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-top: 16px;
    }
    .surface-card h3 {
      font-size: 18px;
    }
    .surface-card p, .panel p {
      color: var(--muted);
      margin-top: 8px;
    }
    .progress {
      display: grid;
      gap: 10px;
      margin-top: 14px;
    }
    .bar {
      height: 12px;
      border-radius: 99px;
      background: #e7ece5;
      overflow: hidden;
    }
    .fill {
      width: ${(Number(state.journey.day) / Number(state.journey.targetDays)) * 100}%;
      height: 100%;
      background: var(--green);
    }
    .boundary {
      margin-top: 18px;
      color: var(--muted);
      font-size: 13px;
    }
    .internal {
      margin-top: 18px;
      padding-top: 16px;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: 13px;
    }
    .internal a { color: var(--blue); }
    @media (max-width: 860px) {
      header, .mission { grid-template-columns: 1fr; }
      .grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 560px) {
      .grid { grid-template-columns: 1fr; }
      .ask { font-size: 21px; }
    }
  </style>
</head>
<body>
  <!-- GENERATED FILE. Edit docs/product/learner-cockpit-state.json, then run scripts/generate-learner-cockpit.mjs. -->
  <main class="page">
    <header>
      <div>
        <h1>${escapeHtml(state.surface.name)}</h1>
        <p class="subtitle">${escapeHtml(state.surface.purpose)}</p>
      </div>
      <div class="badge">
        <span>${escapeHtml(state.surface.audience)}</span>
        <strong>Day ${escapeHtml(state.journey.day)} / ${escapeHtml(state.journey.targetDays)}</strong>
      </div>
    </header>

    <section class="mission">
      <article class="panel">
        <h2>${escapeHtml(state.today.title)}</h2>
        <div class="scene">${escapeHtml(state.today.mission)}</div>
        <div class="ask">${escapeHtml(state.today.ask)}</div>
        <div class="example">예시: <strong>${escapeHtml(state.today.example)}</strong></div>
        <div class="prompt">Codex에게 이렇게 말하세요:<br><code>${escapeHtml(state.today.startPrompt)}</code></div>
      </article>
      <aside class="panel">
        <h2>오늘의 말하기 행동</h2>
        <p><strong>${escapeHtml(state.skillFocus.name)}</strong></p>
        <p>${escapeHtml(state.skillFocus.why)}</p>
        <p>Transfer test: ${escapeHtml(state.skillFocus.transferTest)}</p>
        <div class="progress">
          <div>${escapeHtml(state.journey.currentArc)}</div>
          <div class="bar"><div class="fill"></div></div>
          <p>${escapeHtml(state.journey.nextMilestone)}</p>
        </div>
      </aside>
    </section>

    <section class="grid" aria-label="Learner surfaces">
${surfaceCards}
    </section>

    <p class="boundary">${escapeHtml(state.surface.claimBoundary)}</p>
    <p class="internal">${escapeHtml(state.internalBoundary.note)} 내부 운영판: <a href="${escapeHtml(state.internalBoundary.engineeringDashboard)}">engineering dashboard</a></p>
  </main>
</body>
</html>
`;

writeFileSync(outputPath, html, "utf8");
console.log(`generated ${outputPath}`);
