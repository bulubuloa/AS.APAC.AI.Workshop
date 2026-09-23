#!/usr/bin/env node
// Builds reports/index.html from the JUnit XML plus the videos and screenshots wdio leaves behind.
// Written by hand rather than pulled from npm: one page, no dependencies, plays the evidence inline.
const fs = require('node:fs');
const path = require('node:path');

const REPORTS = path.join(__dirname, '..', 'reports');

function readCases() {
  const files = fs.readdirSync(REPORTS).filter((f) => f.startsWith('junit') && f.endsWith('.xml'));
  const cases = [];
  for (const f of files) {
    const xml = fs.readFileSync(path.join(REPORTS, f), 'utf8');
    for (const m of xml.matchAll(/<testcase\b([^>]*)>([\s\S]*?)<\/testcase>|<testcase\b([^>]*)\/>/g)) {
      const attrs = m[1] ?? m[3] ?? '';
      const body = m[2] ?? '';
      // \b matters: a bare name=" also matches inside classname="
      const at = (k) => (new RegExp(`\\b${k}="([^"]*)"`).exec(attrs) ?? [])[1] ?? '';
      // wdio writes the paired form for stack traces and a self-closing one for assertion messages
      const paired = /<(failure|error)\b[^>]*>([\s\S]*?)<\/\1>/.exec(body);
      const selfClosing = /<(?:failure|error)\b([^>]*)\/>/.exec(body);
      const failure = paired
        ? [null, null, paired[2]]
        : selfClosing
          ? [null, null, (/message="([^"]*)"/.exec(selfClosing[1]) ?? [])[1] ?? 'failed']
          : null;
      cases.push({
        name: decode(at('name')),
        classname: decode(at('classname')),
        time: Number(at('time') || 0),
        skipped: /<skipped\b/.test(body),
        failure: failure ? decode(failure[2]).trim() : null,
      });
    }
  }
  return cases;
}

const decode = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

/** Newest file in `dir` whose slug contains the test's slug. */
function findAsset(dir, testName) {
  const full = path.join(REPORTS, dir);
  if (!fs.existsSync(full)) return null;
  const want = slug(testName).replace(/^-|-$/g, '');
  const hits = fs
    .readdirSync(full)
    .filter((f) => /\.(webm|mp4|png)$/i.test(f) && slug(f).includes(want))
    .map((f) => ({ f, t: fs.statSync(path.join(full, f)).mtimeMs }))
    .sort((a, b) => b.t - a.t);
  return hits[0] ? `${dir}/${hits[0].f}` : null;
}

const cases = readCases();
const passed = cases.filter((c) => !c.failure && !c.skipped).length;
const failed = cases.filter((c) => c.failure).length;
const total = cases.length;

const rows = cases
  .map((c) => {
    const video = findAsset('video', c.name);
    const shot = findAsset('screenshots', c.name);
    const status = c.failure ? 'fail' : c.skipped ? 'skip' : 'pass';
    return `
    <article class="case ${status}">
      <header>
        <span class="badge ${status}">${status.toUpperCase()}</span>
        <h2>${esc(c.name)}</h2>
        <span class="time">${c.time.toFixed(1)}s</span>
      </header>
      ${c.failure ? `<pre class="failure">${esc(c.failure)}</pre>` : ''}
      <div class="evidence">
        ${video ? `<figure><figcaption>video</figcaption><video src="${video}" controls preload="metadata"></video></figure>` : ''}
        ${shot ? `<figure><figcaption>screenshot</figcaption><a href="${shot}" target="_blank"><img src="${shot}" alt=""></a></figure>` : ''}
        ${!video && !shot ? '<p class="none">no evidence captured</p>' : ''}
      </div>
    </article>`;
  })
  .join('\n');

const html = `<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>RoadSide Android - test report</title>
<style>
  :root { color-scheme: light dark; --pass:#15803d; --fail:#b91c1c; --skip:#a16207; --line:#d4d4d8; }
  body { margin:0; padding:24px; font:14px/1.5 system-ui,sans-serif; background:#fafafa; color:#18181b; }
  @media (prefers-color-scheme: dark) { body { background:#18181b; color:#e4e4e7; } :root { --line:#3f3f46; } }
  h1 { font-size:20px; margin:0 0 4px; }
  .meta { color:#71717a; margin-bottom:20px; }
  .summary { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:24px; }
  .stat { border:1px solid var(--line); border-radius:8px; padding:10px 16px; min-width:90px; }
  .stat b { display:block; font-size:22px; }
  .case { border:1px solid var(--line); border-radius:8px; padding:14px 16px; margin-bottom:14px; }
  .case header { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .case h2 { font-size:15px; font-weight:600; margin:0; flex:1; min-width:200px; }
  .time { color:#71717a; font-variant-numeric:tabular-nums; }
  .badge { font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; color:#fff; }
  .badge.pass { background:var(--pass); } .badge.fail { background:var(--fail); } .badge.skip { background:var(--skip); }
  .failure { background:#fee2e2; color:#7f1d1d; padding:10px; border-radius:6px; overflow-x:auto; font-size:12px; white-space:pre-wrap; }
  @media (prefers-color-scheme: dark) { .failure { background:#450a0a; color:#fecaca; } }
  .evidence { display:flex; gap:16px; flex-wrap:wrap; margin-top:12px; }
  figure { margin:0; }
  figcaption { color:#71717a; font-size:12px; margin-bottom:4px; }
  video, img { max-width:100%; width:260px; border:1px solid var(--line); border-radius:6px; display:block; }
  .none { color:#71717a; font-style:italic; }
</style>
<h1>RoadSide Android - test report</h1>
<p class="meta">${esc(process.env.APP_PACKAGE ?? 'com.aspire.partner.uat')} &middot; generated ${new Date().toLocaleString()}</p>
<div class="summary">
  <div class="stat"><b>${total}</b>tests</div>
  <div class="stat"><b style="color:var(--pass)">${passed}</b>passed</div>
  <div class="stat"><b style="color:var(--fail)">${failed}</b>failed</div>
</div>
${rows || '<p>No test cases found - run <code>npm test</code> first.</p>'}
`;

fs.writeFileSync(path.join(REPORTS, 'index.html'), html);
console.log(`reports/index.html  (${total} tests, ${passed} passed, ${failed} failed)`);
