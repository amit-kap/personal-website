# Shift film pipeline

One command renders the film at the same quality and resolution every time (1920x1080, 30 fps, 3x card faces,
approved glass look). Source of truth for timing, copy and motion: `../final.html`. Quality settings: `film.config.json`.

```bash
node film.mjs all        # export, render only changed frames, composite captions, encode -> build/out/film.mp4
```

Needs the preview server (`.claude/launch.json` "shift-motion-preview", port 8932), Blender, ffmpeg and Chrome.
First time: `npm i` in this folder.

## What to run after an edit

| You changed | Run | Blender |
| --- | --- | --- |
| Caption text, typing speed, caption timing | `node film.mjs captions` | no |
| Anything in a shot, a screen, the background, timing | `node film.mjs all` | only changed frames |
| `film.config.json` render settings or `build.py` | `node film.mjs all` | every frame |
| Encode settings only | `node film.mjs encode` | no |

A frame's cache key hashes its face, background, pose (this and the next frame), the render config and `build.py`.
A frame that did not change is never rendered twice. A timing insert shifts frame numbers but keeps the hashes.
`node film.mjs status` shows how many frames would render. `--draft` renders at 32 samples into its own cache keys.

## Quality locks
1. `film.config.json` is the only place quality is set. `build.py` reads it through `SHIFT_CONFIG`.
2. Hard checks that stop a run: face width must be exactly 1560x3 (also asserted inside Blender), frame counts must match,
   a face far smaller than its neighbours (a dropped tile) fails, and Blender's sidecar must match the config.
3. `node film.mjs gate` renders 4 moments next to the approved site film. Look at `build/gate.png` before a full run.
4. See `../blender/PRESET.md` for the approved settings and why.

## Cost (this machine)
About 20 s for the gate, 30+ min for a full export at 3x, about 1 s per rendered frame at 64 samples (roughly twice at 128).
`build/` is gitignored and about 1 GB for a full film.
