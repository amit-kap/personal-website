# fal cheap-model test: Kling 4.0 ref and Wan 3.0 Prime vs draft 10 (RUN 18 Nov on Amit's yes)

Question: given the Blender v16 camera clip, can a cheaper model match draft 10 (Seedance 2.5)?
Same inputs as draft 10, so the model is the only variable.

| Input | File | Role |
| --- | --- | --- |
| Video 1 | `blockout/ref-v16-camera-16x9.mp4` (13 s, 1920x1080, 24 fps) | Camera, framing, timing, AS's movements |
| Image 1 | `current/still-f144-point-v2-approved.png` | AS, his pointing hand, the end look |
| Image 2 | `current/still-f001-v3-approved.png` | The opening's look |

## Run A: Kling 4.0 reference-to-video
`kling/v4/reference-to-video`, 720p, 16:9, 13 s, `video_urls` = [Video 1], `image_urls` = [Image 1, Image 2].
Price: $0.157/s x 13 s = **about $2.04**.

## Run B: Wan 3.0 Prime reference-to-video
`alibaba/wan-3.0-prime/reference-to-video`, 720p, 16:9, 13 s, audio off,
`enable_prompt_expansion: false` (its rewriter could add camera words, which broke draft 8),
`reference_video_urls` = [Video 1], `reference_image_urls` = [Image 1, Image 2].
Price: $0.045/s x (13 s out + 13 s input video, billed too) = **about $1.17**.

**Total about $3.21.**

## Prompt (same for both; Kling uses @Video1 / @Image1, Wan uses "Video 1" / "Image 1")

@Video1 is a fine blockout reference and the sole guide for camera position, camera movement,
framing and timing, and for how AS moves. Preserve its structure, spatial layout, camera height,
camera movement, framing and the figure's movements exactly, frame by frame. Do not use its grey
materials or empty look.
@Image1 is AS and the look of the city at the end: use his appearance, costume, mask, chest badge,
cape and his pointing hand, and the towers and light behind him. Only one AS on screen. Do not copy
its framing.
@Image2 is the look of the city at the opening: the rooftops, the light rays, the haze and the low
sun. Do not copy its framing.

Every box in @Video1 is a browser-window tower as in @Image1 and @Image2: a flat roof with a rim
and one small rooftop box, a title bar with three coloured dots and an address bar on the facade.
The dark lines between the boxes are streets far below. The standing figure is AS; the blue band on
its head is his mask and shows where he looks; the blue sheet behind it is his cape. Each tower
keeps the same shape and detail for the whole shot.

AS moves exactly like the figure in @Video1, with the same timing: he points to the upper left and
looks at the camera, holds, then lowers his arm and looks back to the left. His hand points with the
index finger, as in @Image1. His cape moves in the wind the whole time he is on screen, rippling and
lifting in large flat folds.
Warm low sun on the horizon, soft cream haze in the distance, gentle light rays between the towers.
Flat illustrated screen-print style, as in @Image1 and @Image2.

One continuous shot, no cuts of any kind. Pure video, no subtitles. No other people. No text
except his chest badge.

## Pre-spend checklist
1. Shot spec (Gate 1):        approved: motion-spec.md, block-out v16 motion (18 Nov)
2. World parts (Gate 2):      approved: browser bar v3
3. Character (Gate 3):        AS from the approved pointing still
4. Approved stills (Gate 4):  opening v3, pointing v2, both approved
5. Motion route:              Blender block-out to a cheaper reference-to-video model. Limit: neither
                              model is tested with a camera clip; 720p minimum, no 480p draft for Kling
6. References:                same three files as draft 10, one role each; no second character
7. Prompt, model, price:      above; about $3.21 total
8. Variable changed:          model only (Seedance 2.5 -> Kling 4.0 / Wan 3.0 Prime)

## Judged against draft 10
Frame-by-frame vs Blender v16 at the same timestamps as `draft10-vs-ref.jpg`: level glide (no dive),
tower detail through the move, point and head turn together at 7-8 s, arm down at 10-11 s, one arm
throughout, cape moving, no cuts.

## Result (RUN 18 Nov, about $3.21 est.) -> fal-kling4-720p.mp4, fal-wan3-720p.mp4
Files: `fal-test-vs-ref-a.jpg`, `fal-test-vs-ref-b.jpg` (columns: Blender v16 | draft 10 | Kling | Wan,
rows at t = 0, 2, 3.5, 5, 6 and 7.6, 9, 10.5, 12.9), `fal-test-detail.jpg` (4.6 s and 11.5 s),
`fal-test-cape.jpg`. IDs: `fal-cheap-test-ids.txt`. Both saved to the fal Library.

Verdict: DRAFT. Kling passes; Wan FAILS the cape (Amit, 18 Nov: "the cape is a sqr").
- Camera: both follow Blender as draft 10 does: level glide, no dive, head at 3.5 s, back view,
  profile, end frame. No cuts (scene detection, threshold 0.25).
- Point: both point upper left and turn to the camera together at 7.6-9 s, index finger; arm down by
  10.5 s, one arm throughout; still, looking left at the end.
- Cape: Kling drapes it like a cloth cape (darker navy than draft 10). Wan copies the Blender stand-in
  sheet literally: a flat, stiff rectangle sticking out behind him, from 5 s to the end. FAIL. I missed
  this in my first check and called it "the largest".
- Weak spot, Kling: the far city at 4-6 s is smeary, with dark blotches in the streets. Wan and
  draft 10 are cleaner there. In all three, the far towers at 4-6 s are plain boxes without browser bars.
- Both come out at 720p, and no Dreamina-style "AI" badge was seen. Wan is 30 fps, Kling 24 fps.
- Cost: Kling about $2.04, Wan about $1.17, vs draft 10 at 338 Dreamina credits (480p, needs a paid finish).
