# Seedance draft 4 (NOT RUN, awaiting Amit's yes)

Model: `bytedance/seedance-2.5/us/reference-to-video`, `draft: true` (480p; finish at 1080p within
7 days). Settings: task `reference`, duration 6, aspect_ratio 16:9, generate_audio false.
Estimated cost about $1.25.

Changed vs draft 3: the style image (hero-base.png, a different shot with AS in it) is replaced by
the three approved stills made from this clip's own frames. Prompt follows the skill's Seedance
rules; it binds each still to its moment in @Video 1.

## References

| Tag | File | Role |
| --- | --- | --- |
| @Video 1 | `blockout/ref-v8-camera-16x9.mp4` | Fine blockout: camera, framing, timing, layout |
| @Image 1 | `current/as-model-sheet-locked.png` | AS: appearance only |
| @Image 2 | `current/still-f001-approved.png` | The finished look of @Video 1's first frame |
| @Image 3 | `current/still-f100-approved.png` | The finished look of @Video 1 at 4 seconds |
| @Image 4 | `current/still-f144-approved.png` | The finished look of @Video 1's last frame |

## Prompt

@Video 1 is a fine blockout reference and the sole guide for camera position, camera movement,
framing and timing. Preserve its structure, spatial layout, camera position, camera movement and
framing exactly, frame by frame. Do not use its grey materials, plain grey sky or empty look.

In @Video 1: every tall box is a browser-window tower. The light strips around the boxes are
pavements and the dark ground is the street. The standing figure with the red body and blue cape
is AS.

@Image 2, @Image 3 and @Image 4 show the finished look of @Video 1 at its first frame, at 4
seconds, and at its last frame. Match them at those moments: the same towers, colours, light and
style. They are the same scene as @Video 1, not new shots.
@Image 1 defines AS: use only his appearance, costume, mask, chest badge and cape. All four views
in @Image 1 show the same one character; only one AS on screen, and only where the standing figure
is in @Video 1. Do not use @Image 1's background.

AS stands still; only his cape moves a little in the wind. Every tower keeps the same shape and
detail for the whole shot.

One continuous shot, no cuts of any kind. No other people. No text except his chest badge. No
symbols in the sky. No camera shake. Pure video, no subtitles.

## Pre-spend checklist

1. Shot spec (Gate 1):        approved: motion-spec.md, camera locked 17 Nov
2. World parts (Gate 2):      hero-base tower look with rims and boxes (Amit, 17 Nov)
3. Character (Gate 3):        locked: as-model-sheet-locked.png
4. Approved still (Gate 4):   approved 17 Nov: current/still-f001 (grid redo A), f100, f144
5. Motion route:              Blender block-out to Seedance; limits stated
6. References:                one role each; no second character; stills are this shot's own frames
7. Prompt, model, price:      above; Seedance 2.5 US draft; about $1.25 (estimate)
8. Variable changed:          one: style image replaced by the three approved stills
