# AS hero intro: hand-over (17 Nov 2026)

Load the `video-animation` skill first (SharedContext/Skills/video-animation). Follow its gates and
the pre-spend checklist before every paid call. Two-image limit per Seedance run.

## Where we are

- Camera: locked. Blender block-out `docs/AS_hero/blockout/ref-v8-white.blend`, clip
  `blockout/ref-v8-camera-16x9.mp4` (6 s, 1920x1080). Scripts in `scripts/as-hero/blender/`
  (`build_ref_white.py` -> `build_grid_city.py` -> `key_ref_camera.py`). Spec: `motion-spec.md`.
- Approved stills (Gate 4): `current/still-f001-approved.png`, `still-f100-approved.png`,
  `still-f144-approved.png` (made from the Blender frames with Seedream 5.5 Edit).
- Seedance 2.5 US drafts (480p, `draft: true`; finish at 1080p until 24 Nov; ids in
  `seedance/draftN-ids.txt`, all saved to Amit's fal gallery):
  - Draft 1 (model sheet + hero-base.png): Amit likes its opening city look; end frame lost the city.
  - Draft 5 (model sheet + approved end still, draft 1's prompt): follows the camera, good end with
    city behind him; opening flat (Blender city shows through).
  - Drafts 2-4: failed, lessons in the skill's `lessons.md`.
- Amit: camera moves of drafts 1 and 5 both work. What he wants: draft 1's opening city look and
  feel, with draft 5's ending (city behind him).

## Next step (agreed direction, not yet approved to spend)

Option 1: one Seedance run, two images, model sheet dropped:
- @Image1 = `current/still-f144-approved.png` (AS appearance + end-frame look)
- @Image2 = `seedance/anchors/draft1-opening-f001.png` (draft 1's frame 1: opening city look; no figure)
- Prompt: draft 5's prompt (= draft 1's), roles rebound to these two images.
Risk: AS's back view relies on the end still only. Fallback: option 2 (city pass with a grey
mannequin, then Seedance `editing` pass to swap in AS from the model sheet).
Show Amit the exact prompt, refs, price (~$1.25 est.) and checklist; run only on his yes.

## Spend so far today

5 Seedance drafts (~$6.25 est.) + 6 Seedream stills ($0.18).
