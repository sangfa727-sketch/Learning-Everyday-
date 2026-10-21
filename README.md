# Learning Everyday

A mobile-first, offline-first English-learning Progressive Web App (PWA) for Myanmar learners.

## Current implementation

- Responsive app shell for phone and desktop screens.
- English/Myanmar interface toggle.
- Sample A1 reading story with keyboard-accessible word buttons.
- Topic-based vocabulary across 16 everyday categories (128 words), with Myanmar meanings and example sentences.
- Two distinct reading, listening, writing, and speaking exercises for every CEFR level from A1 to C2 (48 skill-level exercises total).
- Letter-writing studio with animated stroke guides for all 52 uppercase/lowercase letters, plus template tracing and print, cursive, and calligraphy guidance. Stroke paths are visual learning aids; learners should follow their school's preferred handwriting convention where it differs.
- Conservative offline lookup for common inflected words (for example, `flowers` → `flower`).
- Device text-to-speech with speed controls and stop action; voice availability depends on the browser and installed voices.
- Local PDF text extraction (up to 15 MB and 50 pages), page-by-page reading, selectable word lookup, and device TTS; PDF bytes and extracted text are processed in memory on the device and are not uploaded. Scanned/image-only PDFs are detected and reported because OCR is not included.
- Writing practice with a Unicode-aware character counter and locally saved draft.
- Local persistence for interface language and writing draft, with storage failures handled safely.
- Optional browser speech-recognition practice where supported; it is not required for core use.
- PWA manifest, app icon, service worker, and versioned app-shell caching for all local JavaScript modules, including locally stored progress.
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
- **Privacy:** imported documents and learning exercises are processed locally; the curriculum does not require a server or paid AI API.
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
4. [ ] Verify CI and complete manual browser/device accessibility, offline reload, and Android voice/rotation smoke tests.
5. [x] Add local PDF text extraction; explicitly detect and explain scanned/image-only PDFs.
6. [x] Add 16 everyday vocabulary categories and two exercises for each skill at every A1–C2 level; continue expanding topic coverage and grammar.
7. [ ] Expand animated stroke-order guides across the full alphabet and add interactive uppercase/lowercase, cursive, and calligraphy tracing.
8. [ ] Improve speaking practice with a clear capability boundary for browser speech recognition versus offline pronunciation support.
9. [x] Add privacy-conscious local progress persistence, JSON export, and an explicit-confirmation clear control.
10. [ ] Evaluate Capacitor packaging for Android APK after core PWA behavior is stable.

## Known limitations

- OCR, full-alphabet stroke-order animation, interactive handwriting tracing, persistent progress, and APK packaging are not implemented yet. Cursive and calligraphy currently provide style guidance and previews rather than a full pen-pressure simulator. PDF parsing loads its library from a pinned CDN on first use; the service worker caches the two pinned parser assets for later offline use after a successful online load.
- Browser speech recognition may send audio to a browser/vendor service and may require internet; it is optional and is not advertised as an offline capability.
- The starter dictionary is a learning prototype, not a comprehensive dictionary. Vocabulary coverage and exercise variety are still being expanded.
- A PWA normally needs HTTPS for installation/service workers outside localhost. A separately packaged APK can be installed without a domain, but needs an Android build/signing and distribution workflow.

## Quality checks

GitHub Actions runs `npm test` on pushes to `main` and `feat/**`, and on pull requests targeting `main`.
