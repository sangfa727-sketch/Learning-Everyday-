# Learning Everyday

A mobile-first English-learning app for Myanmar learners, with English/Myanmar bilingual support and practice across all four language skills.

## Product goals

- **Speaking:** guided speaking practice and pronunciation feedback; keep any future AI/API-dependent features optional.
- **Writing:** uppercase/lowercase letter practice, handwriting and cursive styles, calligraphy, and sentence writing.
- **Reading:** beginner-to-advanced reading lessons, vocabulary, grammar, and sentence patterns.
- **Listening:** import text-based story PDFs, extract readable text, and read it aloud with device text-to-speech (TTS), playback controls, and adjustable speed—without requiring an AI API.
- **Tap-to-define:** selecting a single word in extracted text shows its English definition and usage. Prefer an offline/local dictionary; document any limitations in coverage.
- **Bilingual UI:** English and Myanmar language support, with a clear way to switch languages.

## Important constraints

- Do not require a paid AI API for core reading/listening functionality.
- Device TTS voice availability and offline behavior depend on the user's operating system and installed language voices.
- Text-based PDFs can be extracted locally. Scanned/image-only PDFs require OCR, which should be treated as a separate capability and evaluated for offline support.
- Keep user documents and learning progress private. Do not upload imported PDFs unless the user explicitly chooses a cloud feature.
- Build incrementally with tests for text extraction, word selection, dictionary lookup, playback controls, and accessibility.

## Initial milestones

1. Confirm target platform and technology stack.
2. Establish the app shell, bilingual navigation, and responsive/mobile-first design.
3. Implement reading view, local PDF text extraction, device TTS, and speed controls.
4. Implement tap-to-define with a local dictionary data source.
5. Add writing exercises and vocabulary/grammar/reading lessons from beginner to advanced.
6. Add speaking practice based on platform capabilities, clearly separating offline features from optional online services.
7. Add automated checks, documentation, privacy review, and release instructions.

## Status

This repository is being initialized. The technology stack has not yet been selected; avoid committing framework-specific scaffolding until that decision is made.
