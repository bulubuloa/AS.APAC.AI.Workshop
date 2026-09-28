// Deck 1 - Web automation with Playwright, built on the real RSA/GAN suite in ../roadside-web
const k = require('./deck-kit');

const pptx = k.newDeck({ title: 'Web Test Automation with Playwright', author: 'Hoang Quach' });

/* 1 - title */
k.titleSlide(pptx, {
  eyebrow: 'Vietnam 2026 - Engineering Working Sessions',
  title: 'Web Test Automation\nwith Playwright',
  subtitle: 'A runnable smoke suite for the RoadSide agent portal (MSU), built and verified against the live UAT environment.',
  meta: 'Day 2 - QA automation working lab   |   Hoang Quach   |   RSA / GAN on roadside-uat.aspireasia.net',
});

/* 2 - why */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'Why automate the web portal',
    kicker: 'What the manual regression currently costs us',
  });
  k.columns(s, {
    y: top,
    left: {
      title: 'Today - manual',
      color: k.C.bad,
      items: [
        'Every release, QA re-checks the same journeys by hand',
        'Regressions are found late, often after deployment',
        'Evidence is a screenshot pasted into a ticket',
        'Nobody re-tests the boring paths under time pressure',
        'Knowledge lives in one tester’s head',
      ],
    },
    right: {
      title: 'With an automated suite',
      color: k.C.good,
      items: [
        'The same 13 checks run in about one minute',
        'A regression fails the run before QA ever sees it',
        'Evidence is produced automatically: trace, video, screenshot',
        'The suite is the written-down definition of "it still works"',
        'Anyone can run it - one command, no tribal knowledge',
      ],
    },
  });
  s.addText('Automation does not replace QA. It takes the repetitive regression pass off their plate so they can test what is actually new.', {
    x: k.M, y: 6.3, w: k.W - k.M * 2, h: 0.4, fontSize: 13, italic: true, color: k.C.muted, fontFace: 'Segoe UI',
  });
}

/* 3 - what is playwright */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'What is Playwright',
    kicker: 'An open-source browser automation framework from Microsoft',
  });
  k.bullets(s, [
    { text: 'One API drives Chromium, Firefox and WebKit', sub: 'Same test, three engines - and mobile-browser emulation for responsive checks' },
    { text: 'Auto-waiting is built in', sub: 'Every action waits for the element to be visible, stable and enabled - no sleep() calls, which is where flaky suites come from' },
    { text: 'Tests are TypeScript', sub: 'Same language and tooling as a front-end developer already uses; types catch selector mistakes before a run' },
    { text: 'Evidence is first class', sub: 'HTML report, video, screenshots and a trace viewer that replays the run step by step with the DOM at each point' },
    { text: 'Free and vendor-neutral', sub: 'No licence, no per-seat cost, no cloud dependency - it runs on a laptop and in CI the same way' },
  ], { y: top, size: 15.5 });
}

/* 4 - how it works, in plain language */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'How Playwright works',
    kicker: 'Think of it as a tester who never gets tired, never gets bored, and never forgets a step',
  });
  // left - the four steps we write down, in words and in the real one-liners
  s.addText('What we write down', {
    x: k.M, y: top, w: 5.2, h: 0.32,
    fontSize: 15, bold: true, color: k.C.ink, fontFace: 'Segoe UI',
  });

  const steps = [
    { n: 1, text: 'Type the user name into the box', code: "page.getByPlaceholder('User name').fill('admin.ko')" },
    { n: 2, text: 'Type the password', code: "page.getByPlaceholder('Password').fill('••••••')" },
    { n: 3, text: 'Press the Sign in button', code: "page.locator('#btnSignIn').click()" },
    { n: 4, text: 'Check we landed on the job list', code: "expect(page).toHaveURL(/msu\\/joblst/)" },
  ];
  steps.forEach((st, i) => {
    const y = top + 0.5 + i * 1.02;
    k.badge(s, { x: k.M, y: y + 0.02, n: st.n });
    s.addText(st.text, {
      x: k.M + 0.44, y, w: 4.8, h: 0.3,
      fontSize: 13.5, bold: true, color: k.C.ink, fontFace: 'Segoe UI',
    });
    s.addShape('roundRect', { x: k.M + 0.44, y: y + 0.34, w: 4.95, h: 0.42, fill: { color: k.C.codeBg }, line: { color: k.C.codeBg }, rectRadius: 0.05 });
    s.addText(st.code, {
      x: k.M + 0.56, y: y + 0.34, w: 4.75, h: 0.42,
      fontSize: 10, color: k.C.codeInk, fontFace: 'Consolas', valign: 'middle',
    });
  });

  // right - what that does on the real screen
  s.addText('What happens on the real site', {
    x: 6.15, y: top, w: 6.5, h: 0.32,
    fontSize: 15, bold: true, color: k.C.ink, fontFace: 'Segoe UI',
  });

  const f1 = k.browserFrame(s, { x: 6.15, y: top + 0.42, w: 6.55, h: 2.72, url: 'roadside-uat.aspireasia.net/auth/login' });
  k.field(s, { x: f1.x, y: f1.y + 0.3, w: 4.3, label: 'User name', value: 'admin.ko' });
  k.badge(s, { x: f1.x + 4.45, y: f1.y + 0.36, n: 1, d: 0.3 });
  k.field(s, { x: f1.x, y: f1.y + 1.06, w: 4.3, label: 'Password', value: '••••••' });
  k.badge(s, { x: f1.x + 4.45, y: f1.y + 1.12, n: 2, d: 0.3 });
  s.addShape('roundRect', { x: f1.x, y: f1.y + 1.72, w: 1.5, h: 0.42, fill: { color: k.C.accent }, line: { color: k.C.accent }, rectRadius: 0.05 });
  s.addText('Sign in', {
    x: f1.x, y: f1.y + 1.72, w: 1.5, h: 0.42,
    fontSize: 12, bold: true, color: k.C.white, align: 'center', valign: 'middle', fontFace: 'Segoe UI',
  });
  k.badge(s, { x: f1.x + 1.66, y: f1.y + 1.78, n: 3, d: 0.3 });

  s.addText('↓', {
    x: 6.15, y: top + 3.2, w: 6.55, h: 0.3,
    fontSize: 18, bold: true, color: k.C.muted, align: 'center', fontFace: 'Segoe UI',
  });

  const f2 = k.browserFrame(s, { x: 6.15, y: top + 3.45, w: 6.55, h: 1.45, url: 'roadside-uat.aspireasia.net/msu/joblst' });
  [0, 1, 2].forEach((i) => {
    s.addShape('rect', { x: f2.x, y: f2.y + 0.16 + i * 0.24, w: 3.3, h: 0.13, fill: { color: i ? 'E7E9ED' : 'CFD4DB' }, line: { color: i ? 'E7E9ED' : 'CFD4DB' } });
  });
  k.badge(s, { x: f2.x + 3.6, y: f2.y + 0.3, n: 4, d: 0.3, color: k.C.good });
  s.addText('Job list - as expected', {
    x: f2.x + 4.0, y: f2.y + 0.3, w: 2.0, h: 0.3,
    fontSize: 11.5, bold: true, color: k.C.good, valign: 'middle', fontFace: 'Segoe UI',
  });

  s.addText('Four written steps, run against the real site, with a video and screenshots kept as proof. Step 4 is the one that matters - it is where the test decides pass or fail.', {
    x: k.M, y: 6.88, w: k.W - k.M * 2, h: 0.35, fontSize: 12.5, italic: true, color: k.C.muted, fontFace: 'Segoe UI',
  });
}

/* 5 - section: our suite */
k.sectionSlide(pptx, {
  number: '01',
  title: 'What we built for RoadSide',
  blurb: 'Five features, thirteen checks, running against the live UAT portal - not a demo app.',
});

/* 6 - the suite */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'The suite: 5 features, 13 checks',
    kicker: 'ai-workshop/roadside-web - runs against roadside-uat.aspireasia.net',
  });
  k.table(s, {
    y: top,
    head: ['Feature', 'Checks', 'What it proves'],
    colW: [2.5, 0.9, 8.7],
    rows: [
      ['Login', '2', 'Valid sign-in reaches the job list; a wrong password stays put and shows the server message'],
      ['Client Dealer', '2', 'List filters by client and every row matches; detail opens with the same code and name'],
      ['Provider User', '2', 'List columns are intact; detail matches the row and carries the Mobile Provider flag'],
      ['Announcement', '3', 'List renders; a draft is created end to end; its detail shows title, status and content'],
      ['Job', '3', 'Search by id; detail opens from the list; a job is created through the full cascade'],
    ],
  });
  k.stats(s, [
    { value: '13', label: 'automated checks' },
    { value: '~1 min', label: 'full suite, serial' },
    { value: '2', label: 'records written per run' },
    { value: '546', label: 'lines of test code' },
    { value: '100%', label: 'passing on UAT' },
  ], { y: top + 2.9 });
  s.addText('Two cases write real data (one announcement, one job). Every free-text field is prefixed [AUTO-TEST] so the rows are obvious and cleanable.', {
    x: k.M, y: top + 4.35, w: k.W - k.M * 2, h: 0.4, fontSize: 12.5, italic: true, color: k.C.muted, fontFace: 'Segoe UI',
  });
}

/* 7 - structure */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'How the suite is organised',
    kicker: 'Page objects keep the selectors in one place, so a UI change is a one-line fix',
  });
  k.code(s, {
    y: top, h: 2.5,
    lines: [
      'roadside-web/',
      '  pages/          LoginPage, JobPages, DealerPages, ProviderPages, AnnouncementPages',
      '  tests/          auth.setup.ts + one spec per feature (01-login … 05-job)',
      '  playwright.config.ts   serial, trace/video/screenshot ON, HTML + JUnit + JSON reporters',
      '  .env            base URL, account, environment-specific ids   (git-ignored)',
      '  reports/        junit.xml, results.json        playwright-report/  index.html',
    ],
    caption: 'One spec per feature, one page object per screen - the shape a new joiner can guess.',
  });
  k.bullets(s, [
    { text: 'Environment values live in .env, never in the test', sub: 'Client ids, job ids and programs differ per environment - hard-coding them is why suites "work on my machine"' },
    { text: 'Credentials are git-ignored', sub: '.env.example is committed as the template; the real .env never leaves the laptop' },
  ], { y: top + 2.95, size: 14.5 });
}

/* 8 - example code */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'What a test actually looks like',
    kicker: 'TC02.2 - the dealer detail must match the row it was opened from',
  });
  k.code(s, {
    y: top, h: 3.5, size: 12.5,
    lines: [
      "test('TC02.2 dealer detail opens from the list with matching code and name', async ({ page }) => {",
      '  const list = new DealerListPage(page);',
      '  await list.goto();',
      "  await list.searchClient(CLIENT_ID);",
      '',
      '  const first = list.rows.first();',
      "  const code = (await first.locator('td:nth-child(4)').innerText()).trim();",
      "  const name = (await first.locator('td:nth-child(5)').innerText()).trim();",
      '',
      '  const detailPage = await list.openFirst();          // handles the new-tab link',
      '  const detail = new DealerEditPage(detailPage);',
      '  await expect(detail.code).toHaveValue(code);        // auto-waits, retries, then fails',
      '  await expect(detail.name).toHaveValue(name);',
      '});',
    ],
    caption: 'No sleeps, no manual waits. expect() polls until the condition holds or the timeout expires.',
  });
}

/* 9 - evidence */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'Evidence, produced automatically',
    kicker: 'Every test - passed or failed - records a trace, a video and a screenshot',
  });
  k.columns(s, {
    y: top,
    h: 3.3,
    left: {
      title: 'What each run produces',
      items: [
        'playwright-report/index.html - the run, test by test',
        'Trace viewer - replay each step with the DOM, network and console at that moment',
        'Video and screenshot per test',
        'reports/junit.xml for CI, results.json for reporting',
      ],
    },
    right: {
      title: 'Why it matters here',
      items: [
        'A failure comes with proof, not "it did not work"',
        'QA and developers look at the same artefact',
        'The trace shows the state before the failure, so no re-running to reproduce',
        'Acceptance evidence for a ticket is a by-product, not extra work',
      ],
    },
  });
  k.code(s, {
    y: top + 3.55, h: 0.95, size: 12,
    lines: [
      'npm test                 # 13 checks, ~1 minute',
      'npm run report           # opens the HTML report with traces and videos inline',
    ],
  });
}

/* 10 - what building it revealed */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'What writing the tests revealed',
    kicker: 'Automation against a live environment finds things a demo app never would',
  });
  // the biggest finding is a picture: you cannot create a job without walking this chain in order
  s.addText('To create one job, five dropdowns must be filled in this exact order:', {
    x: k.M, y: top, w: k.W - k.M * 2, h: 0.3,
    fontSize: 13.5, bold: true, color: k.C.ink, fontFace: 'Segoe UI',
  });
  k.flow(s, [
    { text: 'Client' },
    { text: 'Program' },
    { text: 'Customer tier' },
    { text: 'Privilege', highlight: true },
    { text: 'Service type' },
  ], { y: top + 0.36, h: 0.72, size: 13 });
  s.addText('Each one stays empty until the one before it is chosen - and if the privilege is missing, the job simply cannot be saved.', {
    x: k.M, y: top + 1.14, w: k.W - k.M * 2, h: 0.3,
    fontSize: 12, italic: true, color: k.C.muted, fontFace: 'Segoe UI',
  });

  k.table(s, {
    y: top + 1.62,
    head: ['What we found', 'Why it matters'],
    colW: [5.6, 6.49],
    rows: [
      [
        'Nobody had written that chain down',
        'A new developer or tester finds it out by failing. It is now in the test, so the next person inherits it',
      ],
      [
        'On UAT, only the four test programs can create a job',
        'Honda’s real programs have no privilege attached - so a test that "fails" there is a data problem, not a code problem',
      ],
      [
        'A rejected save still answers "OK"',
        'The real reason only appears in a pop-up. Easy for a person to miss, and it makes a failure look like the wrong thing',
      ],
      [
        'The dealer page cannot be edited at all',
        'The Save button was removed - that data comes from the CMS. We assumed it was editable; it is not',
      ],
    ],
  });

  s.addText('None of this was in a document. It came out of pointing the tests at the real system - which is the argument for doing it against UAT rather than a mock.', {
    x: k.M, y: 6.55, w: k.W - k.M * 2, h: 0.4, fontSize: 12.5, italic: true, color: k.C.muted, fontFace: 'Segoe UI',
  });
}

/* 11 - section: AI */
k.sectionSlide(pptx, {
  number: '02',
  title: 'How AI changed the effort',
  blurb: 'The suite was written by an AI agent driving the real application - measured, not estimated.',
});

/* 12 - AI speed */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'Building it with an AI agent',
    kicker: 'Claude Code, working in the repository and against the live UAT site',
  });
  k.flow(s, [
    { text: 'Read the\nMVC views' },
    { text: 'Derive the\nselectors' },
    { text: 'Write pages\n+ specs' },
    { text: 'Run against\nUAT', highlight: true },
    { text: 'Read failures,\nfix, re-run' },
  ], { y: top, h: 0.95 });

  k.bullets(s, [
    { text: 'It read the application, it did not guess', sub: 'Selectors came from JobLst.cshtml, Job.cshtml, DealerList.cshtml - real ids like #tbMain, #btnSearch, select[name="clientProgram"]' },
    { text: 'It probed the live app to answer its own questions', sub: 'When job creation failed with "Privilege is required", it enumerated every program/tier combination on UAT and found which ones actually have a privilege' },
    { text: 'Failures became knowledge, not guesswork', sub: 'Each red run was read, diagnosed and fixed; the reasons are written into the README so the next person does not rediscover them' },
  ], { y: top + 1.35, size: 14.5 });

  k.stats(s, [
    { value: '~2 h', label: 'from empty folder to 13 green checks' },
    { value: '13', label: 'checks, all verified on UAT' },
    { value: '3×', label: 'full-suite runs to prove stability' },
    { value: '1', label: 'flake found and fixed' },
  ], { y: top + 3.85 });
}

/* 13 - human vs AI */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'Where the human time still goes',
    kicker: 'The agent is fast at the mechanical work; judgement stays with us',
  });
  k.columns(s, {
    y: top,
    h: 3.8,
    left: {
      title: 'The agent is good at',
      color: k.C.good,
      items: [
        'Reading the application to find real selectors',
        'Writing page objects and specs in a consistent shape',
        'Running, reading the failure, fixing, re-running',
        'Probing the environment to answer factual questions',
        'Writing down what it learned so it is not lost',
      ],
    },
    right: {
      title: 'We still decide',
      color: k.C.accent,
      items: [
        'Which journeys matter enough to automate',
        'What counts as acceptable test data on a shared environment',
        'Whether a failure is a test bug or a product bug',
        'What may touch production, and what may never',
        'Review before anything is merged - same PR bar as any code',
      ],
    },
  });
  s.addText('The workshop point: the cost of an automated check has dropped far enough that "we do not have time to automate it" is no longer the real constraint.', {
    x: k.M, y: 6.3, w: k.W - k.M * 2, h: 0.4, fontSize: 13, italic: true, color: k.C.muted, fontFace: 'Segoe UI',
  });
}

/* 14 - CI */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'Running it in CI',
    kicker: 'The same command a developer runs is the command the pipeline runs',
  });
  k.code(s, {
    y: top, h: 2.2,
    lines: [
      '# any CI runner - CodeBuild, Bitbucket Pipelines, GitHub Actions',
      'npm ci',
      'npx playwright install --with-deps chromium',
      'npm test                       # retries once on CI, serial, ~1 minute',
      '',
      '# artefacts to keep: playwright-report/  reports/junit.xml',
    ],
    caption: 'JUnit XML is what a CI dashboard reads; the HTML report is what a human opens.',
  });
  k.bullets(s, [
    { text: 'Run on every pull request against the target branch, and nightly against UAT' },
    { text: 'A red suite blocks the merge - that is the whole point of the investment' },
    { text: 'Still to arrange: CI credentials and a stable non-production account that does not rotate' },
  ], { y: top + 2.75, size: 14.5 });
}

/* 15 - close */
k.closingSlide(pptx, {
  title: 'Where this goes next',
  points: [
    { text: 'Extend coverage to the journeys that hurt most when they break', sub: 'Dispatch, job status transitions, the Benefit redemption path' },
    { text: 'Put the suite in CI and make it a merge gate', sub: 'Needs CI permissions and a dedicated non-production account' },
    { text: 'Treat the test data problem as a first-class task', sub: 'UAT programs without privileges blocked job creation - seed data should be known and stable, not discovered by a failing test' },
    { text: 'Use the same pattern on the mobile app', sub: 'Different tool, same approach - see the mobile deck' },
  ],
  footer: 'ai-workshop/roadside-web   |   github.com/bulubuloa/AS.APAC.AI.Workshop   |   Hoang Quach - Vietnam 2026',
});

pptx.writeFile({ fileName: process.env.OUT ?? 'Web_Test_Automation_Playwright.pptx' }).then((f) => console.log('wrote', f));
