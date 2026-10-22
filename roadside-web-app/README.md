# RoadSide web + provider app - one journey, one video

Runs a job end to end across the **agent portal** (Playwright, UAT) and the **provider app** on a **local Android
emulator** (Appium), and attaches one side-by-side video (web left, phone right) to the Playwright report.
Credentials come from `../roadside-web/.env` and `../roadside-android/.env` (both git-ignored); nothing new to fill.

| Case | Journey | Status |
|---|---|---|
| TC-23-001 | web creates job -> sets location -> Load Provider -> selects truck -> Dispatch; app gets the job ~5 km away (polls `whenready`) -> Take Job -> truck drives there (emulator GPS) -> Arrive + mileage -> photo -> Finish; web shows CLOSED with ACCEPT/REACH/COMPLETE by the truck | passing, ~4.5 min |
| TC-23-003 | admin creates a High announcement and publishes it (R0001 auto-approves) -> list shows Approved/Active -> `api/pmws/announcements` contains it -> app News tab shows it, Home shows the high-priority banner -> admin unticks Active -> gone from the app | written 22 Oct 2026, not run yet |

## Run

```bash
npm install                                     # behind Zscaler: NODE_EXTRA_CA_CERTS=~/.aws/ca-bundle.pem npm install
emulator -avd Medium_Phone_API_36 -camera-back emulated -camera-front none   # virtualscene camera + screen recording crashed the emulator
adb shell 'svc wifi enable; cmd wifi connect-network AndroidWifi open'      # Wi-Fi is sometimes off after boot -> "Network is unreachable"
node ../roadside-android/tools/dns-proxy.js     # terminal 1 (see roadside-android README)
adb shell settings put global http_proxy 10.0.2.2:8888
npx appium --port 4723 --relaxed-security       # terminal 2 (other port: APPIUM_PORT=4724 npm test), wait for "listener started" (~1-2 min)
npm test
npm run report                                  # attachment "web-and-app (side by side).mp4"
```

### macOS

Same steps; differences:
- SDK path: `~/Library/Android/sdk` is found automatically (or set `ANDROID_HOME`). Put `$ANDROID_HOME/emulator` and `platform-tools` on PATH for the commands above.
- Create the AVD once in Android Studio: Pixel / Medium Phone, API 36, **Google Play** image (arm64 on Apple silicon), then `adb install -r ../roadside-android/apk/app.apk` (APK is git-ignored - copy it over).
- DNS proxy + `http_proxy` are only needed when the network blocks the emulator's DNS (UDP 53). Off the corporate network skip both, and clear any old proxy with `adb shell settings put global http_proxy :0`.
- Copy the two git-ignored `.env` files (`roadside-web/.env`, `roadside-android/.env`) from the Windows machine.
- Caption font defaults to Arial Bold; override with `CAPTION_FONT=/path/font.ttf`.
- Run one journey: `npx playwright test TC-23-003`.

- The app keeps its device binding between runs (`noReset`); only a fresh bind sends an OTP SMS to `PMWS_TEST_MOBILE`.
- A job left half-done by an aborted run is finished automatically at the start, so the truck is free.
- Real-looking call: the car breaks down on Ratchadamri Rd (Lumphini Park), the truck starts ~5 km away at Victory Monument,
  and after Take Job the emulator GPS drives there by road (`ProviderApp.drive`). The job card shows the road distance
  (9.7 km on 20 Oct 2026) and the web `distanceKm` must be > 2. Keep the start within 10 km so Load Provider still lists the truck.
- Thai form values: province is the option value `กทม.`, district/address in Thai, as agents type them.
- Each run creates one `[AUTO-TEST]` job on UAT and closes it.
- TC-23-003 publishes to **every** UAT provider app (announcements have no targeting); the test always unticks Active at the end, even on failure.
- The side-by-side video has a caption bar naming each step; step timings are attached as `steps.json`.
