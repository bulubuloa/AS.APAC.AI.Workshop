# RoadSide Android app (ABMR "Aspire Partner") - Appium + WebdriverIO

Drives the **installed UAT APK** (`com.aspire.partner.uat`, black box - no app source needed) on an emulator or a
USB device. TypeScript, same evidence rule as the web suite: video + screenshot for every test, passed or failed.

## Setup

```bash
cd ai-workshop/roadside-android
npm install
cp .env.example .env          # fill PMWS_USER / PMWS_PASSWORD - .env is git-ignored
# put the flavour APK at apk/app.apk (git-ignored), then:
adb install -r apk/app.apk
```

Appium needs **Windows-style** paths - MSYS paths make the session fail with "Android SDK root folder does not exist":

```bash
export ANDROID_HOME='C:\Users\<you>\AppData\Local\Android\Sdk'
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-17.0.14.7-hotspot'
export MSYS_NO_PATHCONV=1     # or adb turns /sdcard/... into C:\Program Files\Git\sdcard\...
```

## Run

```bash
npm test          # starts Appium itself, runs tests/*.spec.ts
npm run report    # build reports/index.html from the run
npm run sms       # latest OTP SMS from UAT (see below)
```

Appium's uiautomator2 driver can take ~90s to load on this machine, longer than the wdio service waits
("Timeout: Appium did not start within expected time"). When that happens, run the server yourself:

```bash
npm run appium                 # terminal 1, wait for "Appium REST http interface listener started"
APPIUM_EXTERNAL=1 npm test     # terminal 2
```

Outputs: `reports/video/*.webm` (one per test), `reports/screenshots/*.png`, `reports/junit-0-0.xml`,
`reports/wdio-appium.log`.

## Test cases

| Case | What it proves | Status |
|---|---|---|
| TC01.1 valid credentials leave the login screen | login succeeds and the app navigates off `LoginActivity` | passing |
| TC01.2 a wrong password keeps the user on the login screen | rejected login stays on `LoginActivity` with Sign In visible | passing |
| TC02.1 sign in, pick a vehicle, confirm the OTP, land on the dashboard | the whole real login: credentials -> `vehlst` -> vehicle -> driver name + mobile -> `bindvehdev` -> OTP read back from `api/pmws/smslatest` -> `confirmvehdev` -> `MainActivity` | passing |

All three need the DNS proxy below. The OTP test needs `PMWS_TEST_MOBILE` in `.env`: **exactly 10 digits**, or the app
keeps Request OTP disabled and the tap is swallowed (`OtpViewModel.isValidPhone`); `OtpScreen` asserts the button is
enabled so that fails immediately instead of timing out. Each run sends a real SMS through the vendor, so use a
dedicated test number. The code is never read off a handset - `tools/pmws-sms.js` takes the highest `smsId` for that
number *before* the request and then polls `smslatest` for a newer row, so a stale OTP can never be picked up.

## OTP helper (`tools/pmws-sms.js`)

Login on the app sends an OTP by SMS. `GET /api/pmws/smslatest` (added in ABMB, commit `689dcec2`, gated by
`PMWS:enableSmsTestApi` + a provider JWT) returns the latest 5 `wlib.SMS` rows so a test can read it back:

```bash
node tools/pmws-sms.js              # latest 5
node tools/pmws-sms.js 0641632923   # one number
```

Phone numbers are masked in its output. **UAT sends the OTP in Thai** (`รหัส OTP 630367 สำหรับเลขอ้างอิง R3411`),
so the parser matches the digits after "OTP" in any locale, not the English wording.

## Test ids

The app now ships Compose `testTag`s exposed as resource-ids (`app_ID.apk`, built 23 Sep 2026), so the suite
selects by id instead of by class index or visible text - stable across layout changes and language switches:

| Element | resource-id |
|---|---|
| Screen root | `login_screen` |
| Username | `login_email_input` |
| Password | `login_password_input` |
| Sign In | `login_sign_in_button` |
| Version label | `login_version_text` |
| Language button | `login_language_button` |
| Call Back Office | `login_call_back_office_button` |

Before these existed the fields had to be addressed as `EditText.instance(0)/(1)` and `text("Sign In")`, which
broke on any reorder or language switch. **Still without an id:** the policy/consent screen - `acceptPolicyIfShown()`
matches its button text, so it needs one when that screen gets tagged.

## Known environment issues

- **The emulator cannot resolve DNS - run the proxy.** The app fails with
  `UnknownHostException: Unable to resolve host "partner-roadside-uat.aspireasia.net"` on a fresh emulator.
  The network itself is fine (Wi-Fi `AndroidWifi`, IP `10.0.2.16`, default route via `10.0.2.2`, and raw TCP to
  `1.1.1.1:443` succeeds); only **DNS over UDP 53** through QEMU's forwarder (`10.0.2.3`) is blocked on this
  corporate network. `ping` proves nothing here - QEMU's user-mode networking does not forward ICMP at all.

  Fix, no root needed - resolve names on the host instead:

  ```bash
  node tools/dns-proxy.js                                   # terminal 1, listens on 8888
  adb shell settings put global http_proxy 10.0.2.2:8888    # 10.0.2.2 is the host as seen by the guest
  # undo with: adb shell settings delete global http_proxy
  ```

  Things that did **not** help: `-dns-server`, `-feature -VirtioWifi`, `svc wifi disable/enable`, `-wipe-data`,
  Private DNS (DoT cannot bootstrap - it has to resolve its own hostname first). The Play Store image is a
  production build, so `adb root` is refused; a `google_apis` image would allow a `/etc/hosts` entry instead.
- First launch shows a **policy/consent screen** before login - the spec accepts it if present.
- Runtime permissions (location, notifications) are handled by `appium:autoGrantPermissions`.
- The emulator threw a **SystemUI ANR** on first boot; dismissing it is a one-off, not something the tests handle.
