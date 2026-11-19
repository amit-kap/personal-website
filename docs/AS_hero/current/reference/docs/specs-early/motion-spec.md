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
