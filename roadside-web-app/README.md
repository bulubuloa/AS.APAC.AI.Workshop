# RoadSide web + provider app - one journey, one video

Runs a job end to end across the **agent portal** (Playwright, UAT) and the **provider app** on a **local Android
emulator** (Appium), and attaches one side-by-side video (web left, phone right) to the Playwright report.
Credentials come from `../roadside-web/.env` and `../roadside-android/.env` (both git-ignored); nothing new to fill.

| Case | Journey | Status |
|---|---|---|
| TC-23-001 | web creates job -> sets location -> Load Provider -> selects truck -> Dispatch; app gets the job (polls `whenready`) -> Take Job -> Arrive + mileage -> photo -> Finish; web shows CLOSED with ACCEPT/REACH/COMPLETE by the truck | passing, ~4 min |

## Run

```bash
npm install                                     # behind Zscaler: NODE_EXTRA_CA_CERTS=~/.aws/ca-bundle.pem npm install
emulator -avd Medium_Phone_API_36 -camera-back emulated -camera-front none   # virtualscene camera + screen recording crashed the emulator
adb shell 'svc wifi enable; cmd wifi connect-network AndroidWifi open'      # Wi-Fi is sometimes off after boot -> "Network is unreachable"
node ../roadside-android/tools/dns-proxy.js     # terminal 1 (see roadside-android README)
adb shell settings put global http_proxy 10.0.2.2:8888
npx appium --port 4723 --relaxed-security       # terminal 2, wait for "listener started" (~1-2 min)
npm test
npm run report                                  # attachment "web-and-app (side by side).mp4"
```

- The app keeps its device binding between runs (`noReset`); only a fresh bind sends an OTP SMS to `PMWS_TEST_MOBILE`.
- A job left half-done by an aborted run is finished automatically at the start, so the truck is free.
- The emulator GPS and the job's incident location are set to the same point, so the truck shows on the job map.
- Each run creates one `[AUTO-TEST]` job on UAT and closes it.
