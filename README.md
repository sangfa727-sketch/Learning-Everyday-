# Learning Everyday

A mobile-first, offline-first English-learning Progressive Web App (PWA) for Myanmar learners.

## Current implementation

- Responsive app shell for phone and desktop screens.
- English/Myanmar interface toggle.
- Sample A1 reading story with keyboard-accessible word buttons.
- Local English definitions, example usage, and Myanmar meanings for a small starter vocabulary set.
- Conservative offline lookup for common inflected words (for example, `flowers` → `flower`).
- Device text-to-speech with speed controls and stop action; voice availability depends on the browser and installed voices.
- Local PDF text extraction (up to 15 MB and 50 pages), page-by-page reading, selectable word lookup, and device TTS; PDF bytes and extracted text are processed in memory on the device and are not uploaded. Scanned/image-only PDFs are detected and reported because OCR is not included.
- Writing practice with a Unicode-aware character counter and locally saved draft.
- Local persistence for interface language and writing draft, with storage failures handled safely.
- Optional browser speech-recognition practice where supported; it is not required for core use.
- PWA manifest, app icon, service worker, and app-shell caching.
- Zero-dependency Node.js unit tests and GitHub Actions test workflow.

## UI/UX design direction

- Calm premium visual language: deep forest green, warm off-white, muted botanical accents, generous whitespace, and restrained card elevation.
- Mobile-first skill cards with clear labels, consistent touch targets, selected states, and visible keyboard focus.
- Reading-first lesson panel with readable line-height, tap-to-define word controls, distinct audio controls, and a responsive speed selector.
- English/Myanmar labels for the new dashboard copy; existing controls remain connected to the same JavaScript IDs.
- Reduced-motion preference is respected. Typography uses system font fallbacks and does not require a remote font request, helping privacy and offline reliability.

## Architecture decisions

- **Vanilla JavaScript modules:** no build step or framework runtime is needed for the first milestone.
- **Local-first core:** lessons and the starter dictionary ship with the app. No paid AI API or server is required for reading, lookup, or writing practice.
- **PWA first, Android wrapper later:** keep learning logic in reusable modules so Capacitor can wrap the web UI for an Android APK if native features are needed. This repository does not yet include an APK build.
- **Privacy:** this version does not upload imported documents or learning data. Imported PDF support has not been implemented yet.
- **Offline boundary:** app-shell caching supports repeat visits after the first successful load over HTTPS or localhost. Device speech voices may still require OS-provided resources; do not promise that every voice works offline.

## Local development

Requires Node.js 20 or newer.

```sh
npm test
```

Serve the repository over localhost or HTTPS to test service-worker registration. Opening `index.html` directly using a `file://` URL will not enable the service worker.

## Planned milestones

1. [x] Establish mobile-first shell, bilingual toggle, sample reading, local dictionary lookup, device TTS, writing and optional speaking practice.
2. [x] Refine dashboard hierarchy, responsive skill cards, lesson controls, accessibility focus states, and offline-safe typography.
3. [x] Add app-shell caching, manifest, and baseline unit tests.
4. [ ] Verify CI and perform browser/device accessibility and offline smoke tests.
5. [ ] Add local PDF text extraction; explicitly detect and explain scanned/image-only PDFs.
6. [ ] Expand offline dictionary and structured beginner-to-advanced vocabulary, grammar, reading, and sentence lessons.
7. [ ] Add letter tracing, uppercase/lowercase writing, cursive and calligraphy practice.
8. [ ] Improve speaking practice with a clear capability boundary for browser speech recognition versus offline pronunciation support.
9. [ ] Add progress persistence and export/clear controls with privacy-conscious local storage.
10. [ ] Evaluate Capacitor packaging for Android APK after core PWA behavior is stable.

## Known limitations

- OCR, robust dictionary coverage, handwriting tracing, persistent progress, and APK packaging are not implemented yet. PDF parsing currently loads its library from a pinned CDN on first use, so the parser itself is not guaranteed to be available offline.
- Browser speech recognition may send audio to a browser/vendor service and may require internet; it is optional and is not advertised as an offline capability.
- The starter dictionary is a learning prototype, not a comprehensive dictionary.
- A PWA normally needs HTTPS for installation/service workers outside localhost. A separately packaged APK can be installed without a domain, but needs an Android build/signing and distribution workflow.

## Quality checks

GitHub Actions runs `npm test` on pushes to `main` and `feat/**`, and on pull requests targeting `main`.
