# AS hero film: prompts and settings (test 001, 19 Nov 2026)

How the final videos were made, in order. Everything needed to redo a step is here.
Final files: `final/up-bytedance-1080p.mp4` (intro, 16 s) and `final/loop-bytedance-1080p.mp4` (idle loop, 6 s).

## Files

| Folder | What |
| --- | --- |
| `final/` | The two finished 1080p videos used by `../../html-preview/preview.html` |
| `assets/` | Stills (start, mid, pointing), the loop's first/last frame, the camera clip, the Blender source |
| `sources/` | The Kling 720p outputs that the finals were upscaled from |
| `../../style-ref/` | `style-ref-amit.png` (style), `style-ref-amit-2.png` (AS close-up: head, mask, shield) |
| `../../badge/` | `as-badge.svg` (traced from the close-up; script `scripts/as-hero/badge_trace.py`) |

## 1. Camera clip (Blender)

- `assets/ref-v22-white.blend` (one working file, v22), 384 frames at 24 fps, 1920x1080, EEVEE. Scripts: `scripts/as-hero/blender/v22_*.py`.
- Head of the stand-in figure scaled x0.8 (`v22_smaller_head.py`) so the styled stills do not copy a big head.
- Render: `Blender -b <copy>.blend -s 1 -e 384 -a`, then ffmpeg to H.264 -> `assets/ref-v22-camera-16x9.mp4` (16.0 s).
- Layout frames used for the stills: frame 1 (opening), frame 150 (mid, rooftops), frame 290 (the point). Re-render them from the blend if needed.

## 2. Stills (Dreamina Seedream 5.5, i2i, 16:9, 2K, 1 output, 9 credits each)

Canvas project `0c7d6f22-9e0b-45fd-95db-3124149b926d`. Each prompt has a layout image (grey Blender frame), a style image and, for the pointing still, the AS close-up.

**Pointing still** -> `assets/point-frame-v22.png` (node `node_jd0v79fje9`; four rounds, 36 credits). Images: [layout] grey frame 290; [style] `style-ref-amit.png`; [close-up] `style-ref-amit-2.png`.

> [layout] is a layout guide only: keep the position of every shape, the camera angle and the framing. Do not use its grey colours or its plain look.
> [style] defines the style: the drawing and line work, the colours, the warm light, the soft haze, and how AS and the browser towers are drawn. Do not copy its composition or camera angle.
> [close-up] shows AS up close: copy his head, mask, costume, cape and the AS shield on his chest exactly from it, nothing redrawn. His head is smooth and faceless apart from the blue mask band.
>
> AS is the superhero in [style] and [close-up]: draw him exactly as he is drawn there. He stands on a rooftop on the right, pointing toward the left, and looks at the viewer.
> Browsercity is a city whose towers look like browser windows. The tall shapes in [layout] are browser towers; the left side is open sky above a low skyline.
> The foreground is a plain flat rooftop with a low edge. No window, no browser panel and no buttons on the roof or its edge.
> Soft warm haze only: no light rays, no beams.
>
> Lots of open space.
>
> No text except the letters on his shield.

**Opening still** -> `assets/start-frame-v22.png` (node `node_2zzd78c3b7`, 9 credits). Images: [layout] grey frame 1; [style] the pointing still above.

> [layout] is a layout guide only: keep the position of every shape, the camera angle and the framing. Do not use its grey colours or its plain look.
> [style] defines the style: the drawing and line work, the colours, the warm light, the haze and the light rays, and how the browser towers are drawn. Do not copy its composition, its camera angle or the figure.
>
> Browsercity is a city whose towers look like browser windows. Every box in [layout] is a browser tower; the dark band down the middle is the street between them.
> Strong, sharp volumetric light rays: the sun sits low behind the skyline at the end of the centre street, and crisp, clearly edged beams fan out from it toward the viewer, through the gaps between the towers and across the haze.
>
> No people in this shot. No text.

**Mid still** -> `assets/mid-frame-v22.png` (node `node_vhwgyg5xrd`, two rounds, 18 credits). Images: [layout] grey frame 150; [style] the pointing still.

> [layout] is a layout guide only: keep the position of every shape, the camera angle and the framing. Do not use its grey colours or its plain look.
> [style] defines the style: the drawing and line work, the colours, the warm light, the haze and the light rays, and how the browser towers are drawn. Do not copy its composition, its camera angle or the figure.
>
> Browsercity is a city whose towers look like browser windows. Every box in [layout] is a browser tower; the dark narrow band is the street far ahead.
> Even the far towers keep their browser bars: a title bar, three dots and an address bar on the facade.
> Cool blue-grey towers with warm light, as in [style]: not amber, not sepia.
> Strong, sharp volumetric light rays: the sun sits low behind the skyline at the end of the centre street, and crisp, clearly edged beams fan out from it toward the viewer, through the gaps between the towers and across the haze.
>
> No people in this shot. No text.

The Dreamina "AI" badge in the top-left corner was removed locally (a clean patch copied from the same rows, ffmpeg crop + overlay).

## 3. Intro: Kling 4.0 reference-to-video

`kling/v4/reference-to-video`, 720p, 16:9, 16 s -> `sources/kling4-v22-720p.mp4`. About $3.01 (video-reference rate $0.094/s billed on input + output length). Request `01a1f2c1-e1d3-7401-b8ea-ed84a251f8cd`.
Inputs: `@Video1` = `assets/ref-v22-camera-16x9.mp4`; `@Image1` = `assets/point-frame-v22.png`; `@Image2` = `assets/start-frame-v22.png`; `@Image3` = `assets/mid-frame-v22.png`.

> @Video1 is a fine blockout reference and the sole guide for camera position, camera movement, framing and timing, and for how AS moves. Preserve its structure, spatial layout, camera height, camera movement, framing and the figure's movements exactly, frame by frame. Do not use its grey materials or empty look.
> @Image1 is AS and the look of the city at the end: use his appearance, costume, mask, chest badge, cape and his pointing hand, and the towers and light behind him. Only one AS on screen. Do not copy its framing.
> @Image2 is the look of the city at the opening: the rooftops, the light rays, the haze and the low sun. Do not copy its framing.
> @Image3 is the look of the city in the middle of the shot: the rooftops, the far towers with their browser bars, the haze and the light rays. Do not copy its framing.
>
> Every box in @Video1 is a browser-window tower as in @Image1, @Image2 and @Image3: a flat roof with a rim and one small rooftop box, a title bar with three coloured dots and an address bar on the facade. The dark band down the middle at the start is the street between the towers, and the dark lines between the boxes are streets far below. The plain white slab at the bottom at the end is AS's flat rooftop, with no window or panel on it. The standing figure is AS; the blue band on its head is his mask and shows where he looks; the blue sheet behind it is his cape. Each tower keeps the same shape and detail for the whole shot.
>
> AS moves exactly like the figure in @Video1, with the same timing: he points to the upper left and looks at the camera, holds, then lowers his arm and looks back to the left. His hand points with the index finger, as in @Image1. His cape moves in the wind the whole time he is on screen, rippling and lifting in large flat folds.
> Warm low sun on the horizon, soft cream haze in the distance, gentle light rays between the towers.
> Flat illustrated screen-print style, as in @Image1, @Image2 and @Image3.
>
> One continuous shot, no cuts of any kind. Pure video, no subtitles. No other people. No text except his chest badge.

## 4. Upscale to 1080p: Bytedance

`fal-ai/bytedance-upscaler/upscale/video`, about $0.12 for 16 s. Settings: `target_resolution` 1080p, **`target_fps` 24** (the default 30 retimes the clip), `enhancement_tier` standard, `enhancement_preset` aigc, `fidelity` high. -> `final/up-bytedance-1080p.mp4` (1920x1080, 385 frames, 16.045 s). It smooths the film grain.

## 5. Idle loop: Kling 4.0, start image = end image

`kling/v4/reference-to-video`, 720p, 16:9, 6 s, no video reference ($0.157/s, about $0.94). `start_image_url` and `end_image_url` = `assets/loop-first-last-frame.png` (the last frame of the 1080p intro). -> `sources/loop-kling4-720p.mp4`. Request `01a1f2f3-360d-7f41-a17f-a2564539893c`.

> A locked-off shot on a rooftop in a flat illustrated screen-print style. One continuous shot, no cuts of any kind. The first and last frames are identical, so the shot loops. AS, the superhero in the orange suit with a blue mask and a blue cape, stands on the right and looks out over the city to the left. For the first 1.5 seconds he looks out to the left. From 1.5 to 2.5 seconds only his head turns to face the camera; his shoulders and body stay still. From 2.5 to 4 seconds he holds, looking at the camera. From 4 to 5 seconds his head turns back to look out over the city to the left. From 5 to 6 seconds he settles into the exact starting pose. His cape moves in the wind the whole time, in slow rolling folds, and returns to its starting shape at the end. The haze drifts slowly. The towers, the roof and the sky do not move. The camera does not move or zoom. Only one AS on screen. No other people. No text except his chest badge. Pure video, no subtitles.

Upscaled with the same Bytedance settings (about $0.04) -> `final/loop-bytedance-1080p.mp4` (1920x1080, 145 frames, 6.04 s).

## 6. Page

`../../html-preview/preview.html` plays the intro once, then the loop; the headline fades in at 8.5 s; film grain over the video with on-screen sliders; the AS badge (`../../badge/as-badge.svg`) is the logo.
Cancelled: SeedVR2 upscale (no output after 18+ minutes).
