// Deck 2 - Mobile automation with Appium + WebdriverIO, built on the real suite in ../roadside-android
const k = require('./deck-kit');
const shared = require('./shared-slides');

const pptx = k.newDeck({ title: 'Mobile Test Automation with Appium', author: 'Hoang Quach' });

/* 1 - title */
k.titleSlide(pptx, {
  eyebrow: 'Vietnam 2026 - Engineering Working Sessions',
  title: 'Mobile Test Automation\nwith Appium + WebdriverIO',
  subtitle: 'Driving the real Aspire Partner APK on a device - including the OTP login that was assumed to be un-automatable.',
  meta: 'Day 2 - QA automation working lab   |   Hoang Quach   |   com.aspire.partner.uat 2.0.20-uat',
});

/* 2 - the app */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'What we are testing',
    kicker: 'ABMR - the RSA provider app that drivers use in the field',
  });
  k.bullets(s, [
    { text: 'Native Android, Kotlin and Jetpack Compose', sub: 'Not a web view, not React Native - so browser tools like Playwright simply do not apply' },
    { text: 'It is the field-facing half of RoadSide', sub: 'Providers log in, receive jobs, change status, upload photos and stream their location' },
    { text: 'Every screen talks to the same backend as the portal', sub: 'ABMB BkkRsaPartner, routes api/pmws/* - so a contract change breaks both sides at once' },
    { text: 'Before this work: no automated coverage at all', sub: 'Two template tests and one Compose UI test; QA was entirely manual on the SIT/UAT flavour APKs' },
  ], { y: top, size: 15.5 });
  k.stats(s, [
    { value: '4', label: 'build flavours (sit/uat/preprod/prod)' },
    { value: '199', label: 'Kotlin source files' },
    { value: '18', label: 'API endpoints used' },
    { value: '0', label: 'automated tests before' },
  ], { y: top + 3.55 });
}

/* 3 - choosing the tool */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'Choosing the tool',
    kicker: 'The app is native, so the web stack is out - the real choice is how we drive the device',
  });
  k.table(s, {
    y: top,
    head: ['Option', 'Fit for the RSA app', 'Verdict'],
    colW: [2.6, 7.1, 2.4],
    rows: [
      ['Playwright', 'Browser only. Fine for the portal, cannot touch a native Compose screen', { text: 'Not applicable', color: k.C.bad }],
      ['Espresso / Compose UI test', 'Strong and fast, but lives inside the app build and needs the source per run', { text: 'Good for unit-level UI', color: k.C.warn }],
      ['Maestro', 'YAML flows, very quick to start, weaker reporting and a separate toolchain', { text: 'Viable alternative', color: k.C.warn }],
      ['Appium + WebdriverIO', 'Drives the installed APK as a black box; TypeScript, same reporting story as the web suite', { text: 'Chosen', color: k.C.good, bold: true }],
    ],
  });
  k.bullets(s, [
    { text: 'Black box matters: we test the APK QA actually installs, not a special build' },
    { text: 'Same language as the web suite, so one person maintains both and evidence looks identical' },
    { text: 'Appium is the W3C WebDriver standard applied to mobile - the skills and the CI shape transfer' },
  ], { y: top + 2.5, size: 14.5 });
}

/* 4 - how it works */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'How Appium works',
    kicker: 'Think of it as a tester holding the phone - tapping and typing on the real app, exactly as a driver would',
  });

  // left - the steps we write down, with the real one-liners
  s.addText('What we write down', {
    x: k.M, y: top, w: 5.2, h: 0.32,
    fontSize: 15, bold: true, color: k.C.ink, fontFace: 'Segoe UI',
  });

  const steps = [
    { n: 1, text: 'Type the user name', code: "$('login_email_input').setValue(user)" },
    { n: 2, text: 'Type the password', code: "$('login_password_input').setValue(pass)" },
    { n: 3, text: 'Tap Sign In', code: "$('login_sign_in_button').click()" },
    { n: 4, text: 'Check we left the login screen', code: "expect(currentScreen).not.toBe('Login')" },
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

  // right - the same thing happening on the phone
  s.addText('What happens on the phone', {
    x: 6.15, y: top, w: 6.5, h: 0.32,
    fontSize: 15, bold: true, color: k.C.ink, fontFace: 'Segoe UI',
  });

  const p1 = k.phoneFrame(s, { x: 6.15, y: top + 0.42, w: 3.9, h: 4.55, appName: 'RS UAT' });
  const ctrlW = p1.w - 0.52; // leave a lane on the right for the numbered badges
  k.field(s, { x: p1.x, y: p1.y + 0.42, w: ctrlW, label: 'Email / Username', value: 'banaprovider' });
  k.badge(s, { x: p1.x + p1.w - 0.3, y: p1.y + 0.49, n: 1, d: 0.3 });
  k.field(s, { x: p1.x, y: p1.y + 1.2, w: ctrlW, label: 'Password', value: '••••••' });
  k.badge(s, { x: p1.x + p1.w - 0.3, y: p1.y + 1.27, n: 2, d: 0.3 });
  s.addShape('roundRect', { x: p1.x, y: p1.y + 1.94, w: ctrlW, h: 0.5, fill: { color: k.C.accent }, line: { color: k.C.accent }, rectRadius: 0.06 });
  s.addText('Sign In', {
    x: p1.x, y: p1.y + 1.94, w: ctrlW, h: 0.5,
    fontSize: 12.5, bold: true, color: k.C.white, align: 'center', valign: 'middle', fontFace: 'Segoe UI',
  });
  k.badge(s, { x: p1.x + p1.w - 0.3, y: p1.y + 2.04, n: 3, d: 0.3 });

  s.addText('→', {
    x: 10.15, y: top + 2.3, w: 0.6, h: 0.4,
    fontSize: 22, bold: true, color: k.C.muted, align: 'center', fontFace: 'Segoe UI',
  });

  const p2 = k.phoneFrame(s, { x: 10.8, y: top + 0.42, w: 1.9, h: 4.55, appName: 'Jobs' });
  [0, 1, 2].forEach((i) => {
    s.addShape('roundRect', { x: p2.x, y: p2.y + 0.3 + i * 0.6, w: p2.w, h: 0.48, fill: { color: i ? 'EFF1F4' : 'E4F2E8' }, line: { color: i ? 'E4E6EA' : '7FB894' }, rectRadius: 0.05 });
  });
  k.badge(s, { x: p2.x + p2.w / 2 - 0.15, y: p2.y + 2.3, n: 4, d: 0.3, color: k.C.good });
  s.addText('Signed in', {
    x: p2.x - 0.1, y: p2.y + 2.72, w: p2.w + 0.2, h: 0.3,
    fontSize: 10.5, bold: true, color: k.C.good, align: 'center', fontFace: 'Segoe UI',
  });

  s.addText('The app is the one QA installs - we do not rebuild it for testing. The same four steps run on this emulator or on a phone plugged in by USB.', {
    x: k.M, y: 6.88, w: k.W - k.M * 2, h: 0.35, fontSize: 12.5, italic: true, color: k.C.muted, fontFace: 'Segoe UI',
  });
}

/* 5 - section: test ids */
k.sectionSlide(pptx, {
  number: '01',
  title: 'The selector problem - and the two-line fix',
  blurb: 'The single biggest factor in whether a mobile suite survives its first UI change.',
});

/* 6 - before/after ids */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'Compose ships no ids by default',
    kicker: 'What the first version of the suite had to do, and what changed',
  });
  k.columns(s, {
    y: top,
    h: 3.15,
    left: {
      title: 'Before - position and text',
      color: k.C.bad,
      items: [
        'Username: EditText.instance(0)',
        'Password: EditText.instance(1)',
        'Sign In: text("Sign In")',
        'Breaks the moment a field is reordered',
        'Breaks in Thai, Vietnamese, Korean or Malay',
        'UiSelector has no password() matcher, so even "the masked one" was not expressible',
      ],
    },
    right: {
      title: 'After - real ids',
      color: k.C.good,
      items: [
        'login_email_input',
        'login_password_input',
        'login_sign_in_button',
        'Survives layout changes and translation',
        'Reads like the screen it belongs to',
        '229 ids now cover every screen in the app',
      ],
    },
  });
  k.code(s, {
    y: top + 3.4, h: 1.15, size: 12,
    lines: [
      '// two lines in the app make every tag visible to the automation',
      'Modifier.testTag("login_email_input")',
      'Box(Modifier.semantics { testTagsAsResourceId = true }) { content() }   // once, in the theme',
    ],
    caption: 'Delivered in ABMR commit b589b43 - 58 files, 229 ids, no behaviour change.',
  });
}

/* 7 - section: OTP */
k.sectionSlide(pptx, {
  number: '02',
  title: 'The OTP problem',
  blurb: '"You cannot automate the login, it sends an SMS." - the assumption that blocked mobile automation.',
});

/* 8 - OTP flow */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'The real login is five steps, not one',
    kicker: 'Signing in is only the first - the device must then be bound to a vehicle by OTP',
  });
  k.flow(s, [
    { text: 'Credentials\nlogin' },
    { text: 'Pick a\nvehicle' },
    { text: 'Driver name\n+ mobile' },
    { text: 'OTP by SMS', highlight: true },
    { text: 'Confirm →\ndashboard' },
  ], { y: top, h: 1.0 });

  k.bullets(s, [
    { text: 'The blocker: step 4 leaves the app entirely', sub: 'The code is delivered by the SMS vendor to a handset - a test cannot read it, which is why the login was considered un-automatable' },
    { text: 'The fix: read it from where it is already recorded', sub: 'Every OTP is written to wlib.SMS in the RSA database before it is ever sent. A small, gated endpoint returns the latest rows' },
    { text: 'GET /api/pmws/smslatest - added to ABMB, deployed to UAT', sub: 'Needs a provider JWT and the PMWS:enableSmsTestApi flag, which exists only on SIT and UAT. Prod ships the code with the flag off' },
  ], { y: top + 1.45, size: 14.5 });

  k.code(s, {
    y: top + 3.5, h: 1.0, size: 12,
    lines: [
      'const before = await latestSmsId(MOBILE);          // baseline first',
      'await OtpScreen.requestFor(name, MOBILE);          // app calls bindvehdev',
      'const { otp } = await waitForOtp(MOBILE, before);  // poll for a NEWER row - never a stale code',
      'await OtpScreen.submitCode(otp);                   // app calls confirmvehdev',
    ],
  });
}

/* 9 - the suite */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'The suite today',
    kicker: 'ai-workshop/roadside-android - runs against the UAT APK on an API 36 emulator',
  });
  k.table(s, {
    y: top,
    head: ['Case', 'What it proves', 'Result'],
    colW: [3.4, 6.3, 2.4],
    rows: [
      ['TC01.1 valid login', 'Correct credentials leave the login screen', { text: 'passing', color: k.C.good }],
      ['TC01.2 wrong password', 'A rejected login stays put with Sign In visible', { text: 'passing', color: k.C.good }],
      ['TC02.1 full OTP login', 'Login → vehicle → phone → OTP from the API → confirm → dashboard', { text: 'passing', color: k.C.good }],
    ],
  });
  k.stats(s, [
    { value: '3', label: 'automated checks' },
    { value: '51 s', label: 'full OTP login, end to end' },
    { value: '229', label: 'ids available for the next cases' },
    { value: '0', label: 'handsets needed' },
  ], { y: top + 1.9 });

  k.bullets(s, [
    { text: 'Evidence per test, passed or failed: video, screenshot, JUnit XML and a one-page HTML report' },
    { text: 'Each test starts from a wiped app (clearApp + re-grant permissions) - a remembered session cannot mask a failure' },
    { text: 'Every screen past login is now reachable, so job list, job detail, announcements, vehicle and settings are next' },
  ], { y: top + 3.5, size: 14.5 });
}

/* 11 - section: AI */
k.sectionSlide(pptx, {
  number: '03',
  title: 'How AI changed the effort',
  blurb: 'Including the diagnosis that unblocked the whole environment.',
});

/* 12 - AI */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'By hand, or with the agent',
    kicker: 'The same three checks on the same APK - including the OTP login that was written off as impossible',
  });

  k.bars(s, [
    { label: 'Written by hand', value: 40, display: '~5 days', color: k.C.bad },
    { label: 'With the agent', value: 4, display: '~4 hours', color: k.C.good },
  ], { y: top, h: 0.8, gap: 0.4 });

  k.table(s, {
    y: top + 2.2,
    head: ['The same job, step by step', 'By hand', 'With the agent'],
    colW: [6.3, 2.9, 2.89],
    rows: [
      ['Get the tooling driving the app at all', '~1 day', '~30 min'],
      ['Work out how to identify each field', '~1 day', 'minutes - it read the app'],
      ['Make the OTP login automatable', '~2 days', '~1 hour'],
      ['Get the emulator onto the network', '~1 day', '~45 min'],
      ['Write the checks', 'half a day', '~30 min'],
    ],
  });

  s.addText('"By hand" is an estimate built from those five lines. "With the agent" was measured during the session - and excludes the team’s own time: adding the test ids to the app, reviewing the code and deploying it.', {
    x: k.M, y: top + 4.7, w: k.W - k.M * 2, h: 0.4,
    fontSize: 11.5, italic: true, color: k.C.muted, fontFace: 'Segoe UI',
  });
}

/* 12b - why it is faster (shared with the web deck) */
shared.whyFaster(pptx);

/* 13 - human vs AI */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'What still needs a person',
    kicker: 'The agent moved fast because the boundaries were explicit',
  });
  k.columns(s, {
    y: top,
    h: 3.8,
    left: {
      title: 'The agent does the work',
      color: k.C.good,
      items: [
        'Writes the tests and runs them on the device',
        'Reads what failed and fixes it',
        'Works out why the environment misbehaves',
        'Writes down what it learned',
      ],
    },
    right: {
      title: 'We still decide',
      color: k.C.accent,
      items: [
        'Which phone number may receive a real SMS on every run',
        'That the SMS endpoint stays switched off outside SIT and UAT',
        'Whether a failure is the test, the app or the environment',
        'Nothing merges without a review - it is application code',
      ],
    },
  });
  s.addText('The honest summary: the agent removed the typing and most of the debugging. It did not remove the need to know what "correct" means here.', {
    x: k.M, y: 6.3, w: k.W - k.M * 2, h: 0.4, fontSize: 13, italic: true, color: k.C.muted, fontFace: 'Segoe UI',
  });
}

/* 14 - recommendation */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'Recommendation for the mobile framework',
    kicker: 'The Day 2 decision the workshop is asked to record',
  });
  k.table(s, {
    y: top,
    head: ['Question', 'Answer', 'Evidence'],
    colW: [3.6, 4.3, 4.2],
    rows: [
      ['Browser, WebView or native?', 'Native Kotlin/Compose', 'No WebView in the app shell'],
      ['Framework for end-to-end?', 'Appium + WebdriverIO', '3 checks green on the real APK'],
      ['Framework for UI units?', 'Compose UI tests in ABMR', 'Already one exists (AnnouncementCardTest)'],
      ['Device coverage?', 'Emulator API 36 in CI, a handset for release checks', 'minSdk 26, targetSdk 36'],
      ['Blocker to close?', 'CI runner with an emulator and network', 'Local proxy workaround is a laptop fix, not a CI one'],
    ],
  });
  k.bullets(s, [
    { text: 'Keep the test ids maintained - treat a missing id as a review comment, the same as a missing test' },
    { text: 'Next proof task: job list and job detail, then the job status flow that matters most in the field' },
  ], { y: top + 2.85, size: 14.5 });
}

/* 15 - close */
k.closingSlide(pptx, {
  title: 'Where this goes next',
  points: [
    { text: 'Cover the job journey', sub: 'Job list → detail → status change → photo upload, using the ids that already exist' },
    { text: 'Get it into CI', sub: 'Needs a runner with an emulator and working DNS - the laptop proxy is a workaround, not a pipeline' },
    { text: 'Keep the SMS endpoint honest', sub: 'Flag stays off outside SIT and UAT; review it the day anyone proposes changing that' },
    { text: 'Hold the app side of the bargain', sub: 'New screens ship with test ids, or the suite goes back to guessing' },
  ],
  footer: 'ai-workshop/roadside-android   |   github.com/bulubuloa/AS.APAC.AI.Workshop   |   Hoang Quach - Vietnam 2026',
});

pptx.writeFile({ fileName: process.env.OUT ?? 'Mobile_Test_Automation_Appium.pptx' }).then((f) => console.log('wrote', f));
