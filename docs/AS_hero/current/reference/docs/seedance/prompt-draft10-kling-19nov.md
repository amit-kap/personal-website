# Test 001: Kling 4.0 / Wan 3.0 Prime with the v22 camera and style-v2 stills

Same setup as the 18 Nov test (`fal-cheap-test.md`): same prompt, same models, one clip plus images.
Changed: camera clip v16 -> v22, stills -> style v2 made from the v22 frames, a third (mid) image.
Status: Kling RUN 19 Nov (request 01a1f2c1-e1d3-7401-b8ea-ed84a251f8cd, about $3.01: video-reference rate $0.094/s x 32 s) -> `kling4-v22-720p.mp4`; Wan not run. Changed lines marked `(changed)`.

## Inputs

| Tag | File | Role |
| --- | --- | --- |
| @Video1 | `ref-v22-camera-16x9.mp4` (16 s, 1920x1080, 24 fps, 384 frames, smaller head) | Camera, framing, timing, and AS's movements |
| @Image1 | `point-frame-v22.png` (v22 frame 290) | AS's appearance, his pointing hand, the end look |
| @Image2 | `start-frame-v22.png` (v22 frame 1) | The opening's look |
| @Image3 | `mid-frame-v22.png` (v22 frame 150) | The look of the rooftops and the far city (changed: new) |

## Models

- **Kling 4.0:** `kling/v4/reference-to-video`, 720p, 16:9, 16 s. `video_urls` = [Video 1],
  `image_urls` = [Image 1, Image 2, Image 3]. $0.094/s with a video reference, billed on input + output length (min 2x output): 32 s = about **$3.01** at 720p, **$4.51** at 1080p ($0.141/s). No draft mode.
- **Wan 3.0 Prime:** `alibaba/wan-3.0-prime/reference-to-video`, 720p, 16:9, audio off,
  `enable_prompt_expansion: false`. Reference video is capped at 15 s: use a copy trimmed to 15 s
  (cut from the final still hold). About $0.045/s x (15 s out + 15 s in) = **$1.35**.
  Wan uses "Video 1" / "Image 1" instead of @Video1 / @Image1.

## Prompt

@Video1 is a fine blockout reference and the sole guide for camera position, camera movement,
framing and timing, and for how AS moves. Preserve its structure, spatial layout, camera height,
camera movement, framing and the figure's movements exactly, frame by frame. Do not use its grey
materials or empty look.
@Image1 is AS and the look of the city at the end: use his appearance, costume, mask, chest badge,
cape and his pointing hand, and the towers and light behind him. Only one AS on screen. Do not copy
its framing.
@Image2 is the look of the city at the opening: the rooftops, the light rays, the haze and the low
sun. Do not copy its framing.
(changed) @Image3 is the look of the city in the middle of the shot: the rooftops, the far towers
with their browser bars, the haze and the light rays. Do not copy its framing.

Every box in @Video1 is a browser-window tower as in @Image1, @Image2 and @Image3: a flat roof with
a rim and one small rooftop box, a title bar with three coloured dots and an address bar on the
facade. (changed) The dark band down the middle at the start is the street between the towers, and
the dark lines between the boxes are streets far below. (changed) The plain white slab at the
bottom at the end is AS's flat rooftop, with no window or panel on it. The standing figure is AS; the blue
band on its head is his mask and shows where he looks; the blue sheet behind it is his cape. Each
tower keeps the same shape and detail for the whole shot.

AS moves exactly like the figure in @Video1, with the same timing: he points to the upper left and
looks at the camera, holds, then lowers his arm and looks back to the left. His hand points with the
index finger, as in @Image1. His cape moves in the wind the whole time he is on screen, rippling and
lifting in large flat folds.
Warm low sun on the horizon, soft cream haze in the distance, gentle light rays between the towers.
Flat illustrated screen-print style, as in @Image1, @Image2 and @Image3.

One continuous shot, no cuts of any kind. Pure video, no subtitles. No other people. No text
except his chest badge.

## Pre-spend checklist
1. Shot spec (Gate 1):        v22 camera path (motion-spec.md, in `_archive/2026-11-19/`)
2. World parts (Gate 2):      browser tower and bar, from the style refs
3. Character (Gate 3):        AS from `style-ref/style-ref-amit.png` and `style-ref-amit-2.png`
4. Approved stills (Gate 4):  start, mid, pointing: approved by Amit 19 Nov, badge removed
5. Motion route:              Blender block-out (camera + figure motion) to Kling / Wan on fal
6. References:                one video and three images, one role each; no second character
7. Prompt, model, price:      above; Kling about $2.51, Wan about $1.35
8. Variable changed:          camera v16 -> v22, stills -> style v2, mid image added (same models)

## Judge against the clip (same checks as 18 Nov)
Level glide with no dive, tower detail through the move (far towers at 4-6 s), point and head turn
together at about 12 s, arm down after, one arm throughout, cape shaped like a cloth cape (not a
flat sheet), no cuts, no "AI" badge.

## Result: Kling 4.0, 19 Nov (DRAFT, 720p, 16 s, saved to the fal Library)
Files: `kling4-v22-720p.mp4`, `kling4-vs-ref-1.jpg` (t = 0.5, 2.5, 4, 5.5, 7) and `-2.jpg` (t = 9, 11, 12, 13, 15.8); top row Blender v22, bottom row Kling.
- Camera follows v22: level glide down the street, over the rooftops, to AS. No cuts (scene detection, 0 hits).
- Far and mid towers at 4-6 s keep browser bars (the Nov 18 failure); the mid still worked.
- AS: faceless head, AS shield, cloth cape, index-finger point; arm up from about 11 s, down by 15.8 s; one arm.
- Roof: plain slab, no window.
- Off: sky is a stronger teal-to-amber gradient than the stills; output has a generated audio track (mute it); 1280x720 only.
- Not checked: head-turn timing against the clip, cape through every frame, loop-readiness.

## Idle loop (19 Nov): Kling 4.0, 720p, 6 s, then Bytedance 1080p
Start and end image = `loop-first-last-frame.png` (last frame of `up-bytedance-1080p.mp4`). No video reference: $0.157/s x 6 s = about $0.94, upscale about $0.04.
Prompt: locked shot, first and last frames identical; head turns to the camera at 1.5-2.5 s, holds to 4 s, turns back 4-5 s, settles 5-6 s; cape moves the whole time and returns to its start shape; haze drifts; camera, towers, roof and sky do not move; one AS; no other people; no text except his chest badge.
Files: `loop-kling4-720p.mp4` (source), `loop-bytedance-1080p.mp4` (final: 1920x1080, 24 fps, 145 frames, 6.04 s).
Checks: seam frames (intro last | loop first | loop last) look identical in pose and cape; first and last frame SSIM 0.98; head turn happens (a little earlier than 1.5 s). In the preview the loop sits under the intro and starts when it ends.
