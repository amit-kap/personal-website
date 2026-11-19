# Gate 4 stills from the Blender frames (NOT RUN, awaiting Amit's yes)

Model: `bytedance/seedream/v5.5/edit`, $0.03 per image (fal pricing, 17 Nov). 3 frames x 1 image
= $0.09. Output 1920x1080 PNG, so each still matches the video frame exactly.

## References (same for every frame)

| Figure | File | Role |
| --- | --- | --- |
| Figure 1 | `blender-f001.png` / `blender-f100.png` / `blender-f144.png` | Composition, camera angle, framing, building layout |
| Figure 2 | `current/as-model-sheet-locked.png` | AS only (frames 100 and 144) |
| Figure 3 | `style-tile-towers.png` (tight crop of hero-base, no sky, no figure) | Tower design, palette, line style |

## Prompt (shared part)

Repaint Figure 1 as a finished illustration. Keep Figure 1's exact composition, camera angle,
horizon line, framing, and every building's position, size and outline. Every grey box becomes a
browser-window tower in the style of Figure 3: a flat roof with a rim and one rooftop box, a title
bar with three coloured dots and an address bar on the facade. The dark ground is the street and
the light strips are pavements. Use Figure 3's palette, clean line style and flat colour. Warm low
sun on the horizon ahead of the city, soft cream haze in the distance, gentle light rays. Do not
use Figure 3's composition. No text except his chest badge. No symbols in the sky.

## Per frame (added at the end)

- Frame 1: No people in this image.
- Frame 100: The red-and-blue figure in Figure 1 is AS, seen from behind: his costume, bald head
  and long blue cape exactly as in Figure 2. Only one AS. Do not use Figure 2's background or
  ground shadows.
- Frame 144: The red-and-blue figure in Figure 1 is AS, three-quarter front view, facing left: his
  costume, blue domino mask, chest badge and blue cape exactly as in Figure 2. Only one AS. Keep
  his position and size from Figure 1. Do not use Figure 2's background or ground shadows.
