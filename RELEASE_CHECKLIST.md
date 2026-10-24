# Release readiness checklist

This document is the release gate for Learning Everyday. A green unit-test workflow is necessary but is not sufficient for release.

## Automated gate

- [ ] GitHub Actions passes on the exact candidate commit.
- [ ] PWA manifest parses and every declared local icon exists.
- [ ] Every local service-worker app-shell asset exists.
- [ ] Every local resource referenced by the entry HTML exists.
- [ ] Service-worker cache name is versioned and remains in the app's cache namespace.

Run locally with Node.js 20 or newer:

```sh
npm test
```

## Manual device acceptance

- [ ] Install from HTTPS on Android Chrome; verify app name, icon, splash/background and standalone launch.
- [ ] Open once online, then enable airplane mode and relaunch. Verify home, Skills & Levels, lesson content and saved progress.
- [ ] Rotate between portrait and landscape; verify no clipped controls or horizontal overflow at narrow widths.
- [ ] Test English/Myanmar toggle, saved language, exercise completion, progress export and clear-progress confirmation.
- [ ] Test Reading word lookup, Listening play/pause/resume/stop, speech-rate control, Writing draft persistence and Speaking fallback when browser recognition is unavailable.
- [ ] PDF upload/read-aloud is intentionally hidden in this version; do not treat it as a supported release feature.
- [ ] Test storage denied/full, missing speech voices, repeated taps, navigation during speech, and reload during offline use.
- [ ] Check keyboard navigation, visible focus, screen-reader names, contrast, reduced-motion behavior and touch targets.
- [ ] Confirm no lesson text, PDF contents, or learning progress is sent to a server unexpectedly.

## Android package gate

- [ ] Choose and document the Android packaging route (for example, Capacitor).
- [ ] Build a debug APK from the release candidate and install it on a physical Android device.
- [ ] Verify offline startup, navigation, rotation, system back behavior, TTS availability and local persistence in the packaged app.
- [ ] Build a signed release artifact; protect signing keys and never commit secrets.
- [ ] Record package ID, version name/code, minimum Android version, permissions, artifact checksum and rollback plan.

## Release decision

Do not label the app production-ready or publish an APK until the automated gate and applicable manual/device gates have evidence. Known limitations must be stated in the store listing, especially that browser speech recognition may need internet and scanned-PDF OCR is not included.
