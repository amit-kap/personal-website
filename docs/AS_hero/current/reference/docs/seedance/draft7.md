# Seedance draft 7 (NOT RUN, awaiting Amit's yes)

Draft 6 with one change: @Image2 is the approved Gate 4 opening still
(`current/still-f001-approved.png`, made from Blender frame 1, no figure) instead of draft 1's
frame 1. Reason: draft 6 pasted @Image2 as its first frame and then cut to a different camera
move. If the model copies this still as the opening, it copies the Blender camera's own framing.

Platform: Dreamina, model `seedance_2.5_draft` (sample; finish at 1080p within 7 days or lost),
mode m2v, 480p, 6 s, 16:9, 1 output. Audio cannot be turned off (muted on the site).
Canvas: https://dreamina.capcut.com/ai-tool/ai-canvas/0c7d6f22-9e0b-45fd-95db-3124149b926d

## References

| Tag | File | Role |
| --- | --- | --- |
| @Video1 | `blockout/ref-v8-camera-16x9.mp4` (6 s, 1920x1080, 24 fps) | Camera path and framing only |
| @Image1 | `current/still-f144-approved.png` (1920x1080) | AS's appearance, and the end frame's look |
| @Image2 | `current/still-f001-approved.png` (1920x1080, Blender frame 1, no figure) | The opening's look |

## Prompt

Draft 6's prompt word for word (= draft 5's prompt with roles rebound; Amit chose to keep it,
17 Nov). See `draft6.md`, section Prompt.

## Pre-spend checklist

1. Shot spec (Gate 1):        approved: current/motion-spec.md
2. World parts (Gate 2):      hero-base tower look with rims and boxes (Amit, 17 Nov)
3. Character (Gate 3):        sheet locked, not sent; AS from the end still only (held up in draft 6)
4. Approved still (Gate 4):   both images are approved Gate 4 stills made from this shot's Blender
                              frames (f001 start, f144 end)
5. Motion route:              Blender clip -> Seedance 2.5 Draft on Dreamina
6. References:                clip + two images, one role each, no figure in @Image2; full-frame
                              images, but each matches the Blender framing at its own moment
7. Prompt, model, price:      draft 6's prompt; Seedance 2.5 Draft 480p; quote below
8. Variable changed:          one vs draft 6: @Image2

## Dreamina node (saved, not run)

Node `node_gndkp13w8z`. Refs in order: video 781fde0b-8444-4779-a6e1-446b2d9af95a, @Image1
3ce00752-7faa-4646-82bf-11b0be604a35, @Image2 5887e6e2-3fda-4ded-aa25-044a9dec96de (f001 approved).
Prompt text checked identical to draft 6 apart from the @Image2 ID.

## Result (RUN 17 Nov on Amit's yes, Dreamina Seedance 2.5 Draft, 156 credits)

Files: `draft7-480p.mp4` (854x480, 60 fps, has audio), `draft7-vs-ref.jpg` (rows t = 0, 1, 2, 3,
3.5, 4.17, 5, 5.95 s; columns Blender | draft 1 | draft 5 | draft 7), `draft7-first-1s.jpg`.
IDs in `draft7-ids.txt`. Sample: finish at 1080p within 7 days of 17 Nov or lost.

Verdict: DRAFT, passes my checks; Amit to judge the look.
- No cuts (scene detect finds none); frame 1 is not a pasted still.
- 0-3.5 s: level backward glide down the street to the sun, as in Blender; AS unseen.
- 3.5 s: AS's head enters lower left, as in Blender. 4.2 s over-shoulder back view, 5 s profile.
- End frame matches the approved still (same as draft 5).
- Towers keep title bars, dots and address bars through the whole move.
- Opening look: warm haze and soft rays, closer to the approved f001 than to draft 1, which has
  stronger rays, a blue sky gradient and a deeper street. Draft 5's opening was flatter.
