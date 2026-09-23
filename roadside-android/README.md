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
| TC01.1 valid credentials leave the login screen | login succeeds and the app navigates off `LoginActivity` | **blocked** - needs emulator network (below) |
| TC01.2 a wrong password keeps the user on the login screen | rejected login stays on `LoginActivity` with Sign In visible | passing |

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

- **Emulator has no network on this machine.** `eth0` DOWN, `wlan0` NO-CARRIER, `Active default network: none`,
  and the app logs `UnknownHostException: Unable to resolve host "partner-roadside-uat.aspireasia.net"`. The host
  resolves the same name fine, so it is the emulator's virtual NIC, not DNS. Tried and did **not** fix it:
  `-dns-server 1.1.1.1`, `-feature -VirtioWifi`, `svc wifi disable/enable`, `-wipe-data`, an http_proxy setting.
  The Play Store image is a production build, so `adb root` / `ifconfig eth0 up` / `dhcptool eth0` are refused.
  Likely the corporate network filter (the host's DNS is 1.1.1.1 through the Zscaler tunnel) blocking QEMU's
  user-mode networking. Ways out: run on a **USB device** (`ANDROID_DEVICE=<serial>` in `.env`), or install the
  non-Play-Store `system-images;android-36;google_apis;x86_64` image, which is rootable and can be fixed from
  inside with `adb root; ifconfig eth0 up; dhcptool eth0`.
- First launch shows a **policy/consent screen** before login - the spec accepts it if present.
- Runtime permissions (location, notifications) are handled by `appium:autoGrantPermissions`.
- The emulator threw a **SystemUI ANR** on first boot; dismissing it is a one-off, not something the tests handle.
