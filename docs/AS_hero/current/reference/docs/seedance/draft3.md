# Seedance draft 3 (NOT RUN, awaiting Amit's yes)

Rewritten after research on how Seedance 2.5 uses a 3D block-out ("white-model") video.

Model: `bytedance/seedance-2.5/us/reference-to-video`, `draft: true` (480p; finish at 1080p
within 7 days). Settings: task `reference`, duration 6, aspect_ratio 16:9, generate_audio false.
Same three uploaded files as drafts 1 and 2. Estimated cost about $1.25.

## What changed and why

| Draft 1-2 did | Guidance says | Draft 3 does |
| --- | --- | --- |
| Described the whole camera move in words ("glide down a long straight street", beat times) | Don't restate what the video defines; re-describing conflicts with it. Draft 2 took "down a long street" literally and flew into street canyons | No camera description at all; only "@Video 1 defines camera position, movement, framing and timing" |
| Called @Video1 a "camera path" only | Call it a fine blockout; list what to preserve and what to replace | "@Video 1 is a fine blockout reference. Preserve ... Re-render ..." |
| Never said what the grey shapes are | Map every primitive to a reference | Boxes = browser towers, the standing figure = AS, light strips = pavements |
| Used hero-base.png for "look" without limits | Bind each image to one role and exclude the rest (our own skill rule: references leak their layout) | @Image 2: palette, line style, light and tower design only; not its composition or camera angle |
| "No cuts" | 2.5 may cut anyway | "One continuous shot, no cuts of any kind" |

Sources: Seedance 2.5 production notes from ByteDance's official guides
(github.com/smixs/visual-skills, video/references/seedance-25.md); seedanceai.cc camera-motion
FAQ; seeddance.io white-model examples; Dreamina Seedance 2.5 prompt guide.

Note: the `editing` task I suggested earlier is for partial edits (swap one subject or background)
with everything else kept; a full restyle of a block-out is done with `reference` + fine blockout
wording, as above.

## Prompt

@Video 1 is a fine blockout reference and the sole guide for camera position, camera movement,
framing and timing. Preserve its structure, spatial layout, camera position, camera movement and
framing exactly, frame by frame. Do not use its grey materials, plain grey sky or empty look.
Re-render the scene in the style of @Image 2.

In @Video 1: every tall box is a browser-window tower. The light strips around the boxes are
pavements and the dark ground is the street. The standing figure with the red body and blue cape
is AS.

@Image 1 defines AS: use only his appearance, costume, mask, chest badge and cape. All four views
in @Image 1 show the same one character; only one AS on screen.
@Image 2 defines the palette, the clean line style, the light and the tower design (title bar
with three coloured dots, address bar, roof rim, rooftop box). Do not use its composition or its
camera angle.

Warm low sun on the horizon ahead of the city, soft cream haze in the distance, gentle light rays
between the towers. AS stands still; only his cape moves a little in the wind. Every tower keeps
the same shape and detail for the whole shot.

One continuous shot, no cuts of any kind. No other people. No text except his chest badge. No
symbols in the sky. No camera shake. Pure video, no subtitles.
