# AS hero idle loop v1 (PROPOSAL, NOT RUN, awaiting Amit's yes)

Plays forever after the intro and the pointing clip. Amit (18 Nov): yes to a third, calm loop.

Platform: Dreamina, `seedance_2.5_draft`, first_last_frame, 480p, 16:9, 1 output.
Recommended: 6 s, 78 credits (saved: node_qccf9dr281). A 4 s version is 52 credits
(node_3fy21924pr; its prompt would say 00:00-00:04).

| Order | File | Role |
| --- | --- | --- |
| First frame | `current/still-f144-v4-approved.png` | Same frame the pointing clip starts and ends on |
| Last frame | `current/still-f144-v4-approved.png` | Same again, so it loops with no jump |

## Prompt

The camera does not move for the whole clip. AS stands still on his roof, looking out over the city to the left, exactly as in the first frame. His head, arms, body and legs do not move; only a slow, calm breath in his chest and shoulders.
00:00-00:06: his cape moves in a steady wind the whole time, rippling and lifting in large flat folds, rising and settling in two slow waves, and ends in exactly the shape of the last frame. The soft cream haze between the towers drifts slowly to the right.
The towers and the roof do not move. Flat screen-print illustration style, no outlines, as in the first and last frames. One continuous shot, no cuts. Pure video, no subtitles, no text except his chest badge.

## Result (RUN 18 Nov on Amit's "Yes, 6 seconds", 78 credits) -> idle-6s-480p.mp4

Frames: idle-6s-frames.jpg (0-6 s). IDs: idle-loop-v1-ids.txt.
- Head, arms, body still the whole time (head crops checked). PASS.
- Cape: big billow out to the right from ~1-4 s, settles by 6 s. Strong; reads as wind. PASS.
- Loop seam: last frame vs first frame PSNR ~38 dB, same pose and cape. PASS. No cuts.
- Dreamina "AI" badge on the video.
Preview of the whole order: hero-sequence-preview-480p.mp4 (intro draft 9 -> point A+B -> idle x2).
Status: DRAFT, awaiting Amit.
Seam note: draft 9's last frame is close to, but not the same as, the approved end still (AS and
towers sit slightly further left; PSNR ~14 dB), so intro -> point clip A jumps. The preview uses a
0.5 s cross-fade there. The cross-fade shows a double image mid-fade (crossfade-ghost-check.jpg): not good enough.
Proper fix: finish draft 9 at 1080p, then redo clip A only with that intro's actual last frame as
its first frame (B and idle join on the approved end still and stay as they are).
