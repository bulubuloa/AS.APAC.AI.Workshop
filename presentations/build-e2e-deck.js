// RoadSide web + app end-to-end deck (TC-23-001) for the manager briefing. Run: node build-e2e-deck.js <out.pptx>
const path = require('path');
const PptxGenJS = require('pptxgenjs');
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');

const OUT = process.argv[2] || 'RoadSide_Web_App_E2E.pptx';
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
pres.title = 'RoadSide job end to end: web + app in one test';
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
    { text: { text: 'RoadSide web + app end-to-end  |  TC-23-001  |  RSA UAT', options: { x: M, y: H - 0.42, w: 8, h: 0.3, fontSize: 9, color: C.accent4 } } },
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

// ---------- 1. title ----------
pres.addSection({ title: 'Summary' });
{
  const s = pres.addSlide({ masterName: 'DARK', sectionTitle: 'Summary' });
  box(s, { x: M, y: 1.35, w: 8, h: 0.4, text: 'ROADSIDE AUTOMATION TESTING', fontSize: 13, bold: true, color: 'F59E57', charSpacing: 2 });
  s.addText('One test, two screens: a RoadSide job from the agent portal to the driver\'s phone', { placeholder: 'title' });
  s.addText('How TC-23-001 tests the whole job end to end - web and provider app together, recorded as one video', { placeholder: 'body' });
  box(s, { x: M, y: 6.2, w: 10, h: 0.4, text: 'APAC Aspire Digital  |  21 October 2026  |  measured on RSA UAT, 20 Oct 2026 run', fontSize: 12, color: '8FA6BF' });
  s.addNotes('One automated test now covers a roadside job from the moment the agent creates it on the portal until the driver finishes it on the phone and the portal shows it closed. This deck shows how it works and what it covers.');
}

// ---------- 2. answer up front ----------
{
  const s = content('One automated run now tests the whole job hand-off', 'Summary');
  const stats = [
    ['PASS', 'TC-23-001 on 20 Oct 2026, job 26JB049153', C.accent3],
    ['9', 'steps across web and app, one pass/fail', C.accent1],
    ['4.5 min', 'test time for the full job', C.accent2],
    ['1 video', 'portal left, phone right, same run', C.text2],
  ];
  stats.forEach(([big, small, col], i) => {
    const x = M + i * 3.07;
    box(s, { x, y: 1.65, w: 2.85, h: 1.0, text: big, fontSize: 44, bold: true, color: col });
    box(s, { x, y: 2.7, w: 2.7, h: 0.7, text: small, fontSize: 13, color: C.accent4 });
  });
  card(s, { x: M, y: 3.85, w: W - 2 * M, h: 2.55, head: 'What it proves', body: [
    { text: 'A job created and dispatched on the agent portal reaches a real provider app, is taken, travelled to, arrived at, photographed and finished - and the portal shows every one of those events, stamped by the right truck.', options: { breakLine: true } },
    { text: ' ', options: { breakLine: true, fontSize: 6 } },
    { text: 'Before this, web and app were tested separately. The hand-off between them - where real jobs get stuck - had no automated check.', options: { color: C.accent4 } },
  ], bodySize: 15 });
  s.addNotes('Four numbers to remember. It passed on 20 October against UAT. Nine steps that alternate between the portal and the phone. About four and a half minutes. And one side-by-side video anyone can watch without reading code.');
}

// ---------- 3. why ----------
pres.addSection({ title: 'How it works' });
{
  const s = content('Why test them together: a job is never only web or only app', 'How it works');
  const nodes = [
    ['Agent portal', 'Create job, Load Provider, Dispatch', C.accent1, 'WEB'],
    ['RSA server', 'api/pmws/* - offers the job to trucks nearby, stores every status', C.text2, null],
    ['Provider app', 'Take job, drive, Arrive, mileage, photo, Finish', C.accent2, 'APP'],
  ];
  nodes.forEach(([h, b, col, tag], i) => {
    const x = M + i * 4.2;
    s.addShape(pres.ShapeType.rect, { x, y: 1.7, w: 3.6, h: 1.8, fill: { color: C.background2 }, line: { color: col, width: 2 }, objectName: `node ${h}` });
    if (tag) pill(s, tag, x + 0.2, 1.88);
    box(s, { x: x + 0.2, y: tag ? 2.3 : 1.95, w: 3.2, h: 0.45, text: h, fontSize: 18, bold: true, color: col });
    box(s, { x: x + 0.2, y: tag ? 2.75 : 2.45, w: 3.2, h: 0.75, text: b, fontSize: 12.5 });
    if (i < 2) s.addShape(pres.ShapeType.rightArrow, { x: x + 3.66, y: 2.4, w: 0.48, h: 0.4, fill: { color: C.accent4 }, line: { color: C.accent4 } });
  });
  box(s, { x: M, y: 3.9, w: W - 2 * M, h: 0.4, text: 'Where jobs get stuck in real life - and what a web-only or app-only test cannot see', fontSize: 16, bold: true });
  const risks = [
    ['Job never reaches the truck', 'Wrong location, truck not Ready, outside the service area, polling broken.'],
    ['Status does not come back', 'Driver taps Take Job / Arrived / Finish, but the portal never shows it.'],
    ['Data lost on the way', 'Mileage, photo or the driver\'s GPS position missing on the job.'],
  ];
  risks.forEach(([h, b], i) => card(s, { x: M + i * 4.08, y: 4.45, w: 3.9, h: 1.95, head: h, body: b, color: C.accent2, headSize: 14, bodySize: 12.5 }));
  s.addNotes('The agent creates and dispatches on the portal; the driver does the rest on the phone; the server sits in between. Each side can pass its own tests and the job can still get stuck in the middle. That middle is what this test covers.');
}

// ---------- 4. journey ----------
{
  const s = content('The journey: nine steps, alternating between portal and phone', 'How it works');
  const steps = [
    ['APP', 'Driver signed in, truck v3036 chosen, Ready = On', '15.3 s'],
    ['WEB', 'Agent creates a Basic Repair job at the incident address', '11.5 s'],
    ['WEB', 'Load Provider, pick truck v3036, Dispatch', '6.6 s'],
    ['APP', 'Job card appears without refresh, 9.70 km away; Take Job', '13.4 s'],
    ['APP', 'Truck drives ~5 km by road to the customer (GPS points)', '50.8 s'],
    ['APP', 'Arrive at destination, enter odometer 48215', '5.1 s'],
    ['APP', 'Take a photo with the camera, upload', '36.5 s'],
    ['APP', 'Finish job', '9.8 s'],
    ['WEB', 'Job is CLOSED, timestamps stamped by the truck', '10.1 s'],
  ];
  const top = 1.55, rowH = 0.56;
  s.addShape(pres.ShapeType.line, { x: M + 0.21, y: top + 0.2, w: 0, h: rowH * 8, line: { color: C.accent5, width: 2 } });
  steps.forEach(([k, t, d], i) => {
    const y = top + i * rowH;
    s.addText(String(i + 1), { shape: pres.ShapeType.ellipse, x: M, y, w: 0.42, h: 0.42, margin: 0, fill: { color: k === 'APP' ? C.accent2 : C.accent1 }, color: C.background1, bold: true, fontSize: 12, align: 'center', valign: 'middle' });
    pill(s, k, M + 0.65, y + 0.06);
    box(s, { x: M + 1.45, y: y + 0.06, w: 6.6, h: 0.35, text: t, fontSize: 14 });
    box(s, { x: M + 8.1, y: y + 0.06, w: 0.9, h: 0.35, text: d, fontSize: 12, color: C.accent4, align: 'right' });
  });
  card(s, { x: 10.0, y: 1.55, w: W - M - 10.0, h: 4.85, head: 'One runner', body: [
    { text: 'All nine steps are one Playwright test. It drives the browser and, in the same test, the phone through Appium.', options: { breakLine: true } },
    { text: ' ', options: { breakLine: true, fontSize: 6 } },
    { text: 'If any step fails, the whole test fails - with the video and trace showing exactly where.', options: { breakLine: true } },
    { text: ' ', options: { breakLine: true, fontSize: 6 } },
    { text: 'No agent close step: Finish in the app closes the job.', options: { color: C.accent4 } },
  ], bodySize: 13 });
  s.addNotes('Times are from the 20 October run as shown in the Playwright report. The drive and the photo take longest because they are real: the GPS moves along the road and the camera actually captures and uploads.');
}

// ---------- 5. screenshot: job arrives ----------
{
  const s = content('Dispatch on the portal: the job reaches the phone in seconds', 'How it works');
  shot(s, 't30.png', { x: M, y: 1.5, w: 8.9, ratio: VID });
  callouts(s, [
    [1, 'Portal: job 26JB049153', 'Real Thai incident address, district, province; truck v3036 assigned and dispatched at 10:22.'],
    [2, 'Phone: job card, 9.70 km', 'The app polls the server while Ready. The job shows up without any tap, with the same job number.'],
    [3, 'Checked automatically', 'Same job number on both sides; distance on the card is more than 2 km (a real trip, not 0 km).'],
  ], { x: M + 9.2, y: 1.6, w: W - 2 * M - 9.2 });
  s.addNotes('A frame from the recorded video. Left is the agent portal right after dispatch; right is the phone a few seconds later. The test reads the job number on both and compares them.');
}

// ---------- 6. screenshot: arrive + mileage ----------
{
  const s = content('On the phone: drive, arrive, record mileage, like a real driver', 'How it works');
  shot(s, 't105.png', { x: M, y: 1.5, w: 8.9, ratio: VID });
  callouts(s, [
    [1, 'Truck moves by road', 'Emulator GPS steps every ~150 m from Victory Monument through Phaya Thai and Ratchaprasong to the customer.'],
    [2, 'Arrive + mileage 48215', 'The app asks for the odometer; the test types it and confirms, exactly as a driver taps.'],
    [3, 'Then photo and Finish', 'Emulator camera takes a real photo, it uploads, and the driver finishes the job.'],
  ], { x: M + 9.2, y: 1.6, w: W - 2 * M - 9.2 });
  s.addNotes('The app is the real installed UAT build, not a mock. Appium taps the same buttons a driver would. GPS is simulated along a real road route, so the ETA and distance the app shows are real Google directions.');
}

// ---------- 7. screenshot: web shows results ----------
{
  const s = content('Back on the portal: every driver action is there, stamped by the truck', 'How it works');
  shot(s, 't165.png', { x: M, y: 1.5, w: 8.9, ratio: VID });
  callouts(s, [
    [1, 'ACCEPT: ~5 km away', 'GPS 13.7649, 100.5383 - where the truck really was when it took the job, not on top of the customer.'],
    [2, 'REACH + COMPLETE', 'At the customer point. Truck v3036 and the driver name on each row; status CLOSED.'],
    [3, 'KPI: Pass on all three', 'Accept, Reach and Complete within the expected times; reach distance 7.0 km.'],
  ], { x: M + 9.2, y: 1.6, w: W - 2 * M - 9.2 });
  s.addNotes('This is the proof the hand-off worked in both directions. The portal shows three timestamps, each written by the truck, with the GPS position at that moment. The test checks the order of the timestamps, the mileage, the photo count and the closed status.');
}

// ---------- 8. architecture ----------
{
  const s = content('Under the hood: one Playwright test drives the browser and the phone', 'How it works');
  const lane = (y, kind, chain, col) => {
    pill(s, kind, M, y + 0.35);
    chain.forEach(([h, b], i) => {
      const x = M + 0.9 + i * 2.75;
      s.addShape(pres.ShapeType.rect, { x, y, w: 2.45, h: 1.0, fill: { color: C.background2 }, line: { color: col, width: 1.5 }, objectName: `${kind} ${h}` });
      box(s, { x: x + 0.12, y: y + 0.1, w: 2.25, h: 0.35, text: h, fontSize: 13, bold: true, color: col });
      box(s, { x: x + 0.12, y: y + 0.45, w: 2.25, h: 0.5, text: b, fontSize: 10.5 });
      if (i < chain.length - 1) s.addShape(pres.ShapeType.rightArrow, { x: x + 2.48, y: y + 0.38, w: 0.24, h: 0.24, fill: { color: C.accent4 }, line: { color: C.accent4 } });
    });
  };
  box(s, { x: M, y: 1.45, w: 12, h: 0.35, text: 'TC-23-001.spec.ts  -  one test, one report, one pass/fail', fontSize: 14, bold: true, color: C.text2 });
  lane(1.95, 'WEB', [['Playwright', 'Chromium, records web video + trace'], ['Agent portal', 'roadside-uat, page objects JobPage.ts'], ['RSA server', 'job, dispatch, read job model'], ['Assertions', 'status, timestamps, mileage, photo']], C.accent1);
  lane(3.2, 'APP', [['WebdriverIO', 'remote() session in the same test'], ['Appium 2', 'UiAutomator2, taps by test ids'], ['Android emulator', 'UAT app, GPS route, camera'], ['RSA server', 'api/pmws: whenready, job/{id}']], C.accent2);
  const tools = [
    ['Test ids in the app', 'The app ships ~229 ids; tests click by id, not by screen position or text, so Thai/English and layout changes do not break them.'],
    ['ffmpeg side-by-side', 'Web video and phone recording are joined into one MP4 after the run. Nothing to install.'],
    ['Self-healing setup', 'If the truck is not Ready, not bound, or holds a job from an aborted run, the test fixes it first.'],
  ];
  tools.forEach(([h, b], i) => card(s, { x: M + i * 4.08, y: 4.6, w: 3.9, h: 1.8, head: h, body: b, color: C.text2, headSize: 14, bodySize: 11.5 }));
  s.addNotes('Both lanes are inside one test function. Playwright owns the browser. In the same test, WebdriverIO opens an Appium session to the Android emulator running the real UAT app. Both talk to the same RSA UAT server, so what one does, the other must see.');
}

// ---------- 9. realism ----------
{
  const s = content('Made to look like a real call, not a lab shortcut', 'How it works');
  const rows = [
    ['Before', 'Now (20 Oct run)'],
    ['Truck GPS set on the incident point: distance 0 km', 'Truck starts ~5 km away at Victory Monument'],
    ['Phone teleports to the customer', 'Drives the road route, a GPS point every ~150 m'],
    ['Placeholder customer details', 'Thai address, district, province, licence plate, location note, service condition'],
    ['Odometer 12345', 'Odometer 48215'],
    ['Distance not checked', 'Card shows 9.70 km, web distanceKm 7 - both asserted > 2 km'],
  ];
  s.addTable(rows.map((r, i) => r.map((t, j) => ({
    text: t,
    options: i === 0
      ? { bold: true, color: C.background1, fill: { color: j === 0 ? C.accent4 : C.accent2 }, fontSize: 13 }
      : { color: C.text1, fill: { color: i % 2 ? C.background2 : C.background1 }, fontSize: 12.5 },
  }))), { x: M, y: 1.5, w: 7.6, colW: [3.3, 4.3], rowH: 0.5, border: { type: 'solid', pt: 0.5, color: HEX.accent5 }, margin: 0.08 });
  card(s, { x: M + 8.0, y: 1.5, w: W - 2 * M - 8.0, h: 4.9, head: 'The server rule we test against', body: [
    { text: 'The app does not get a push. While Ready, it asks the server every few seconds: "any job for me here?" (whenready).', options: { breakLine: true } },
    { text: ' ', options: { breakLine: true, fontSize: 6 } },
    { text: 'The server offers a job only if the truck is within the service area (10 km in the first minute, then 20 km), measured by Google road distance - or if the agent dispatched to that exact truck.', options: { breakLine: true } },
    { text: ' ', options: { breakLine: true, fontSize: 6 } },
    { text: 'So the test places the truck inside that area but far enough to be a real trip.', options: { color: C.accent4 } },
  ], color: C.accent2, bodySize: 12.5 });
  s.addNotes('The first version put the phone exactly on the incident point, so the distance was zero and it did not look like a real job. Now the truck starts five kilometres away and drives there, and the test checks the distance on both sides.');
}

// ---------- 10. checks ----------
pres.addSection({ title: 'Coverage' });
{
  const s = content('What is checked at each hand-off', 'Coverage');
  const rows = [
    ['Hand-off', 'Driver does (app)', 'Portal / server must show (web)'],
    ['Dispatch → phone', 'Job card appears, same job number', 'Truck VIN on the job, dtRequest set'],
    ['Take job', 'Taps Take Job (ACCEPT)', 'dtAccept; timestamp row with truck + GPS'],
    ['Travel', 'GPS moves along the road', 'distanceKm > 2; card distance > 2 km'],
    ['Arrive', 'Arrive + odometer 48215 (REACH)', 'dtReach; mileage = 48215'],
    ['Photo', 'Camera photo, upload', 'nPhoto = 1'],
    ['Finish', 'Finish job (COMPLETE)', 'Status CLOSED; dtRequest < dtAccept < dtReach < dtComplete'],
  ];
  s.addTable(rows.map((r, i) => r.map((t, j) => ({
    text: t,
    options: i === 0
      ? { bold: true, color: C.background1, fill: { color: [C.text2, C.accent2, C.accent1][j] }, fontSize: 13 }
      : { color: C.text1, bold: j === 0, fill: { color: i % 2 ? C.background2 : C.background1 }, fontSize: 13 },
  }))), { x: M, y: 1.5, w: W - 2 * M, colW: [2.4, 4.3, 5.43], rowH: 0.56, border: { type: 'solid', pt: 0.5, color: HEX.accent5 }, margin: 0.1 });
  box(s, { x: M, y: 5.75, w: W - 2 * M, h: 0.6, text: 'The web checks read the job straight from the portal\'s own data, so they prove what an agent would see - not just what the app thinks it sent.', fontSize: 13, color: C.accent4 });
  s.addNotes('Every row is an assertion in the test. Left is what the driver does, right is what must appear on the portal. If the app says it sent REACH but the portal has no dtReach, the test fails.');
}

// ---------- 11. evidence ----------
{
  const s = content('Evidence from every run: a report developers can open and replay', 'Coverage');
  shot(s, 'report-test.png', { x: M, y: 1.5, w: 6.2, ratio: 1300 / 1000 });
  const items = [
    ['Playwright HTML report', 'Every step with pass/fail and time; job number and distances as annotations.'],
    ['Side-by-side video', 'Portal left, phone right, one MP4 - for managers and BAs.'],
    ['Trace', 'Every portal click, network call and page snapshot - for developers to replay a failure.'],
    ['junit.xml', 'For a CI dashboard later.'],
  ];
  items.forEach(([h, b], i) => card(s, { x: M + 6.6, y: 1.5 + i * 1.22, w: W - 2 * M - 6.6, h: 1.1, head: h, body: b, color: C.accent1, headSize: 14, bodySize: 11.5 }));
  s.addNotes('This is the report from the 20 October run. Developers get it as a zip and open it with npx playwright show-report. Hosting it online: Amplify with a password does not work on company laptops because the browser policy blocks that login box; S3 with CloudFront and a login page is the option if we want a link.');
}

// ---------- 12. coverage ----------
{
  const s = content('How far it covers today - and what is still open', 'Coverage');
  card(s, { x: M, y: 1.5, w: 5.9, h: 3.0, head: 'Covered end to end (automated)', color: C.accent3, body: [
    { text: 'Create job, dispatch to a truck', options: { bullet: true, breakLine: true } },
    { text: 'Job offered to the app by location; Take Job', options: { bullet: true, breakLine: true } },
    { text: 'Travel, arrive, mileage, photo, finish', options: { bullet: true, breakLine: true } },
    { text: 'Portal shows CLOSED, timestamps, GPS, KPI', options: { bullet: true } },
  ], bodySize: 13.5 });
  card(s, { x: M + 6.23, y: 1.5, w: 5.9, h: 3.0, head: 'Not covered yet', color: C.accent2, body: [
    { text: 'Driver rejects / agent cancels (TC-23-002, catalogued)', options: { bullet: true, breakLine: true } },
    { text: 'Towing job (second destination)', options: { bullet: true, breakLine: true } },
    { text: 'Several photos, offline and retry', options: { bullet: true, breakLine: true } },
    { text: 'Real phone: camera hardware, battery saver - manual release check', options: { bullet: true } },
  ], bodySize: 13.5 });
  const stats = [
    ['451', 'web regression cases catalogued; 347 fully automatable'],
    ['14', 'of the 104 partly-automatable web cases need the app or a truck - this runner is how they get done'],
    ['72', 'mobile app cases catalogued; 9 automated so far'],
  ];
  stats.forEach(([n, t], i) => {
    const x = M + i * 4.08;
    box(s, { x, y: 4.8, w: 1.4, h: 0.8, text: n, fontSize: 36, bold: true, color: C.accent1 });
    box(s, { x: x + 1.45, y: 4.88, w: 2.5, h: 1.3, text: t, fontSize: 12, color: C.text1 });
  });
  s.addNotes('The happy path of a repair job is fully covered. The next most valuable journeys are reject/cancel and towing. The catalogue numbers come from the regression workbooks on Confluence.');
}

// ---------- 13. cost + next ----------
pres.addSection({ title: 'Next' });
{
  const s = content('Where it runs, what it costs, and what we need decided', 'Next');
  card(s, { x: M, y: 1.5, w: 5.9, h: 4.9, head: 'Today', color: C.text2, body: [
    { text: 'Runs on a developer laptop: Android emulator (~4 GB RAM) + Appium + Playwright.', options: { bullet: true, breakLine: true } },
    { text: '~4.5 min test, ~8.6 min with setup. Each run creates and closes one [AUTO-TEST] job on UAT; never touches PROD.', options: { bullet: true, breakLine: true } },
    { text: 'Depends on shared UAT data: test truck v3036 free, OTP test number valid.', options: { bullet: true, breakLine: true } },
    { text: 'Normal CodeBuild containers cannot run the emulator (no nested virtualisation).', options: { bullet: true } },
  ], bodySize: 15.5 });
  card(s, { x: M + 6.23, y: 1.5, w: 5.9, h: 4.9, head: 'Next steps and decisions', color: C.accent2, body: [
    { text: 'Decide: where it runs before each release - a desktop runner (cheapest), an EC2 nested-virt instance, or a device farm.', options: { bullet: true, breakLine: true } },
    { text: 'Decide: a QA owner for fixed test data on UAT (truck, provider, OTP number).', options: { bullet: true, breakLine: true } },
    { text: 'Build TC-23-002 (reject / cancel) and a towing journey.', options: { bullet: true, breakLine: true } },
    { text: 'Publish the report and video with each release.', options: { bullet: true, breakLine: true } },
    { text: 'App team: login password visible in logcat on the UAT build; photo preview shows "Image not available".', options: { bullet: true } },
  ], bodySize: 15.5 });
  s.addNotes('The ask: pick where this runs before each release, and give QA ownership of the fixed UAT test data. With those two, the journey can run on every release and the next two journeys can be added.');
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log('wrote', OUT);
})();
