# Seedance draft 8 (RUN 18 Nov on Amit's yes)

Draft 7's recipe, with the references updated to block-out v14 and the stills Amit approved on 18 Nov.
Prompt: draft 6/7's prompt word for word (below).

Platform: Dreamina, `seedance_2.5_draft`, m2v, 480p, 6 s, 16:9, 1 output, about 156 credits.
A good take can be finished at 1080p within 7 days.

## References

| Tag | File | Role |
| --- | --- | --- |
| @Video1 | `blockout/ref-v14-camera-16x9.mp4` (6 s, 1920x1080, 24 fps) | Camera path and framing only |
| @Image1 | `current/still-f144-v4-approved.png` | AS's appearance, and the end frame's look |
| @Image2 | `current/still-f001-v3-approved.png` | The opening's look |

## Prompt

@Video1 is the camera path and framing only. Follow its camera angles, framing and continuous
camera path exactly, frame by frame. Do not use its grey materials, colours or lighting.
@Image1 is AS and the look of the city at the end: use his appearance, costume, mask, chest badge
and cape, and the towers and light behind him. Only one AS on screen. Do not copy its framing.
@Image2 is the look of the city at the opening: the rooftops below, the light rays, the haze and
the low sun. Do not copy its framing or camera angle.

One continuous 6-second shot, no cuts.
0-3.5 s: the camera glides backward, low over the rooftops, down a long straight street toward
AS. It looks out over the city, into a low sun on the horizon ahead. Towers slide past on both
sides.
3.5 s: the camera passes over AS's right shoulder. He stands still at the front edge of his roof,
looking out over the city.
3.5-6 s: the camera keeps pulling back while arcing left around him and settles on a medium shot,
waist up: AS on the right of frame, three-quarter front view, facing left, open sky on the left.

Every tower is a browser-window building as in @Image1 and @Image2: a flat roof with a rim and one
small rooftop box, a title bar with three coloured dots and an address bar on the facade. Each
tower keeps the same shape and detail for the whole move. AS stays still; only his cape moves a
little in the wind. Warm low sun ahead on the horizon, soft cream haze in the distance, gentle
light rays between the towers. Flat illustrated style with clean lines, as in @Image1 and @Image2.

No other people. No text except his chest badge. No binary code or symbols in the sky. No camera
shake.

## Pre-spend checklist

1. Shot spec (Gate 1):        approved: current/motion-spec.md
2. World parts (Gate 2):      approved: browser bar v3 (tower/browser-tab-v3)
3. Character (Gate 3):        locked sheet exists; AS comes from the approved end still (as draft 7)
4. Approved stills (Gate 4):  approved 18 Nov: still-f001-v3, still-f144-v4 (from Blender v14 frames)
5. Motion route:              Blender block-out to Seedance; AS's back view rests on one 3/4 still
6. References:                one clip, two images, one role each; no second character
7. Prompt, model, price:      above; Seedance 2.5 draft on Dreamina, ~156 credits
8. Variable changed:          the reference set (clip v8 -> v14, both stills redone); prompt unchanged

## Result (RUN 18 Nov, Dreamina Seedance 2.5 Draft, 156 credits)

Files: `draft8-480p.mp4` (854x480, 60 fps, 6.0 s), `draft8-vs-ref.jpg` (rows t = 0, 1, 2, 3, 3.5,
4.17, 5, 5.95 s; Blender v14 | draft 8), `draft8-first-2.5s.jpg`. IDs in `draft8-ids.txt`.

Verdict: DRAFT, FAILS the opening.
- 0-2 s: FAIL. Opens low inside a street canyon between tall plain towers (no browser bars), then
  cranes up to rooftop height by ~2 s. Blender starts level above the rooftops.
- 2-6 s: follows Blender: level glide to the sun, head enters at 3.5 s, over-shoulder back view,
  profile, end frame matches the approved end still. Towers keep browser bars. PASS.
- No hard cuts (scene detect finds none).
- Dreamina's "AI" badge top-left on the video itself (also on draft 7).
