# Seedance draft 9 (RUN 18 Nov on Amit's yes)

Same references as draft 8 (checked 18 Nov: the files on Dreamina are pixel-identical to the local
ones). Two prompt changes:
1. The prompt no longer describes the camera move in words. Draft 8's line "glides backward, low
   over the rooftops, down a long straight street" is the same wording that sent draft 2 into the
   street; the skill rule is to let the Blender clip alone carry the camera. Draft 8 again opened
   inside the street.
2. Amit (18 Nov): "make sure his cape is moving in the wind": the cape now moves clearly, the
   whole time he is on screen (draft 8 said "only his cape moves a little").

Platform: Dreamina, `seedance_2.5_draft`, m2v, 480p, 6 s, 16:9, 1 output, about 156 credits.

## References

| Tag | File | Role |
| --- | --- | --- |
| @Video1 | `blockout/ref-v14-camera-16x9.mp4` | Camera position, movement, framing and timing only |
| @Image1 | `current/still-f144-v4-approved.png` | AS's appearance, and the end frame's look |
| @Image2 | `current/still-f001-v3-approved.png` | The opening's look |

## Prompt

@Video1 is a fine blockout reference and the sole guide for camera position, camera movement,
framing and timing. Preserve its structure, spatial layout, camera height, camera movement and
framing exactly, frame by frame. Do not use its grey materials or empty look.
@Image1 is AS and the look of the city at the end: use his appearance, costume, mask, chest badge
and cape, and the towers and light behind him. Only one AS on screen. Do not copy its framing.
@Image2 is the look of the city at the opening: the rooftops, the light rays, the haze and the low
sun. Do not copy its framing.

Every box in @Video1 is a browser-window tower as in @Image1 and @Image2: a flat roof with a rim
and one small rooftop box, a title bar with three coloured dots and an address bar on the facade.
The dark lines between the boxes are streets far below. The standing figure is AS. Each tower
keeps the same shape and detail for the whole shot.

AS stands still at the edge of his roof, looking out over the city. His cape moves in the wind the
whole time he is on screen: it ripples and lifts behind him in steady gusts, with large flat folds.
Warm low sun on the horizon, soft cream haze in the distance, gentle light rays between the towers.
Flat illustrated screen-print style, as in @Image1 and @Image2.

One continuous shot, no cuts of any kind. Pure video, no subtitles. No other people. No text
except his chest badge.

## Pre-spend checklist

1. Shot spec (Gate 1):        approved: current/motion-spec.md
2. World parts (Gate 2):      approved: browser bar v3
3. Character (Gate 3):        AS from the approved end still (as drafts 7-8)
4. Approved stills (Gate 4):  approved 18 Nov: still-f001-v3, still-f144-v4
5. Motion route:              Blender block-out to Seedance
6. References:                same as draft 8, verified on Dreamina (pixel-identical)
7. Prompt, model, price:      above; Seedance 2.5 draft, ~156 credits
8. Variable changed:          the prompt (camera words removed + cape in the wind). Two edits in
                              one round, both in the prompt: Amit asked for the cape.

## Result (RUN 18 Nov, Dreamina Seedance 2.5 Draft, 156 credits)

Files: `draft9-480p.mp4`, `draft9-vs-ref.jpg` (t = 0, 1, 2, 3, 3.5, 4.17, 5, 5.95 s; Blender v14 |
draft 9), `draft9-cape.jpg` (AS at 3.9-5.95 s). IDs in `draft9-ids.txt`.

Verdict: DRAFT. Camera PASS; cape PARTIAL.
- Follows the Blender clip at every checked time, opening included: level above the rooftops,
  street to the sun, head enters at 3.5 s, back view, profile, end frame = approved end still.
  The camera-words change fixed draft 8's street opening.
- No hard cuts (scene detect finds none). Towers keep browser bars.
- Cape: hangs still in the back view (3.9-4.5 s); only its lower edge shifts a little at 5-6 s.
  It does not visibly blow in the wind.
- Dreamina "AI" badge on the video.

APPROVED by Amit, 18 Nov ("for now draft 9 is the approved one"): draft 9 is the current intro take. Finish at 1080p before ~25 Nov.
