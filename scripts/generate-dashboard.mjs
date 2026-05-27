import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const statePath = resolve(root, "docs/project-state.json");
const outputPath = resolve(root, "docs/dashboard.html");

const state = JSON.parse(readFileSync(statePath, "utf8"));

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const jsonScript = JSON.stringify(state, null, 2).replaceAll("<", "\\u003c");
const toneClass = (tone = "blue") => `tone-${escapeHtml(tone)}`;

const metrics = state.metrics.map((item) => `
        <article class="metric-card ${toneClass(item.tone)}">
          <div class="eyebrow"><span class="dot"></span>${escapeHtml(item.label)}</div>
          <div class="metric-value">${escapeHtml(item.value)}</div>
          <p>${escapeHtml(item.detail)}</p>
        </article>`).join("");

const columns = state.board.map((column) => `
        <section class="board-column ${toneClass(column.tone)}">
          <header class="column-head">
            <h2>${escapeHtml(column.title)}</h2>
            <span>${column.cards.length}</span>
          </header>
          <div class="column-cards">
            ${column.cards.map((card) => `
            <article class="work-card">
              <div class="work-meta">
                <strong>${escapeHtml(card.id)}</strong>
                ${card.files ? `<span>${escapeHtml(card.files.join(", "))}</span>` : ""}
              </div>
              <h3>${escapeHtml(card.title)}</h3>
              ${card.why ? `<div class="card-row"><b>왜</b><p>${escapeHtml(card.why)}</p></div>` : ""}
              ${card.done ? `<div class="card-row"><b>완료</b><p>${escapeHtml(card.done)}</p></div>` : ""}
              ${card.verification ? `<div class="card-row"><b>검증</b><p>${escapeHtml(card.verification)}</p></div>` : ""}
            </article>`).join("")}
          </div>
        </section>`).join("");

const ssot = state.ssot.map((item) => `
            <a class="link-card ${escapeHtml(item.kind)}" href="${escapeHtml(item.path)}">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.role)}</span>
            </a>`).join("");

const verification = state.verification.map((item) => `
            <tr>
              <td>${escapeHtml(item.name)}</td>
              <td><strong>${escapeHtml(item.status)}</strong><span>${escapeHtml(item.detail)}</span></td>
            </tr>`).join("");

const commands = state.commands.map((item) => `
            <div class="command">
              <span>${escapeHtml(item.label)}</span>
              <code>${escapeHtml(item.command)}</code>
            </div>`).join("");

const html = `<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="generator" content="scripts/generate-dashboard.mjs">
  <title>${escapeHtml(state.project.name)} Board</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #17211c;
      --muted: #5d6962;
      --line: #d9ded8;
      --bg: #f6f7f3;
      --panel: #ffffff;
      --green: #2f7d55;
      --blue: #2d668f;
      --amber: #a66b00;
      --red: #b84242;
      --green-soft: #e9f4ed;
      --blue-soft: #e7f1f7;
      --amber-soft: #fff3da;
      --red-soft: #faeaea;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Segoe UI", sans-serif;
      font-size: 15px;
      line-height: 1.55;
    }

    a { color: inherit; }

    .page {
      width: min(1440px, calc(100% - 32px));
      margin: 0 auto;
      padding: 26px 0 42px;
    }

    .top {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 18px;
      align-items: start;
      padding-bottom: 22px;
      border-bottom: 1px solid var(--line);
    }

    h1, h2, h3, p { margin: 0; }

    h1 {
      font-size: clamp(28px, 4vw, 44px);
      line-height: 1.12;
      letter-spacing: 0;
    }

    .summary {
      margin-top: 10px;
      max-width: 880px;
      color: var(--muted);
      font-size: 16px;
    }

    .stamp {
      min-width: 220px;
      padding: 12px 14px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      color: var(--muted);
      text-align: right;
    }

    .stamp strong {
      display: block;
      color: var(--ink);
      font-size: 16px;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-top: 18px;
    }

    .metric-card, .panel, .board-column {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
    }

    .metric-card {
      min-height: 122px;
      padding: 15px;
    }

    .eyebrow {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--muted);
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0;
    }

    .dot {
      width: 9px;
      height: 9px;
      border-radius: 99px;
      background: currentColor;
    }

    .metric-value {
      margin-top: 8px;
      font-size: 28px;
      font-weight: 780;
      line-height: 1.14;
    }

    .metric-card p, .work-card p, .panel p {
      margin-top: 7px;
      color: var(--muted);
    }

    .north-star {
      margin-top: 18px;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
      gap: 14px;
    }

    .panel {
      padding: 17px;
    }

    .panel h2 {
      font-size: 19px;
      line-height: 1.25;
    }

    .star-box {
      margin-top: 12px;
      padding: 16px;
      border: 1px solid #c7dde9;
      border-radius: 8px;
      background: var(--blue-soft);
      color: #194d6f;
      font-size: 18px;
      font-weight: 760;
    }

    .board {
      display: grid;
      grid-template-columns: repeat(4, minmax(260px, 1fr));
      gap: 14px;
      margin-top: 18px;
      align-items: start;
    }

    .board-column {
      min-height: 340px;
      padding: 12px;
      min-width: 0;
    }

    .column-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid var(--line);
    }

    .column-head h2 {
      font-size: 18px;
    }

    .column-head span {
      display: inline-grid;
      place-items: center;
      min-width: 28px;
      height: 26px;
      padding: 0 8px;
      border-radius: 999px;
      font-weight: 760;
      background: var(--blue-soft);
      color: var(--blue);
    }

    .column-cards {
      display: grid;
      gap: 10px;
      margin-top: 12px;
    }

    .work-card {
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcfa;
      min-width: 0;
    }

    .work-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 8px;
      color: var(--muted);
      font-size: 12px;
      min-width: 0;
    }

    .work-meta strong {
      color: var(--green);
      font-size: 13px;
      white-space: nowrap;
    }

    .work-meta span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }

    .work-card h3 {
      font-size: 15px;
      line-height: 1.28;
    }

    .card-row {
      display: grid;
      grid-template-columns: 42px 1fr;
      gap: 8px;
      margin-top: 10px;
      align-items: start;
    }

    .card-row b {
      display: inline-grid;
      place-items: center;
      min-height: 22px;
      border-radius: 6px;
      background: #eef1ed;
      color: var(--muted);
      font-size: 12px;
    }

    .card-row p {
      margin: 0;
      color: var(--ink);
      font-size: 14px;
    }

    .below {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(300px, 440px);
      gap: 14px;
      margin-top: 18px;
    }

    .links {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      margin-top: 12px;
    }

    .link-card {
      display: block;
      min-height: 70px;
      padding: 11px 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcfa;
      text-decoration: none;
    }

    .link-card span {
      display: block;
      margin-top: 4px;
      color: var(--muted);
      font-size: 13px;
    }

    .link-card.generated { border-style: dashed; }
    .link-card.runtime { background: var(--amber-soft); }

    table {
      width: 100%;
      margin-top: 10px;
      border-collapse: collapse;
      font-size: 14px;
    }

    td {
      padding: 10px 6px;
      border-bottom: 1px solid var(--line);
      vertical-align: top;
    }

    td span {
      display: block;
      margin-top: 3px;
      color: var(--muted);
      font-size: 13px;
    }

    .commands {
      display: grid;
      gap: 10px;
      margin-top: 12px;
    }

    .command {
      display: grid;
      gap: 5px;
      padding: 10px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcfa;
    }

    code {
      display: block;
      overflow-wrap: anywhere;
      color: #28453a;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 13px;
    }

    .tone-green .dot, .tone-green .metric-value, .tone-green .work-meta strong { color: var(--green); }
    .tone-blue .dot, .tone-blue .metric-value, .tone-blue .work-meta strong { color: var(--blue); }
    .tone-amber .dot, .tone-amber .metric-value, .tone-amber .work-meta strong { color: var(--amber); }
    .tone-red .dot, .tone-red .metric-value, .tone-red .work-meta strong { color: var(--red); }
    .tone-green .column-head span { background: var(--green-soft); color: var(--green); }
    .tone-blue .column-head span { background: var(--blue-soft); color: var(--blue); }
    .tone-amber .column-head span { background: var(--amber-soft); color: var(--amber); }
    .tone-red .column-head span { background: var(--red-soft); color: var(--red); }

    .generated-note {
      margin-top: 18px;
      color: var(--muted);
      font-size: 13px;
    }

    @media (max-width: 1120px) {
      .board { grid-template-columns: repeat(2, minmax(260px, 1fr)); }
      .north-star, .below { grid-template-columns: 1fr; }
    }

    @media (max-width: 780px) {
      .top, .metrics, .board, .links { grid-template-columns: 1fr; }
      .stamp { text-align: left; }
      .page { width: min(100% - 22px, 1440px); padding-top: 18px; }
      .work-meta { display: grid; }
      .work-meta span { white-space: normal; }
    }
  </style>
</head>
<body>
  <!-- GENERATED FILE. Edit docs/project-state.json, then run scripts/generate-dashboard.mjs. -->
  <script type="application/json" id="project-state">
${jsonScript}
  </script>
  <div class="page">
    <header class="top">
      <div>
        <h1>${escapeHtml(state.project.name)} Canvas Board</h1>
        <p class="summary">${escapeHtml(state.project.summary)}</p>
      </div>
      <div class="stamp">
        <strong>${escapeHtml(state.updatedAt)}</strong>
        ${escapeHtml(state.project.stage)}<br>
        ${escapeHtml(state.project.status)}
      </div>
    </header>

    <section class="metrics" aria-label="Project metrics">
${metrics}
    </section>

    <section class="north-star">
      <article class="panel">
        <h2>제품 북극성</h2>
        <div class="star-box">${escapeHtml(state.project.northStar)}</div>
        <p>실제 외국인 앞 자신감은 부수 효과로 가능하지만 보장하지 않는다. 모든 구현 판단은 이 문장을 기준으로 검증한다.</p>
      </article>
      <article class="panel">
        <h2>생성 구조</h2>
        <p><strong>structured state → generated single HTML</strong></p>
        <p>상태는 JSON에만 기록하고, 이 HTML은 매번 재생성한다. 단일 파일 공유성은 유지하면서 stale 위험을 줄인다.</p>
      </article>
    </section>

    <main class="board" aria-label="Project canvas board">
${columns}
    </main>

    <section class="below">
      <article class="panel">
        <h2>SSOT와 링크</h2>
        <div class="links">
${ssot}
        </div>
      </article>
      <aside class="panel">
        <h2>검증과 명령</h2>
        <table>
          <tbody>
${verification}
          </tbody>
        </table>
        <div class="commands">
${commands}
        </div>
      </aside>
    </section>

    <p class="generated-note">Generated from <code>docs/project-state.json</code>. Do not edit this HTML directly.</p>
  </div>
</body>
</html>
`;

writeFileSync(outputPath, html, "utf8");
console.log(`generated ${outputPath}`);
