# Changelog v4.3.0 - Speaking timing

- Added `speaking-timer.js`, a monotonic-time speaking countdown engine.
- Official per-question timings: Part 1 = 30 s; Parts 2 and 3 = 45 s; Part 4 = 60 s preparation plus 120 s response to three questions.
- Start, pause, resume, reset, skip preparation, and previous/next question controls.
- Optional auto-transition between the Part 4 preparation and response, and among Parts 1-3 questions.
- Optional audible cue for the last ten seconds and visible warning/progress bar.
- Official and relaxed (+30 s per answer) modes; explicit lesson timing as optional mode where different.
- Extended the assignment creator: supports three Speaking questions in Parts 1-3 with bilingual content and answers, correct timing defaults and optional photo URLs for Parts 2-3.
- Preserved V4.2 bilingual study helpers and V4.1 export/recording features; exercise and submission files are unchanged.
- Changed service-worker cache key to prevent GitHub Pages from serving an old application shell.
- Tested the timer engine with deterministic unit tests and UI interactions in Chromium. Live microphone and website deployment are not verified by this package.
