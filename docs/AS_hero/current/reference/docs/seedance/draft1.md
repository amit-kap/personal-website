# Seedance draft 1 (NOT RUN, awaiting Amit's yes)

Model: `bytedance/seedance-2.5/us/reference-to-video`, `draft: true` (480p preview; a good take
can be completed at 1080p within 7 days without a reroll).

Settings: duration 6, aspect_ratio 16:9, task reference, generate_audio false.

Estimated cost: about $1.25 (estimate: fal bills $0.0214 per 1,000 tokens; assumes
width x height x fps x seconds / 1024 for the output only; the reference clip may add tokens).

## References

| Tag | File | Role |
| --- | --- | --- |
| @Video1 | `blockout/ref-v8-camera-16x9.mp4` (6 s, 1920x1080) | Camera path and framing only |
| @Image1 | `current/as-model-sheet-locked.png` | AS: appearance, costume, mask, badge, cape |
| @Image2 | `current/hero-base.png` | Look of the city, the towers and the light |

## Prompt

@Video1 is the camera path and framing only. Follow its camera angles, framing and continuous
camera path exactly, frame by frame. Do not use its grey materials, colours or lighting.
@Image1 is AS: use only his appearance, costume, mask, chest badge and cape. All four views in
@Image1 show one character; only one AS on screen.
@Image2 is the look of the city and the light. Do not copy its framing.

One continuous 6-second shot, no cuts.
0-3.5 s: the camera glides backward, low over the rooftops, down a long straight street toward
AS. It looks out over the city, into a low sun on the horizon ahead. Towers slide past on both
sides.
3.5 s: the camera passes over AS's right shoulder. He stands still at the front edge of his roof,
looking out over the city.
3.5-6 s: the camera keeps pulling back while arcing left around him and settles on a medium shot,
waist up: AS on the right of frame, three-quarter front view, facing left, open sky on the left.

Every tower is a browser-window building as in @Image2: a flat roof with a rim and one small
rooftop box, a title bar with three coloured dots and an address bar on the facade. Each tower
keeps the same shape and detail for the whole move. AS stays still; only his cape moves a little
in the wind. Warm low sun ahead on the horizon, soft cream haze in the distance, gentle light
rays between the towers. Flat illustrated style with clean lines, as in @Image2.

No other people. No text except his chest badge. No binary code or symbols in the sky. No camera
shake.
