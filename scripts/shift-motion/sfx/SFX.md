# Shift film: sound

The film's mix is `film-mix6.wav`, muxed into `../film/build/out/film-mix6.mp4`. Rebuild with `node build-mix6.mjs` (needs ffmpeg and `../film/build/seq/manifest.json`).

| Part | File | Source |
| --- | --- | --- |
| Score | `score/s11-eleven-a.wav` | ElevenLabs Music v2.5 (via Fal), composition plan with the drop at 36.03 s. Used as generated. |
| UI sounds | `ui/` (`tick`, `drop`, `warn`, `pii`, `connected`, `slide`, `donut-b-scan`) | ElevenLabs Sound Effects v3 (via Fal), generated 2026-11-05. |
| Outro whoosh | `fal2/wL1.wav` | ElevenLabs Sound Effects v3 (via Fal). |
| Typewriter keys | `dragon-studio-typing-keyboard-asmr-356116.mp3` | [Pixabay](https://pixabay.com/sound-effects/film-special-effects-typing-keyboard-asmr-356116/); Pixabay says its sound effects are free for commercial use ([FAQ](https://pixabay.com/service/faq/)). The file's own license page was not read. |
| Mouse clicks | synthesised in `build-mix6.mjs` | n/a |

Event times (clicks, row drops, score, badge, PII tag, status change, counters, typing) are written in `build-mix6.mjs` from the film's shot timing in `../final.html`.
