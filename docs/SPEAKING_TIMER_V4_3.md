# Speaking timer guide - APTIS Practice Hub v4.3

## Official Aptis ESOL General practice timings

| Part | Preparation | Speaking |
|---|---:|---:|
| Part 1 | 0 seconds | 30 seconds per question |
| Part 2 | 0 seconds | 45 seconds per question |
| Part 3 | 0 seconds | 45 seconds per question |
| Part 4 | 60 seconds | 120 seconds to answer all three questions |

Source: British Council, Prepare for Aptis ESOL General:
https://www.britishcouncil.org/exam/english/aptis/prepare-general

## How to practise

1. Open Speaking. Each exercise has its own countdown panel.
2. Select the official exam mode (default). Optional relaxed practice adds 30 seconds to every speaking response.
3. Press Start. On Part 4, the clock counts down the 60-second preparation, then automatically starts the 120-second response if the auto-switch option is checked.
4. On Parts 1-3 with multiple questions, use Next question manually, or enable automatic transition.
5. Use Pause, Continue, Reset, and Skip preparation as needed. When 10 seconds remain, the display changes and an optional sound cue plays.
6. The timer does NOT automatically record audio. Use the separate Record button, Stop, Listen back, and Export assignment + recording ZIP.

## Updating the existing GitHub Pages repository

- Download and extract APTIS_V43_GITHUB_PATCH.zip.
- Back up the current website and export learning progress before updating.
- Upload the CONTENTS of the extracted patch into the existing repository root.
- Preserve `data/extra-packs.js` and all of `data/builtin.js`, `data/teacher-homework.js`, and `data/teacher-translations.js`.
- Commit changes, check GitHub Actions / Pages, hard reload the site (Ctrl+F5), then verify the header reads v4.3.
- Confirm that `speaking-timer.js` exists in the repository root.

## Data compatibility and limitations

- Existing exercise data, translations, notes, answers, progress and IndexedDB audio schema are unchanged.
- All imported Speaking JSON packs that use `skill: "speaking"` and `part: "Part 1" ... "Part 4"` get the correct default speaking timer.
- For Part 1-3, an item with `questions` containing three prompts is timed per question. For Part 4, the questions share one 120-second response window.
- A lesson-specific timing option appears if a pack defines a different `settings.prepSeconds` or `settings.speakSeconds`.
- Audio cues depend on the browser's audio policy and might require user interaction. Actual microphones were not tested in the build environment.
- Timer preferences are kept in localStorage on the current device. They are not shared across devices.
- Do not upload private recordings or personal answers to a public GitHub repository; export submissions directly from the app instead.
