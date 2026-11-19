# Seedance draft 6 = option 1 (NOT RUN, awaiting Amit's yes)

Replaces the earlier three-image draft 6 (it broke the skill's two-image limit).

Draft 5's recipe with one change to the reference set: the model sheet is dropped and draft 1's
frame 1 comes in as the opening look. Amit (17 Nov): camera moves of drafts 1 and 5 both work; he
wants draft 1's opening city look and feel with draft 5's ending (city behind him).

Model: `bytedance/seedance-2.5/us/reference-to-video`, `draft: true` (480p preview; a good take can
be completed at 1080p within 7 days without a reroll).

Settings: duration 6, aspect_ratio 16:9, task reference, generate_audio false.

Estimated cost: about $1.25 (fal rate checked 17 Nov: $0.0214 per 1,000 tokens; 854 x 480 x 24 fps
x 6 s / 1024 = ~57.6k tokens = ~$1.23 for the output; the reference clip may add tokens).

## References

| Tag | File | Role |
| --- | --- | --- |
| @Video1 | `blockout/ref-v8-camera-16x9.mp4` (6 s, 1920x1080, 24 fps) | Camera path and framing only |
| @Image1 | `current/still-f144-approved.png` (1920x1080) | AS's appearance, and the end frame's look: city behind him |
| @Image2 | `anchors/draft1-opening-f001.png` (draft 1's frame 1, 854x480, no figure) | The opening's look: rooftops, light rays, haze, sun |

## Prompt

@Video1 is the camera path and framing only. Follow its camera angles, framing and continuous
camera path exactly, frame by frame. Do not use its grey materials, colours or lighting.
@Image1 is AS and the look of the city at the end: use his appearance, costume, mask, chest badge
and cape, and the towers and light behind him. Only one AS on screen. Do not copy its framing.
@Image2 is the look of the city at the opening: the rooftops below, the light rays, the haze and
the low sun. Do not copy its framing or camera angle.

One continuous 6-second shot, no cuts.
0-3.5 s: the camera glides backward, low over the rooftops, down a long straight street toward
AS. It looks out over the city, into a low sun on the horizon ahead. Towers slide past on both
sides.
3.5 s: the camera passes over AS's right shoulder. He stands still at the front edge of his roof,
looking out over the city.
3.5-6 s: the camera keeps pulling back while arcing left around him and settles on a medium shot,
waist up: AS on the right of frame, three-quarter front view, facing left, open sky on the left.

Every tower is a browser-window building as in @Image1 and @Image2: a flat roof with a rim and one
small rooftop box, a title bar with three coloured dots and an address bar on the facade. Each
tower keeps the same shape and detail for the whole move. AS stays still; only his cape moves a
little in the wind. Warm low sun ahead on the horizon, soft cream haze in the distance, gentle
light rays between the towers. Flat illustrated style with clean lines, as in @Image1 and @Image2.

No other people. No text except his chest badge. No binary code or symbols in the sky. No camera
shake.

### Changes vs draft 5's prompt (role rebinding only)

- @Image1 line: was the model sheet ("AS ... All four views in @Image1 show one character"); now
  the end still, AS plus the end look. "All four views" sentence removed (no sheet).
- @Image2 line: was the end still ("look of the city and the light"); now draft 1's opening.
- "as in @Image2" (towers, style) now "as in @Image1 and @Image2". Everything else word for word.

## Dreamina quote attempt (17 Nov)

Canvas "AS hero draft 6": https://dreamina.capcut.com/ai-tool/ai-canvas/0c7d6f22-9e0b-45fd-95db-3124149b926d
Uploaded: video res 781fde0b-8444-4779-a6e1-446b2d9af95a, @Image1 res
3ce00752-7faa-4646-82bf-11b0be604a35, @Image2 res e7fcd616-1176-41f6-bb63-408a3b975614.
Saving the m2v node (480p, 6 s, 16:9) was refused for seedance_2.5_draft, seedance_2.5_flash and
seedance_2.5: "requires VIP membership". Free account, so no node and no quote. Nothing spent.

After Amit subscribed to Basic (17 Nov, 1,575 credits to 17 Dec; 1,791 available incl. 120
expiring 17 Nov 23:59), nodes saved (not run) and quoted, m2v, 6 s, 16:9, same refs and prompt:

| Node | Model | Resolution | Quote (max credits) |
| --- | --- | --- | --- |
| node_3stbg6v2b9 | seedance_2.5_draft | 480p | 156 |
| node_j69qnkwbv1 | seedance_2.5 | 720p | 444 |
| node_zawavgezh5 | seedance_2.5 | 1080p | 1,092 (price check only) |

## Pre-spend checklist

1. Shot spec (Gate 1):        approved: current/motion-spec.md
2. World parts (Gate 2):      hero-base tower look with rims and boxes (Amit, 17 Nov)
3. Character (Gate 3):        locked sheet exists (as-model-sheet-locked.png) but is NOT sent this
                              run; AS comes from the end still only (agreed option 1 risk)
4. Approved still (Gate 4):   approved: current/still-f144-approved.png (this shot's end frame);
                              opening look = draft 1's frame 1, picked by Amit
5. Motion route:              Blender block-out to Seedance; limit: back view of AS rests on one
                              front 3/4 still
6. References:                two images, one role each; no second character (@Image2 has no figure).
                              Caveat: @Image2 is a full shot from draft 1, which looked down more
                              than the Blender camera; the model may copy that angle
7. Prompt, model, price:      above; Seedance 2.5 US draft; ~$1.25 est.
8. Variable changed:          one: reference set (model sheet out, draft 1 opening in), roles rebound

## Result (RUN 17 Nov on Amit's yes, Dreamina Seedance 2.5 Draft, 156 credits; 1,635 left)

Files: `draft6-480p.mp4` (854x480, 60 fps, has audio), `draft6-vs-ref.jpg` (rows t = 0, 2, 3.5,
4.17, 5, 5.95 s; columns Blender | draft 1 | draft 5 | draft 6), `draft6-every12.jpg` (every 0.5 s),
`draft6-first-0.8s.jpg`. IDs in `draft6-ids.txt`. Sample: finish at 1080p within 7 days or lost.

Verdict: DRAFT, FAILS the brief.
- Frame 1 is @Image2 pasted as a still, then a hard cut at 0.05 s (scene detect). Full-shot image
  copied as the opening, as the skill warns.
- 0-3 s: camera dives down through the towers, then flies at one tower with AS tiny on its roof
  and pushes in on him from behind. Blender: a level backward glide with AS unseen until 3.5 s.
- 3-5 s: towers lose their browser detail (plain boxes, no title bars or dots).
- 4.2-6 s: close to Blender; end frame matches the approved still (almost identical to draft 5).
- Opening look (light rays, haze) is there for 0.05-1.5 s, but on the wrong camera move.
