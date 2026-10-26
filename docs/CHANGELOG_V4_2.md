# CHANGELOG v4.2.0 — 26/10/2026

## Additions

- New `study-support.js` provides per-passage English-to-Vietnamese toggles across Speaking, Writing, Reading and local Listening content.
- Translation toolbar: show known translations, hide translations and on-demand translation for currently open exercise.
- Privacy gate before first external machine translation, MyMemory REST (no API key in static source), segment chunking to <=460 bytes/request, capped batch usage and local caching.
- New `data/teacher-translations.js` provides authored Vietnamese translations and detailed guidance for priority teacher exercises; does not edit teacher English content.
- Read-comprehension paragraphs now separated for independent translation.
- Expanded assignment creator with bilingual English/Vietnamese fields, one-click and multi-field translations, plus teacher-specific Vietnamese guidance.
- Structured quiz and opinion-question translation retains letter keys; quiz answer keys remain untouched.
- JSON importer optional opt-in Vietnamese enrichment, plus type-specific guidance on every imported exercise.
- Backup export/import now includes local translation cache (audio remains separate).
- Service worker and manifest bumped to 4.2.

## Retained

- Original `data/builtin.js` and `data/teacher-homework.js` remain byte-identical to v4.1.
- Existing `submission.js` (text/HTML/ZIP export, IndexedDB audio and attachments) remains byte-identical to v4.1.
- Existing localStorage keys for progress (`aptis_progress_v3`), drafts (`aptis_drafts_v3`), assignments (`aptis_assignments_v4`) and custom packs are unchanged.

## Limitations

- Third-party translation may fail due to rate limits, service changes, CORS or connectivity. Browser tests used mock translation responses; no guarantee about live MyMemory response in user's network.
- Machine translation is not teacher-authorized or an official answer and needs manual verification.
- App does not yet parse DOCX/PDF or Google Docs directly; manually paste or import pack JSON.
- Audio requires HTTPS and browser permissions; JSON backup does not contain sound.
- Automatic translation on JSON import is capped; untranslated portions retain per-passage translation buttons.
