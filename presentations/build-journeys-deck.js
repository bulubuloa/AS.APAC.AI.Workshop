// RoadSide E2E journeys deck (job + announcement) for the manager. Run: node build-journeys-deck.js <out.pptx>
const path = require('path');
const PptxGenJS = require('pptxgenjs');
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');

const OUT = process.argv[2] || 'RoadSide_E2E_Journeys.pptx';
const IMG = (f) => path.join(__dirname, 'e2e-img', f);

const THEME = {
  name: 'Aspire E2E',
  headFontFace: 'Segoe UI Semibold',
  bodyFontFace: 'Segoe UI',
  colors: {
    dk1: '1A1A1E', lt1: 'FFFFFF', dk2: '0E2A47', lt2: 'F3F5F8',
    accent1: '0B5FA5', // web / Aspire blue
    accent2: 'C2410C', // app / roadside orange
    accent3: '15803D', // pass
    accent4: '71717A', // muted
    accent5: 'D9D9DE', // lines
    accent6: 'E8F0F8', // soft blue
    hlink: '0B5FA5', folHlink: '0E2A47',
  },
};
const HEX = THEME.colors;
const W = 13.333, H = 7.5, M = 0.6;

const pres = new PptxGenJS();
pres.layout = 'LAYOUT_WIDE';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.author = 'APAC Aspire Digital';
pres.company = 'International SOS - APAC Aspire Digital';
pres.title = 'RoadSide end-to-end journeys: job and announcement';
const C = pres.SchemeColor;

// ---------- layouts ----------
pres.defineSlideMaster({
  title: 'DARK',
  background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 2.0, w: W - 2 * M, h: 1.7, fontSize: 40, bold: true, color: C.background1, valign: 'top', align: 'left' }, text: '' } },
    { placeholder: { options: { name: 'body', type: 'body', x: M, y: 3.8, w: W - 2 * M - 2, h: 1.2, fontSize: 18, color: 'C9D6E5', valign: 'top', align: 'left' }, text: '' } },
  ],
});
pres.defineSlideMaster({
  title: 'CONTENT',
  background: { color: HEX.lt1 },
  margin: [0.5, M, 0.6, M],
  objects: [
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.35, w: W - 2 * M, h: 0.7, fontSize: 26, bold: true, color: C.text1, valign: 'top', align: 'left' }, text: '' } },
    { line: { x: M, y: 1.2, w: 1.2, h: 0, line: { color: C.accent1, width: 3 } } },
    { text: { text: 'RoadSide end-to-end journeys  |  web + app  |  RSA UAT', options: { x: M, y: H - 0.42, w: 8, h: 0.3, fontSize: 9, color: C.accent4 } } },
  ],
  slideNumber: { x: W - M - 0.6, y: H - 0.42, w: 0.6, h: 0.3, fontSize: 9, color: HEX.accent4, align: 'right' },
});

// ---------- helpers ----------
const box = (s, o) => s.addText(o.text ?? '', { isTextBox: true, margin: 0, fontSize: 14, color: C.text1, valign: 'top', ...o });
function pill(s, kind, x, y) {
  const app = kind === 'APP';
  s.addText(kind, {
    shape: pres.ShapeType.roundRect, rectRadius: 0.12, x, y, w: 0.62, h: 0.3, margin: 0,
    fill: { color: app ? C.accent2 : C.accent1 }, color: C.background1, fontSize: 10, bold: true, align: 'center', valign: 'middle',
    objectName: `pill ${kind}`,
  });
}
function content(title, section) {
  const s = pres.addSlide({ masterName: 'CONTENT', sectionTitle: section });
  s.addText(title, { placeholder: 'title' });
  return s;
}
function card(s, { x, y, w, h, head, body, color = C.accent1, headSize = 15, bodySize = 12.5 }) {
  s.addShape(pres.ShapeType.rect, { x, y, w, h, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: `card ${head}` });
  s.addShape(pres.ShapeType.rect, { x, y, w: 0.07, h, fill: { color }, line: { color }, objectName: `card edge ${head}` });
  box(s, { x: x + 0.25, y: y + 0.18, w: w - 0.4, h: 0.4, text: head, fontSize: headSize, bold: true });
  box(s, { x: x + 0.25, y: y + 0.62, w: w - 0.4, h: h - 0.75, text: body, fontSize: bodySize, color: C.text1, lineSpacingMultiple: 1.15 });
}
function shot(s, file, { x, y, w, ratio }) {
  s.addImage({ path: IMG(file), x, y, w, h: w / ratio, objectName: file });
  s.addShape(pres.ShapeType.rect, { x, y, w, h: w / ratio, fill: { type: 'none' }, line: { color: C.accent5, width: 1 }, objectName: `frame ${file}` });
}
function callouts(s, items, { x, y, w }) {
  items.forEach(([n, head, body], i) => {
    const yy = y + i * 1.25;
    s.addText(String(n), { shape: pres.ShapeType.ellipse, x, y: yy, w: 0.42, h: 0.42, margin: 0, fill: { color: C.accent2 }, color: C.background1, bold: true, fontSize: 13, align: 'center', valign: 'middle' });
    box(s, { x: x + 0.6, y: yy - 0.02, w: w - 0.6, h: 0.35, text: head, fontSize: 14, bold: true });
    box(s, { x: x + 0.6, y: yy + 0.34, w: w - 0.6, h: 0.85, text: body, fontSize: 11.5, color: C.text1 });
  });
}
const VID = 1686 / 900;


const WEB_AREAS = [['Job Create & Edit', 95], ['Provider Dispatch', 61], ['Benefit & Redemption', 38], ['Job Lifecycle & Status', 32], ['Cross-Cutting & NFR', 27], ['Job List & Search', 25], ['Reports', 24], ['Announcements', 23], ['Provider Portal', 20], ['Provider Admin (GAN)', 19]];
const APP_AREAS = [['Policy & Login', 11], ['Job Execution', 9], ['Vehicle & OTP', 8], ['Dashboard & Ready', 8], ['Receive Job', 6], ['Job Photos', 6], ['Settings', 6], ['Map & Location', 5], ['Job History', 4], ['Resilience & NFR', 4]];

function bars(s, rows, { x, y, w, rowH = 0.42, color }) {
  const max = Math.max(...rows.map((r) => r[1]));
  rows.forEach(([label, n], i) => {
    const yy = y + i * rowH;
    box(s, { x, y: yy, w: 2.6, h: rowH - 0.06, text: label, fontSize: 12, valign: 'middle' });
    const bw = (w - 3.4) * (n / max);
    s.addShape(pres.ShapeType.rect, { x: x + 2.7, y: yy + 0.06, w: Math.max(bw, 0.05), h: rowH - 0.18, fill: { color }, line: { color }, objectName: `bar ${label}` });
    box(s, { x: x + 2.8 + bw, y: yy, w: 0.7, h: rowH - 0.06, text: String(n), fontSize: 12, bold: true, valign: 'middle' });
  });
}
function stat(s, x, y, big, small, col, w = 2.6) {
  box(s, { x, y, w, h: 0.85, text: big, fontSize: 38, bold: true, color: col });
  box(s, { x, y: y + 0.85, w, h: 0.6, text: small, fontSize: 12, color: C.accent4 });
}
function lane(s, steps, { y = 1.5, colW = 1.18, gap = 0.05 } = {}) {
  // swimlane: one column per step, card in the Web or App row
  const x0 = M + 0.95;
  const rows = { Web: y, Server: y + 1.55, App: y + 3.1 };
  Object.entries(rows).forEach(([k, yy]) => {
    s.addShape(pres.ShapeType.rect, { x: M, y: yy, w: W - 2 * M, h: 1.45, fill: { color: k === 'App' ? 'FDF1EA' : k === 'Web' ? C.accent6 : C.background2 }, line: { color: C.accent5, width: 0.5 }, objectName: `lane ${k}` });
    box(s, { x: M + 0.1, y: yy + 0.5, w: 0.8, h: 0.4, text: k.toUpperCase(), fontSize: 11, bold: true, color: k === 'App' ? C.accent2 : k === 'Web' ? C.accent1 : C.accent4 });
  });
  steps.forEach(([side, text], i) => {
    const x = x0 + i * (colW + gap);
    const col = side === 'App' ? C.accent2 : side === 'Web' ? C.accent1 : C.text2;
    s.addShape(pres.ShapeType.rect, { x, y: rows[side] + 0.12, w: colW, h: 1.21, fill: { color: C.background1 }, line: { color: col, width: 1.5 }, objectName: `step ${i + 1}` });
    s.addText(String(i + 1), { shape: pres.ShapeType.ellipse, x: x + 0.06, y: rows[side] + 0.18, w: 0.3, h: 0.3, margin: 0, fill: { color: col }, color: C.background1, bold: true, fontSize: 10, align: 'center', valign: 'middle' });
    box(s, { x: x + 0.06, y: rows[side] + 0.5, w: colW - 0.12, h: 0.8, text, fontSize: 9.5 });
  });
}
function trace(s, rows, { y = 1.45, fs = 10.5 } = {}) {
  const head = ['#', 'Side', 'Step', 'Checked', 'Web suite cases', 'App suite cases'];
  const data = [head, ...rows];
  s.addTable(data.map((r, i) => r.map((t, j) => ({
    text: t,
    options: i === 0
      ? { bold: true, color: C.background1, fill: { color: [C.text2, C.text2, C.text2, C.text2, C.accent1, C.accent2][j] }, fontSize: fs + 0.5 }
      : { color: j === 1 ? (t === 'App' ? C.accent2 : t === 'Web' ? C.accent1 : C.accent4) : C.text1, bold: j <= 1, fill: { color: i % 2 ? C.background2 : C.background1 }, fontSize: fs },
  }))), { x: M, y, w: W - 2 * M, colW: [0.45, 0.75, 3.4, 3.0, 2.7, 1.83], border: { type: 'solid', pt: 0.5, color: HEX.accent5 }, margin: 0.05 });
}

// ---------- 1. title ----------
pres.addSection({ title: 'Where we are' });
{
  const s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Where we are' });
  box(s, { x: M, y: 1.35, w: 9, h: 0.4, text: 'ROADSIDE QA AUTOMATION', fontSize: 13, bold: true, color: 'F59E57', charSpacing: 2 });
  s.addText('End-to-end testing of two business journeys: web portal + provider app', { placeholder: 'title' });
  s.addText('Job: create, dispatch, finish on the phone  |  Announcement: publish on the web, show on the phone', { placeholder: 'body' });
  box(s, { x: M, y: 6.2, w: 11, h: 0.4, text: 'APAC Aspire Digital  |  22 October 2026  |  RSA UAT', fontSize: 12, color: '8FA6BF' });
  s.addNotes('Two real business journeys, each starting on the agent portal and ending on the driver\'s phone. Every step is traced to a test case in our suites, and every run gives a video as evidence.');
}

// ---------- 2. where we are ----------
{
  const s = content('Where we are: two suites, now joined by two end-to-end journeys', 'Where we are');
  stat(s, M, 1.6, '560', 'RoadSide web test cases (23 areas)', C.accent1, 3.6);
  stat(s, M + 4.1, 1.6, '72', 'RoadSide app test cases (12 areas)', C.accent2, 3.6);
  stat(s, M + 8.2, 1.6, '2', 'end-to-end journeys across web + app', C.text2, 3.6);
  card(s, { x: M, y: 3.55, w: W - 2 * M, h: 2.85, head: 'What end-to-end adds', body: [
    { text: 'The web suite proves the portal. The app suite proves the phone. Neither proves that what the agent does on the portal reaches the driver - and that what the driver does comes back.', options: { breakLine: true } },
    { text: ' ', options: { breakLine: true, fontSize: 6 } },
    { text: 'The two journeys test exactly that hand-off, step by step, and each step is mapped to the cases it proves in both suites.', options: { color: C.accent4 } },
  ], bodySize: 15 });
  s.addNotes('Three numbers. 560 web cases, 72 app cases, and two journeys that connect them.');
}

// ---------- 3. web suite ----------
{
  const s = content('RoadSide web suite: 560 cases across 23 areas', 'Where we are');
  bars(s, WEB_AREAS, { x: M, y: 1.5, w: 7.4, color: HEX.accent1 });
  box(s, { x: M, y: 5.85, w: 7.4, h: 0.4, text: 'Top 10 areas shown; 13 more areas hold the other 196 cases.', fontSize: 11, color: C.accent4 });
  stat(s, M + 8.0, 1.5, '308', 'P1 cases - must pass before production', C.accent1, 4.1);
  stat(s, M + 8.0, 3.0, '371', 'automatable in the browser today; 189 need the app, test data, a stub or a BA answer', C.text2, 4.1);
  card(s, { x: M + 8.0, y: 4.55, w: W - 2 * M - 8.0, h: 1.85, head: 'After the review (22 Oct)', body: '+108 business-rule cases: one per job field, dispatch and provider rules, duplicates, failures, roles. 7 expected results corrected from the code. History per case.', color: C.accent3, headSize: 13, bodySize: 11.5 });
  s.addNotes('The biggest areas are job creation and dispatch - where the review asked for more depth. P1 is about half the suite. The partly-automatable cases each have a written reason.');
}

// ---------- 4. app suite ----------
{
  const s = content('RoadSide app suite: 72 cases across 12 areas', 'Where we are');
  bars(s, APP_AREAS, { x: M, y: 1.5, w: 7.4, color: HEX.accent2 });
  box(s, { x: M, y: 5.85, w: 7.4, h: 0.4, text: 'Top 10 areas shown; Announcements (3) and App Update (2) hold the other 5 cases.', fontSize: 11, color: C.accent4 });
  stat(s, M + 8.0, 1.5, '30', 'P1 cases', C.accent2, 4.1);
  stat(s, M + 8.0, 3.0, '48', 'fully automatable on the emulator; 23 partly (need the web portal or UAT data), 1 real phone only', C.text2, 4.1);
  card(s, { x: M + 8.0, y: 4.55, w: W - 2 * M - 8.0, h: 1.85, head: '9 automated and passing', body: 'Login, OTP binding, and the full job flow (receive, take, arrive, mileage, photo, finish) inside the E2E-01 journey.', color: C.accent3, headSize: 13, bodySize: 11.5 });
  s.addNotes('Most app cases that are only partly automatable need something from the web side first - which is what the journeys provide.');
}

// ---------- 5. two journeys ----------
pres.addSection({ title: 'The two journeys' });
{
  const s = content('Two journeys that cross web, server and phone', 'The two journeys');
  const j = [
    ['E2E-01  Job', 'TC-23-001', 'Agent creates a job and dispatches it → driver receives it, takes it, drives there, arrives, enters mileage, takes a photo, finishes → portal shows CLOSED with the driver\'s timestamps', 'PASSED 20 Oct 2026  ·  ~4.5 min  ·  11 steps', C.accent3],
    ['E2E-02  Announcement', 'TC-23-003', 'Admin creates and publishes an announcement → drivers see it in the app (News + high-priority banner) → admin switches it off → it disappears from the app', 'Built 22 Oct 2026  ·  first run next  ·  8 steps', C.accent2],
  ];
  j.forEach(([name, tc, flow, status, col], i) => {
    const y = 1.55 + i * 2.45;
    s.addShape(pres.ShapeType.rect, { x: M, y, w: W - 2 * M, h: 2.2, fill: { color: C.background2 }, line: { color: C.background2 }, objectName: `journey ${name}` });
    s.addShape(pres.ShapeType.rect, { x: M, y, w: 0.09, h: 2.2, fill: { color: col }, line: { color: col } });
    box(s, { x: M + 0.35, y: y + 0.2, w: 6, h: 0.5, text: name, fontSize: 22, bold: true, color: C.text2 });
    box(s, { x: M + 6.5, y: y + 0.28, w: 5.4, h: 0.4, text: tc, fontSize: 14, color: C.accent4, align: 'right' });
    box(s, { x: M + 0.35, y: y + 0.8, w: W - 2 * M - 0.7, h: 0.85, text: flow, fontSize: 14 });
    box(s, { x: M + 0.35, y: y + 1.65, w: W - 2 * M - 0.7, h: 0.4, text: status, fontSize: 13, bold: true, color: col });
  });
  s.addNotes('Both start on the web and finish on the phone. A job is our core business; announcements are how operations reach every driver at once.');
}

// ---------- 6. E2E-01 swimlane ----------
{
  const s = content('E2E-01 Job: eleven steps, alternating between portal and phone', 'The two journeys');
  lane(s, [
    ['App', 'Driver signed in, Ready on'],
    ['Web', 'Agent creates job (Thai address)'],
    ['Web', 'Sets incident pin'],
    ['Web', 'Assigns truck, Dispatch'],
    ['App', 'Job appears, 9.7 km'],
    ['App', 'Take Job'],
    ['App', 'Drives ~5 km by road'],
    ['App', 'Arrive + mileage 48215'],
    ['App', 'Photo, upload'],
    ['App', 'Finish job'],
    ['Web', 'CLOSED, timestamps by truck'],
  ], { colW: 0.97 });
  box(s, { x: M, y: 6.25, w: W - 2 * M, h: 0.35, text: 'The server sits in the middle: the phone asks it for jobs every few seconds while Ready; every driver action is written back and read by the portal.', fontSize: 12, color: C.accent4 });
  s.addNotes('Read it left to right. Blue is the portal, orange is the phone. Every arrow between rows is a hand-off that the test checks.');
}

// ---------- 7. E2E-01 traceability ----------
{
  const s = content('E2E-01: each step is mapped to the cases it proves', 'The two journeys');
  trace(s, [
    ['1', 'App', 'Driver signs in, truck chosen, Ready on', 'Dashboard, VIN, Ready On', '', 'M01-002, M02-002, M03-001/002'],
    ['2', 'Web', 'Create Basic Repair job, Thai address', 'Job number; values saved', 'TC-01-001, 03-004/010/012/013/026/029/030', ''],
    ['3', 'Web', 'Set incident pin', 'Location saved', 'TC-04-004', ''],
    ['4', 'Web', 'Assign truck v3036, Dispatch', 'Dispatch time; status OPEN', 'TC-04-019, 04-022, 04-045', ''],
    ['5', 'App', 'Job card appears without refresh', 'Same job no.; > 2 km', 'TC-04-025, 04-046', 'M04-001, M04-002'],
    ['6', 'App', 'Take Job', 'Portal accept time; ONPROCESS', 'TC-05-019', 'M04-003'],
    ['7', 'App', 'Drive ~5 km by road', 'Road distance > 2 km', '', 'M06-004'],
    ['8', 'App', 'Arrive, mileage 48215', 'Reach time; mileage = 48215', 'TC-05-019', 'M05-001'],
    ['9', 'App', 'Photo with camera, upload', 'Photo count 1', '', 'M07-001'],
    ['10', 'App', 'Finish job', 'Completed screen', '', 'M05-005, M05-007'],
    ['11', 'Web', 'Reload the job', 'CLOSED; timestamps in order, by truck, with GPS; KPI Pass', 'TC-05-023, 04-060, 05-020', ''],
  ], { fs: 10 });
  box(s, { x: M, y: 6.45, w: W - 2 * M, h: 0.3, text: 'Same table in the workbooks: web suite sheet 26 "E2E Journeys", app suite sheet 13 - filterable by case id.', fontSize: 11, color: C.accent4 });
  s.addNotes('This is the traceability: when E2E-01 passes, these 25 cases across both suites are proven by a single run.');
}

// ---------- 8. E2E-01 what the video shows ----------
{
  const s = content('E2E-01 in the video: portal left, phone right, same run', 'The two journeys');
  const shots = [['t30.png', 'Step 5: dispatched on the portal, the job is on the phone 9.70 km away'], ['t105.png', 'Step 8: driver arrives and enters odometer 48215'], ['t165.png', 'Step 11: portal shows ACCEPT / REACH / COMPLETE by truck v3036, KPI Pass']];
  shots.forEach(([f, cap], i) => {
    const x = M + i * 4.1;
    shot(s, f, { x, y: 1.55, w: 3.95, ratio: VID });
    box(s, { x, y: 1.55 + 3.95 / VID + 0.12, w: 3.95, h: 0.8, text: cap, fontSize: 12 });
  });
  card(s, { x: M, y: 4.85, w: W - 2 * M, h: 1.55, head: 'Result 20 Oct 2026: PASSED, job 26JB049153', body: 'Job card 9.70 km, portal road distance 7 km, mileage 48215, 1 photo, status CLOSED, KPI Pass on accept / reach / complete. Evidence: side-by-side video, Playwright report and trace.', color: C.accent3, headSize: 14, bodySize: 12.5 });
  s.addNotes('Three frames from the recorded run. The full three-minute video plays in the demo.');
}

// ---------- 9. E2E-02 swimlane ----------
{
  const s = content('E2E-02 Announcement: publish on the web, see it on every phone', 'The two journeys');
  lane(s, [
    ['App', 'Driver on the dashboard'],
    ['Web', 'Admin creates High announcement'],
    ['Web', 'List: Approved, Active'],
    ['Server', 'Mobile feed contains it'],
    ['App', 'News tab shows the card'],
    ['App', 'Home: high-priority banner'],
    ['Web', 'Admin unticks Active'],
    ['App', 'Gone from News'],
  ], { colW: 1.35 });
  box(s, { x: M, y: 6.25, w: W - 2 * M, h: 0.35, text: 'Administrators publish at once ("Submit & Publish"). Announcements cannot be targeted - every UAT phone sees it - so the test always switches it off at the end.', fontSize: 12, color: C.accent4 });
  s.addNotes('The announcement journey has a server step: the test reads the same feed the phone reads, so we know whether a failure is on the server or on the phone.');
}

// ---------- 10. E2E-02 traceability ----------
{
  const s = content('E2E-02: each step is mapped to the cases it proves', 'The two journeys');
  trace(s, [
    ['1', 'App', 'Driver signed in, on the dashboard', 'Dashboard shown', '', 'M01-002, M03-001'],
    ['2', 'Web', 'Create High announcement, Submit & Publish', 'Saved; approved at once', 'TC-14-004/005/006/007', ''],
    ['3', 'Web', 'Announcement list', 'Approved, Active, High', 'TC-14-001', ''],
    ['4', 'Server', 'GET api/pmws/announcements', 'Contains the new one', 'TC-14-019', ''],
    ['5', 'App', 'News tab, tap the card', 'Title + content', '', 'M09-001'],
    ['6', 'App', 'Home', 'High-priority banner', '', 'M03-008'],
    ['7', 'Web', 'Edit, untick Active', 'Feed no longer has it', 'TC-14-010, 14-022', ''],
    ['8', 'App', 'Re-open News', 'Announcement gone', '', 'M09-001'],
  ], { fs: 11 });
  box(s, { x: M, y: 5.6, w: W - 2 * M, h: 0.5, text: 'Same table in the workbooks: web suite sheet 26 "E2E Journeys", app suite sheet 13.', fontSize: 11, color: C.accent4 });
  s.addNotes('Same idea as E2E-01: when this journey passes, these 12 cases are proven in one run.');
}

// ---------- 11. demo ----------
pres.addSection({ title: 'Demo and next' });
{
  const s = content('Demo: watch the journeys', 'Demo and next');
  shot(s, 't165.png', { x: M, y: 1.5, w: 7.4, ratio: VID });
  card(s, { x: M + 7.8, y: 1.5, w: W - 2 * M - 7.8, h: 2.3, head: 'E2E-01 Job  (3 min)', body: 'TC-23-001-web-and-app_20Oct-real-location.mp4\nPortal left, phone right. Step names appear as captions from the next run.', color: C.accent3, headSize: 14, bodySize: 12 });
  card(s, { x: M + 7.8, y: 4.0, w: W - 2 * M - 7.8, h: 2.4, head: 'E2E-02 Announcement', body: 'Video from the first run (on the faster machine). Until then: the steps and the mapping on the previous two slides.', color: C.accent2, headSize: 14, bodySize: 12 });
  box(s, { x: M, y: 1.5 + 7.4 / VID + 0.15, w: 7.4, h: 0.6, text: 'What to watch: the job number appearing on the phone after Dispatch, and the timestamps arriving on the portal after each tap.', fontSize: 12, color: C.accent4 });
  s.addNotes('Play the video here. Point out: dispatch on the left, job appears on the right; each driver tap, then the timestamp row on the portal.');
}

// ---------- 12. findings + next ----------
{
  const s = content('What the work found, and what we need next', 'Demo and next');
  card(s, { x: M, y: 1.5, w: 6.0, h: 4.9, head: 'Found while building the suites', color: C.accent2, body: [
    { text: 'Job save checks no mandatory fields; dispatch does not check service or location', options: { bullet: true, breakLine: true } },
    { text: 'Double-click Save / Dispatch and two agents at once are not blocked', options: { bullet: true, breakLine: true } },
    { text: 'Load Provider lists busy trucks nationwide; stale GPS never excluded', options: { bullet: true, breakLine: true } },
    { text: 'Benefit timeout + retry can strand a job (31 Aug incident)', options: { bullet: true, breakLine: true } },
    { text: 'No role checks on job actions', options: { bullet: true, breakLine: true } },
    { text: 'Announcements cannot be targeted; no read tracking', options: { bullet: true, breakLine: true } },
    { text: 'App writes the login password to the device log (UAT build)', options: { bullet: true } },
  ], bodySize: 13 });
  card(s, { x: M + 6.25, y: 1.5, w: W - 2 * M - 6.25, h: 4.9, head: 'Next', color: C.accent1, body: [
    { text: 'BA: mark mandatory fields per stage (sheet 24) and answer the review questions (sheet 25)', options: { bullet: true, breakLine: true } },
    { text: 'Run E2E-02 and record both journeys with step captions', options: { bullet: true, breakLine: true } },
    { text: 'Next journeys: customer cancels while the driver is on the way (TC-23-002); towing job', options: { bullet: true, breakLine: true } },
    { text: 'Decide where journeys run before each release (desktop runner, cloud instance or device farm)', options: { bullet: true } },
  ], bodySize: 13 });
  s.addNotes('Each finding has its own test case in the suite, so it stays visible until it is fixed or accepted.');
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('wrote', OUT);
})();
