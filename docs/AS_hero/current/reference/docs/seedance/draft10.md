# Seedance draft 10: intro + point + return, 13 s (RUN 18 Nov on Amit's yes)

Blender v16 carries the camera AND AS's movements (approved 18 Nov). One continuous shot replaces
draft 9 + clips A and B, so there is no join between the intro and the point.

## Checks done 18 Nov (free)
- Clip on Dreamina = local `blockout/ref-v16-camera-16x9.mp4` (checksum match); 1920x1080, 24 fps,
  13.0 s, 312 frames. Duration setting 13 = clip length.
- Opening still: Blender frame 1 is unchanged since v14 (pixel-identical), so
  `current/still-f001-v3-approved.png` still matches the clip's opening.
- Pointing still (`current/still-f144-point-v1-approved.png`): STILL HAS THE ROOFTOP TOWER at the
  right edge (`anchors/point-still-tower-check.jpg`: pointing still | end v5 | Blender v16 f240).
  Must be fixed first, or Seedance paints the tower back.
- End picture v5 (no tower) was made but never approved by Amit; not in `current/`.
- Prompt below re-checked against the skill rules: no camera move in words; clip called a fine
  blockout; every grey shape mapped (towers, streets, figure, mask band, cape sheet); two images,
  one role each; no second character; "no cuts".

## Step 1: fix the pointing still (9 credits)
Same edit as end frame v5, applied to the pointing still: remove the browser tower at the right
edge (AS's rooftop box), layout from Blender v15 f144. Amit approves the result before step 2.

## Step 2: draft 10 (338 credits, Dreamina quote 18 Nov)
Dreamina, `seedance_2.5_draft`, m2v, 480p, 13 s, 16:9, 1 output.

| Tag | File | Role |
| --- | --- | --- |
| @Video1 | `blockout/ref-v16-camera-16x9.mp4` | Camera, framing, timing, and AS's movements |
| @Image1 | `current/still-f144-point-v2-approved.png` (approved 18 Nov) | AS's appearance, his pointing hand, the end look |
| @Image2 | `current/still-f001-v3-approved.png` | The opening's look |

### Prompt

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
1. Shot spec (Gate 1):        approved: motion-spec.md, block-out v16 motion (Amit, 18 Nov)
2. World parts (Gate 2):      approved: browser bar v3
3. Character (Gate 3):        AS from the approved pointing still (made from the approved end still)
4. Approved stills (Gate 4):  opening v3 and pointing v2 (tower removed), both approved
5. Motion route:              Blender block-out (camera + figure motion) to Seedance
6. References:                verified on Dreamina; two images, one role each
7. Prompt, model, price:      above; 338 credits (step 1 done, 9 credits)
8. Variable changed:          clip v14 (6 s) -> v16 (13 s, with figure motion); end image -> pointing still

## Result (RUN 18 Nov, 338 credits) -> draft10-480p.mp4

Files: `draft10-vs-ref.jpg` (Blender v16 | draft 10 at t = 0, 2, 3.5, 4.2, 5, 6, 7.2 left; 7.6, 8,
9.5, 10.5, 11, 12.9 right), `draft10-arm-down.jpg` (10-11.5 s), `draft10-last-vs-v5.jpg`.
IDs: `draft10-ids.txt`. (First confirm returned empty output; nothing ran or was charged; retried.)

Verdict: DRAFT, passes my checks.
- 0-6 s: follows Blender, as draft 9 (level glide, head at 3.5 s, back view, profile, end frame). PASS.
- 7-8 s: points to the upper left and turns his head to the camera together; index-finger point as in
  the approved still. PASS.
- 10-11 s: arm comes down smoothly, one arm and hand throughout. PASS. The head turns back about
  0.5 s after the arm (Blender: together). Minor.
- 11-13 s: still, looking left; cape moves the whole time. PASS. No cuts.
- Last frame vs end picture v5: same pose, framing shifted slightly (AS further left, as with draft 9),
  so the idle loop must be made from draft 10's own last frame.
- Dreamina "AI" badge on the video.
APPROVED by Amit, 18 Nov ("Approve it"): draft 10 is the intro (replaces draft 9 + point clips A and B). Finish at full resolution within 7 days.
