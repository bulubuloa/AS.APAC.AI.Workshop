# RoadSide Android app (ABMR "Aspire Partner") - automation

Placeholder. The APK and the test-case list are still to come; they are **not** a mirror of the web suite.

- Drop the flavour APK (`com.aspire.partner.sit` / `.uat`) into `apk/` (git-ignored).
- The app is native Kotlin/Compose, not a WebView, so the runner will not be Playwright; the framework choice is
  a workshop output (Compose UI tests in-repo vs Maestro vs Appium).
- Evidence expectations are the same as `roadside-web/`: recording + screenshots per case, one report per run.
