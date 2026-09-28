// Deck 2 - Mobile automation with Appium + WebdriverIO, built on the real suite in ../roadside-android
const k = require('./deck-kit');

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
    kicker: 'The test speaks WebDriver; Appium translates it into Android automation on the device',
  });
  k.flow(s, [
    { text: 'Spec file\n(TypeScript)' },
    { text: 'WebdriverIO\nrunner' },
    { text: 'Appium server\n(HTTP, W3C)', highlight: true },
    { text: 'UiAutomator2\ndriver' },
    { text: 'Emulator or\nreal device' },
  ], { y: top, h: 1.05 });

  k.bullets(s, [
    { text: 'Appium is a server, not a library', sub: 'The test sends WebDriver commands over HTTP; the uiautomator2 driver executes them through Android’s own instrumentation' },
    { text: 'The app is installed, not rebuilt', sub: 'Point it at an APK or a package name; the same spec runs on an emulator or a plugged-in handset with one env variable' },
    { text: 'Everything is a capability', sub: 'autoGrantPermissions handles the location and notification prompts; clearApp resets state between tests' },
    { text: 'It is the same mental model as the web suite', sub: 'Page objects, locators, expect() with waiting - only the selector syntax changes' },
  ], { y: top + 1.5, size: 14.5 });
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

/* 10 - environment findings */
{
  const { s, top } = k.contentSlide(pptx, {
    title: 'What the environment cost us',
    kicker: 'The real work was not writing tests - it was making a corporate laptop run a device at all',
  });
  k.bullets(s, [
    { text: 'The emulator could not resolve DNS', sub: 'Every call failed with UnknownHostException. The network was fine - Wi-Fi up, gateway reachable, raw TCP to 443 working. Only DNS over UDP 53 through QEMU’s forwarder was blocked' },
    { text: 'ping proved nothing and sent us the wrong way', sub: 'QEMU’s user-mode networking does not forward ICMP at all, so "Network is unreachable" was a red herring; Android also hides the default route in a per-network table' },
    { text: 'Fix: resolve names on the host instead', sub: 'A 40-line proxy on the laptop plus one setting on the device. No root, no image swap, no physical handset' },
    { text: 'Android’s captive-portal check hijacked the run', sub: 'It opened Chrome over the proxy, hit a certificate error and covered the app mid-test - now disabled on the emulator' },
  ], { y: top, size: 14 });
  k.code(s, {
    y: top + 3.55, h: 0.95, size: 12,
    lines: [
      'npm run proxy                                           # on the laptop',
      'adb shell settings put global http_proxy 10.0.2.2:8888  # on the device',
    ],
    caption: 'Worth knowing before the workshop: budget setup time for any new machine.',
  });
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
    title: 'Building it with an AI agent',
    kicker: 'Same agent, same day, as the web suite - a different kind of problem',
  });
  k.bullets(s, [
    { text: 'It read the app source to find the truth', sub: 'The OTP screen’s two states and the exact rule isValidPhone - length == 10 - came from OtpViewModel.kt, not from trial and error' },
    { text: 'It diagnosed the environment instead of guessing', sub: 'Wi-Fi state, routing tables, raw TCP - it proved DNS was the only failure and built the proxy that fixed it' },
    { text: 'It found the bug the green test was hiding', sub: 'Once login succeeded, the app remembered the session and the second test never saw the login screen - clearApp now runs before each test' },
    { text: 'It designed the OTP read-back end to end', sub: 'New API in ABMB, config flag, deploy check on UAT, client helper with a stale-code guard - and wrote down why each piece exists' },
  ], { y: top, size: 14 });
  k.stats(s, [
    { value: '~4 h', label: 'zero to a full OTP login, including the environment fight' },
    { value: '3', label: 'green checks on the real APK' },
    { value: '1', label: 'backend endpoint designed, built and deployed' },
    { value: '2 lines', label: 'the app change that made selectors stable' },
  ], { y: top + 3.7 });
}

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
      title: 'Decisions we kept',
      color: k.C.accent,
      items: [
        'Which phone number may receive a real SMS on every run',
        'That the SMS endpoint is gated by a flag and never enabled on production',
        'Which account is safe to bind and re-bind on UAT',
        'Whether a failure is the test, the app or the environment',
        'Code review before anything merges - it is application code',
      ],
    },
    right: {
      title: 'Guard rails that mattered',
      color: k.C.good,
      items: [
        'No production writes, ever',
        'Credentials only in a git-ignored .env',
        'Phone numbers masked in every log and report',
        'Test data prefixed [AUTO-TEST] so it is obvious and cleanable',
        'Findings written into the README, not left in a chat log',
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
