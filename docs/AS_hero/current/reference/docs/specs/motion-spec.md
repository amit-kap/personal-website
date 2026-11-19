# AS hero: motion spec (APPROVED 2026-11-17)

The intro shot for the home hero (layout A, Paper "07 — Anti-slop home"). Gate 1 of the
video-animation skill. The still frame is in `shot-spec.md`; this file is the camera move into it.

## Shot

- Length: 6 s, 24 fps (144 frames). One continuous shot, no cuts.
- 0–2 s: the camera glides **backward**, low over the Browsercity rooftops toward AS's tower. It
  looks the same way AS looks (out over the city), so he is behind the camera and not yet visible.
- 2–3.5 s: the camera clears his roof edge and passes over his right shoulder.
- 3.5–6 s: it keeps pulling back while arcing left about 120° around him, rising slightly, and
  lands on the end frame.
- Hold on the last frame. That frame is the homepage poster.

## End frame

- **Medium shot, closed frame** (Amit, 17 Nov): waist up, tighter than the knees-up still in
  `shot-spec.md`.
- AS on the right, facing left toward the copy. Sky open on the left for the headline.
- Camera at about his waist height, looking up about 8°, 35 mm equivalent.
- The skyline in the end frame stays as in the block-out.

## How it is made

1. Block-out: `blockout/ref-v8-white.blend`, built by `scripts/as-hero/blender/build_ref_white.py`.
   It has no textures and a solid-colour stand-in AS. The town is a perfect grid of 484 box towers
   (`scripts/as-hero/blender/build_grid_city.py`), aligned to the glide: the camera glides back
   down an open avenue that ends at AS's tower.
2. Key the camera to this spec. Render a low-poly MP4 at 144 frames. Amit approves it before any
   spend.
3. Seedance 2.5 reference-to-video: the MP4 as the camera path only, plus the locked model sheet,
   the approved tower and the end frame as image refs. Flash draft first, with price and prompt
   shown before running.

## Block-out notes (2026-11-17, after Amit's review)

- Camera stays level for the whole move, so towers stay vertical. Up/down framing is lens shift.
- 50 mm lens, not 35 mm. At 35 mm the waist-up end frame needs the camera at 1.6 m, closer than
  the shoulder pass, which breaks "keeps pulling back". At 50 mm the end camera is 2.3 m away.
- AS stands 1 m from the front edge of his roof, centred on it, looking straight out over the city.
- The arc is about 152° (from behind his right shoulder to three-quarter front), not 120°.
- Stand-in: solid colours (blue suit, orange cape and chest badge, skin head with a nose), so the
  way he faces reads at a glance.

## Camera path: LOCKED (Amit, 17 Nov 2026)

- Keys at frames 1 (start), 84 (over the right shoulder), 144 (end). 6 s at 24 fps, no hold.
- Path: one Bezier curve (`CamPath`), straight glide down his gaze line from 70 m out, then one
  rounded turn about 152° around him. The camera stays level the whole time; no look-down shift.
- Speed: starts moving, slows smoothly through the shoulder pass (about 30% of glide speed, no
  stop), eases out on the end frame.
- Turn: flat through the shoulder key, then one smooth curve onto him.
- End frame: 50 mm, 3.0 m from AS, cut just below the waist, AS at 72% width, head ~12% from top.
- Stand-in: red body, blue cape, no chest badge or nose.
- City: blocks of 2x2 box towers on flat rounded pavements, 22 m roads, one road down his gaze
  ending at his tower; sun low on the front horizon.
- Rebuild: `build_ref_white.py` (from v6), then `build_grid_city.py`, then `key_ref_camera.py`.

## Gate 4 stills: APPROVED (Amit, 17 Nov 2026)

Made from the Blender clip's own frames with Seedream 5.5 Edit (Blender frame + model sheet +
tower tile), so they match the camera exactly:
- `current/still-f001-approved.png` (frame 1; redo version A with the grid, approved 17 Nov;
  the first version was rejected because its towers were not on the grid)
- `current/still-f100-approved.png` (frame 100, behind his shoulder)
- `current/still-f144-approved.png` (frame 144, the end frame; sun removed so the light stays
  consistent: the sun is ahead of the glide, behind the camera at the end)

## Block-out v9 (17 Nov, after Amit's review of opening still v2)

`blockout/ref-v9-white.blend`, built from the 14:18 save of ref-v8 (the one the camera clip was
rendered from) by `scripts/as-hero/blender/extend_city_v9.py`. Camera, AS and near city unchanged.
- Ground runs to the horizon (road plane ~60 km, clip end 40 km): no floor edge.
- Far city out to 3.2 km ahead, widening with distance; the central street stays open to the sun.
- Pavements: 0.25 m kerbs in mid grey, so they read between white towers and the black road.
Renders: `blockout/v9_0001.png`, `v9_0144.png`; compare `blockout/v8-vs-v9.jpg`, street zoom
`blockout/v8-vs-v9-street-zoom.jpg`. Note: ref-v8-white.blend was re-saved at 19:40 by another
session (1440x860, end camera moved ~0.2 m); not used.
Camera clip v9: `blockout/ref-v9-camera-16x9.mp4` (1920x1080, 24 fps, 6.0 s, 144 frames from
`blockout/v9-frames/`). Same camera as v8 at every checked time (0, 1.5, 3, 3.5, 4.5, 5.95 s;
`blockout/clip-v8-vs-v9.jpg`). Replaces `ref-v8-camera-16x9.mp4` as the motion reference.

## Block-out v10 (17 Nov): skyline curve

Amit: the horizon was one band of equal heights ("looks like an AI placed them"); make the sides
lower than the centre, apply to the near towers too, centre on the street and the sun.
`blockout/ref-v10-white.blend` = v9 + `scripts/as-hero/blender/skyline_curve_v10.py`:
heights follow an uneven dome (downtown core slightly right of the street, left side falls faster),
district clusters, most buildings low or mid, rare accents; towers by the camera path stay under
112 m; towers within 40 m of AS untouched (end frame unchanged). Far road fades to light grey so
no dark band shows at the horizon. Renders: `blockout/v10_0001.png`, `v10_0048.png`,
`v10_0144.png`; compare `blockout/v9-vs-v10.jpg`. Clip not re-rendered yet.

## Block-out v11 (17 Nov): lighter city, curve on the road, city on all sides

Amit's review of v10 in Blender: too dense; centre the curve on the road in front of the camera;
no city on the sides. `blockout/ref-v11-white.blend` = v10 + `scripts/as-hero/blender/city_v11.py`:
towers thinned (80% kept along the camera road, 50% within 800 m, 40% beyond); dome centred on the
street; new low/mid blocks on every side out to 2 km. The 27 towers visible in frame 144 are
protected, so the end frame keeps its composition (small lighting differences from new shadows).
Renders: `blockout/v11_0001/0048/0108/0144.png`, `v11-frames.jpg`, `v10-vs-v11-f144.jpg`.

## Decision (17 Nov evening, recorded 18 Nov)

After draft 7, Amit and I agreed to make the Blender block-out as accurate as possible before any
new Seedance run (v9 -> v11 above). Next: Amit reviews v11 in Blender, fixes, then re-render the
camera clip from v11 (the current clip is v9) and use it for the next Seedance draft. Draft 7 stays
as a fallback; its 1080p finish expires ~24 Nov.

## Block-out v12 (18 Nov): city to the horizon on every seen side

Amit's review of v11 at frame 104: the city stopped at 2 km on the sides, so the arc showed empty
ground. `blockout/ref-v12-white.blend` = v11 + `scripts/as-hero/blender/city_v12.py`. Nothing
existing moved. Two joined meshes added over view yaw -20..250 deg around AS (the camera sees
~25..215): ring A 2-10 km on the same street grid, lower with distance; ring B 10-28 km, coarse
fat low boxes. 2.5 km patches vary 0-2.3x (some open land) plus 12 far districts, so the horizon
isn't one band. Pavements stop at 4 km and the far meshes cast no shadows, so the opening street
keeps its fade to light grey. Note: the dark line in the viewport sky is `CamPath` (does not
render). Renders: `blockout/v12_0001/0104/0121/0144.png`, `v12-frames.jpg`,
`v11-vs-v12-horizon.jpg` (top v11, bottom v12; frames 1, 104, 121). Clip not re-rendered yet.

## Block-out v13 (18 Nov): AS behind the rim, more tall towers by the cluster

Amit's review of v12 at frame 124. `blockout/ref-v13-white.blend` = v12 +
`scripts/as-hero/blender/v13_roof_and_tall.py`:
- AS stood on the 1 m roof rim's inner edge, feet half sunk. AS and `CamPath` both moved 0.3 m
  along +X, so AS stands just behind the rim and his framing is unchanged in every frame.
- Six lower towers beside the tall cluster right of AS (x 0-320, y 40-340) raised to 122-174 m.
  This changes the end frame's background: still-f144-approved.png no longer matches exactly.
Renders: `blockout/v13_0001/0124/0144.png`, `v12-vs-v13-f124-f144.jpg`.

## Block-out v14 (18 Nov): pavements

Amit's review of v13: remove pavement squares with no tower, or make them roundabouts; join a few
squares along a road into blocks. `blockout/ref-v14-white.blend` = v13 (live session) +
`scripts/as-hero/blender/paves_v14.py`. All pavements rebuilt as one mesh `G_paves` (same kerb and
material; AS's plaza untouched): 982 empty squares, 341 of them now round islands (15 m radius),
the rest removed; 1,833 runs of 2-3 occupied squares joined into long blocks (mostly along X; the
central street is never closed). Towers unchanged. Top view: `blockout/v14-top-view.png`;
renders `blockout/v14_0001/0085/0124.png` (barely different at camera height).
Camera clip v14: `blockout/ref-v14-camera-16x9.mp4` (1920x1080, 24 fps, 144 frames from
`blockout/v14-frames/`, EEVEE). Same camera as v9 except the 0.3 m shift that moves with AS (v13).
Replaces the v9 clip as the motion reference for draft 8.

## Gate 4 stills for block-out v14: APPROVED (Amit, 18 Nov 2026, "Approve both")

- Start: `current/still-f001-v3-approved.png` (from Blender v14 frame 1; replaces still-f001-approved.png)
- End: `current/still-f144-v4-approved.png` (approved v3 re-laid on Blender v14 frame 144; replaces still-f144-v3-approved.png)
Dreamina "AI" badge removed in both copies. Notes: `seedance/anchors/stills-v14.md`.

## Block-out v15 (18 Nov): AS's rooftop box out of view

Amit: the end frame shows "another tower, not a box" on AS's roof. It was his rooftop box (B_AS,
2.2 m tall, ~10 m from the camera), filling the right edge; the image models painted it as a
browser tower. `blockout/ref-v15-white.blend` = v14 + `scripts/as-hero/blender/v15_roof_box.py`:
box moved to (3.95, -9.5), checked out of view in every second frame 1-144. Compare:
`blockout/v14-vs-v15-roofbox.jpg` (frames 130, 144). Camera clip and stills still show the old box.

## Block-out v16 (18 Nov): intro runs on into the point; cape and mask

Amit: animate the point and the cape in Blender, add the mask so the look to camera is clear, same
timing as the point clips. `blockout/ref-v16-white.blend` = v15 + `scripts/as-hero/blender/v16_point_cape.py`.
Clip: `blockout/ref-v16-camera-16x9.mp4` (1920x1080, 24 fps, 312 frames = 13 s).
- 0-6 s: the camera move, unchanged. Camera holds from 6 s.
- 6-7 s: AS still, looking left (head 25 deg further left than his body, so the turn reads).
- 7-8 s: right arm raises to point at the upper left of the frame and head turns to camera, together.
- 8-10 s: holds the point.
- 10-11 s: arm down and head back to the left, together (Amit: "hand down back to the hold pos -
  ready for a loop"). 11-13 s: still, looking left: the pose the idle loop starts from.
- Mask: blue band with white eye slits on the head. Cape: cloth sheet on a shoulder pivot, noisy lift
  and sideways flare plus a ripple, moving the whole 10 s.
Key frames: `blockout/v16-keyframes.jpg` (t = 5, 7, 7.6, 8, 9.5, 10.5, 11, 12.9 s).
APPROVED by Amit, 18 Nov ("Approve it"): v16 motion (13 s).

## Stills approved 18 Nov ("Approve both"), rooftop tower removed
- `current/still-f144-v5-approved.png`: end frame (replaces still-f144-v4-approved.png). For the idle loop.
- `current/still-f144-point-v2-approved.png`: pointing pose (replaces still-f144-point-v1-approved.png). For draft 10.

## Block-out v17 (18 Nov, APPROVED): cape shape
Amit: "shape the cape in blender" (after Wan painted v16's flat sheet as a square cape).
`scripts/as-hero/blender/v17_cape_shape.py` on a copy of v16 -> `blockout/ref-v17-white.blend`,
clip `blockout/ref-v17-camera-16x9.mp4` (13 s, 312 frames, 1920x1080). Camera and AS's timing unchanged.
- Cape cloth: 0.42 m wide at the shoulders (torso 0.44), 0.74 m at the hem, bowed around his back,
  three folds deepening toward a curved hem.
- Motion: the stiff-board swing on the pivot cut (lift -12 +-8 deg, flare 10 +-10 deg, was -22 +-22 and
  26 +-24); the hem billows via a scrolling cloud Displace weighted to the hem.
- Checks: `blockout/v17-cape-vs-v16.jpg`, `blockout/v17-keyframes.jpg`. APPROVED by Amit, 18 Nov ("Approve v17").

## Style v2 end-frame still (18 Nov, APPROVED)
Amit: "approve 18". `current/still-f240-style-v2-approved.png` (= `style-v2/variant-18.png`).
Seedream 5.5 on Dreamina, prompt `style-v2/prompt-v14.txt`; @Image1 = grey Blender end frame
(`blockout/endframe-v21-nocolour.png`: option 1 position, copy-area towers lowered, still file
`blockout/ref-v20-endframe-still.blend`), @Image2 = Amit's style still (`style-v2/style-ref-amit.png`).
Not yet solved for motion: the camera move that lands on this position (the "breath back" idea).

## Style v2 opening still (18 Nov, APPROVED)
Amit: "Approve v3". `current/still-f001-style-v2-approved.png` (= `style-v2/opening-v3.png`).
Seedream 5.5, prompt `style-v2/opening-prompt-v3.txt`; @Image1 = Blender f001 grey from the still file
(`blockout/opening-f001-v21.png`), @Image2 = the approved end still 18. Sun low at the end of the centre
street with sharp frontal rays; the end still has the light from the left (the camera turns to AS).
