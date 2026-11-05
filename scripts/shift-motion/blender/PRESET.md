# Blender glass preset: "v11" (the look on the site, approved)

Reference: `public/shift-motion.mp4`. Verified 2026-11-04 by re-rendering frames 150, 330 and 500 of its cache
(`cache-final-hq`, 876 faces at 3120x1654): the settings below reproduce it.

The settings live in `../film/film.config.json` and are applied by `../film/film.mjs`. Do not render with loose `SHIFT_*`
variables for anything that is shown.

1. Look `plate-eevee`: EEVEE, the background plate as the camera backplate, a soft contact-shadow plane under the card.
   (`limbo` is the older studio look. It does not use the HDRI and is not the approved look.)
2. HDRI `hdri/studio_small_09_2k.exr`, rotation 90, scale 1.0. Seen only by non-camera rays, so the glass reflects it.
   Desaturated 35%, warm tint, highlights c/(c+0.6)*1.6.
3. Screen emission (glow) 0.9. At 1.05 the screen washes out the reflections.
4. Coat weight 1.0, roughness 0.012, IOR 1.6. Slab roughness 0.015. Depth of field f/2.8.
5. Faces exported at 3x (4680x2481 for the 1560x827 screen), JPEG 4:4:4. 1x faces are soft in the zooms (zoom up to 3.0).
6. Samples 128 for finals, 32 for `--draft`. Motion blur position START, shutter 0.35. View transform Standard.
7. Encode crf 16, slow, tagged bt709.

## Quality gate
`node film/film.mjs gate` renders 4 moments (zoom, flip, flat, end card) at the locked settings beside the same kinds of
moments from the approved site film. Show Amit a film only after the gate sheet looks as sharp and as glassy as the reference.
