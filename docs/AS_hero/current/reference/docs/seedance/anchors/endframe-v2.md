# End frame v2, from zero (PROPOSAL, not run; prompt to be agreed with Amit)

Start: Blender frame 144 only (`seedance/anchors/blender-f144.png`, 1920x1080). No earlier still,
no hero-base, no draft frames.

## References (proposal)

| Tag | File | Role |
| --- | --- | --- |
| @Image1 | `seedance/anchors/blender-f144.png` | Layout only: camera, framing, where AS and every tower stand |
| @Image2 | `current/as-model-sheet-locked.png` | AS's look, and the drawing style for the whole image |

## Prompt (draft v1)

Redraw @Image1 as a finished illustration. Keep its exact camera angle, framing and layout: the
standing figure, the position, height and width of every box, the roof edge and the horizon.

The standing figure is AS, drawn exactly as in @Image2: tall athletic man, slim, smooth bald cream
head with a blue domino mask with white eye slits, orange one-piece suit with high collar and
centre zip, blue side panels and shoulder pads, cream shield badge on the left chest with "AS",
long blue cape. Waist-up, three-quarter front view, facing left, looking out over the city.
Only one AS.

Every tall box is a browser-window tower: a plain box with a flat roof, a raised rim and one small
rooftop box. Its top band is a browser bar: a teal-grey title bar with a tab notch, three small
coloured dots, and a long cream address pill. Walls are plain teal and cream panels.
The flat ground is the roof AS stands on.

Style, for everything, as in @Image2: flat mid-century screen-print. Flat colour shapes with hard
edges, no outlines of any kind, no gradients. Shading is a second flat shape in a darker tone.
Each shape has a thin pale peach rim on one side and a dark teal shadow shape slightly offset on
the other, like two print layers out of register. Fine paper grain. Palette: burnt orange, muted
cornflower blue, deep navy, dark teal-grey, warm cream.

Light: warm low sun from the left, soft cream haze between the towers.

Use @Image2 only for AS and the style. Do not copy its poses, its four views or its plain
background. No text except his badge. No other people.

## Open questions for Amit

1. Light at the end: sun from the left with haze (as above), or rays here too?
2. Image model: Dreamina's Seedream 5.5 added an embossed "AI" badge to pass 1. Try another
   Dreamina model (e.g. Nano Banana Pro) for this frame?

## Text-only style test (PROPOSAL, not run)

No images. Tests whether the style words alone give the look. Not the end frame.

A finished illustration, 16:9, for a website hero.

Shot: a medium shot, waist up, from eye level with a 50 mm lens, camera level. A superhero stands on the right third of the frame on a flat rooftop, three-quarter front view, his body turned toward the left, looking out over the city to the left. Behind him and across the left two-thirds of the frame, tall browser-window towers rise from below the roof edge and are cut off by the top of the frame; open sky shows between them. The roof edge runs across the lower part of the frame behind him.

The superhero is AS: tall athletic man, slim, smooth bald cream head with no features except a blue domino mask with white eye slits, orange one-piece suit with high collar and centre zip, blue side panels and shoulder pads, blue cuffs, a cream shield badge on the left chest with the letters "AS" (orange A, navy S), a long blue cape with a darker teal inner side falling in a few large flat folds. Only one person in the image.

Each tower is a plain rectangular box with a flat roof, a raised rim and one small box on the roof. Its top band is a browser bar: a teal-grey title bar with a tab notch, three small coloured dots (orange, green, red) and a long cream address pill. The walls below are plain teal-grey and cream panels.

Style: flat mid-century screen-print poster. Built from flat colour shapes with hard edges. No outlines of any kind, no black or dark lines around shapes, no gradients, no soft airbrush shading. Shading is a second flat shape in a darker tone. Each shape has a thin pale peach rim on one side and a dark teal shadow shape slightly offset on the other, like two print layers out of register. Fine paper grain and a faint riso speckle over all fills. Limited palette: burnt orange, muted cornflower blue, deep navy, dark teal-grey, warm cream on a cream ground.

Light: warm low sun from the left, soft cream haze between the towers.

No text except the badge. No watermark.
seedream test: node=node_s1x9jt4e54 submit=3386d001-47be-46fd-be1e-34896ad1dbd9

### Result: Seedream 5.5 text-only (RUN 17 Nov, 9 credits) -> endframe-t2i-seedream.png

- Style: flat screen-print, no outlines, flat shading shapes, grain/riso speckle. PASS (first image
  today in the sheet's style). Print offset: faint peach rims only. PARTIAL.
- Towers: teal-grey browser bar, tab notch, dots, pill, rim and rooftop box. PASS.
- AS: off-model. Mouth/jaw drawn on the face (sheet: no features but the mask), bulky muscles
  (sheet: slim), wider square badge, blue gloves. FAIL (expected without the sheet).
- Framing: roughly right, not Blender's. Expected.
- "AI" badge top-left again: Seedream 5.5 on Dreamina adds it every time.
- Amit (17 Nov): add the suit's hex colours to the prompt.

## End frame v2 run prompt (saved, NOT RUN): node node_1pmgp62s7t

@Image1 = blender-f144.png (res 76715847-48a0-4db8-ade7-200d2923f117), @Image2 = as-model-sheet-locked.png (res b5ffb512-3013-43cd-9eb7-d88a8ecc49b1)

Redraw @Image1 as a finished illustration, 16:9, for a website hero. Keep its exact camera angle, framing and layout: the standing figure on the right, the position, height and width of every box, the roof edge and the horizon. Use @Image1 only for layout; do not keep its grey colours, smooth 3D shading or empty look.

The standing figure is AS, drawn exactly as in @Image2: tall athletic man, slim, not bulky, about 1:7 head-to-body. Smooth bald cream head with no features at all except a blue domino mask with white eye slits: no mouth, no nose, no ears, no jaw line. Orange one-piece suit with high collar and centre zip, blue side panels and shoulder pads, blue cuffs, orange hands. A cream shield badge on the left chest with "AS" (orange A, navy S), the same badge shape as in @Image2. A long blue cape with a darker teal inner side falling in a few large flat folds. Waist up, three-quarter front view, facing left, looking out over the city. Only one person in the image.

Every tall box is a browser-window tower: a plain rectangular box with a flat roof, a raised rim and one small box on the roof. Its top band is a browser bar: a teal-grey title bar with a tab notch, three small coloured dots (orange, green, red) and a long cream address pill. The walls below are plain teal-grey and cream panels. The flat ground is the roof AS stands on.

Style, for everything: flat mid-century screen-print poster, as in @Image2. Built from flat colour shapes with hard edges. No outlines of any kind, no black or dark lines around shapes, no gradients, no soft airbrush shading. Shading is a second flat shape in a darker tone. Each shape has a thin pale peach rim (#FAC68B) on one side and a dark teal shadow shape (#30616F) slightly offset on the other, like two print layers out of register. Fine paper grain and a faint riso speckle over all fills.

Colours: suit burnt orange #D15E2B; side panels, mask, cuffs and cape muted cornflower blue #5979A7; cape inner side and deep shadows navy #334B6A; towers dark teal-grey #30616F and #4A605E with warm cream #F1DCC4; sky and ground cream #FFF4E2. No other colours.

Light: warm low sun from the left, soft cream haze between the towers.

Use @Image2 only for AS and the drawing style. Do not copy its poses, its four views or its plain background. No text except his badge. No watermark.
end frame v2 run: node=node_1pmgp62s7t submit=ef7af9c0-ca55-447b-a9c5-a02f89e4d563

### Result: end frame v2 (RUN 17 Nov, 9 credits) -> endframe-v2.png (2560x1440)

Compare: endframe-v2-compare.jpg (Blender f144 | v2 | old approved still).
- Layout: matches Blender f144 (AS right third, head and torso at the same size and height, tall
  towers on the left cut by the top, roof edge). PASS.
- Style: flat print, no outlines, peach print-offset rims on AS, grain and speckle. PASS.
- AS: slim, sheet's hex badge, mask only, orange hands, blue cuffs. PASS. A small teal shadow
  shape under the chin could read as a jaw. Minor.
- Towers: browser bar, dots, pill, rim, rooftop box. PASS. Haze tints some towers peach.
- "AI" badge top-left. FAIL as a video reference until handled.
Status: candidate end still, awaiting Amit's Gate 4 decision.

Amit (17 Nov): "i like this". Changes asked: more grain ("here or in the video"); more work on the
tower browser tab. Not yet final (Gate 4 open until the tab is done).
Tab close-ups: endframe-v2-tabs.jpg.

## End frame v3: apply browser bar v3 (saved, NOT RUN): node node_ye7m4yvtm2

@Image1 = endframe-v2.png (res c5a64546-8d5c-4af7-adea-1fe19447cb1b), @Image2 = tower/browser-bar-tile-v3.png (res 897c255b-9f0b-439e-8147-655a81cc4203)

Edit @Image1: change only the browser bar at the top of every tower. Replace it with the browser bar shown in @Image2, drawn the same way on every tower that shows its top:
a dark teal title bar with three round window dots on the left, red, yellow, green from left to right; a real browser tab with a rounded top and flared shoulders, the same light teal as the toolbar, holding a small orange favicon square, a dark label bar and a small close x; a darker inactive tab next to it and a small plus sign; below it a light teal toolbar holding one cream address pill that runs the full width of the toolbar; a thin navy line under the toolbar.
Fit the bar to each tower's perspective and size, and continue it around the corner onto the tower's side face. Keep each tower's roof rim and rooftop box above the bar.
Keep everything else exactly as it is: AS, the cape, the badge, the roof, the tower walls, every tower's position and size, the haze, the light, the colours and the flat screen-print style with no outlines.
Use @Image2 only for the bar's design. Do not copy its flat front-on view, its walls or its background. No outlines. No text. No watermark.
end frame v3 run: node=node_ye7m4yvtm2 submit=ad365ef9-2044-4ff3-9086-916a2c721485

### Result: end frame v3 (RUN 17 Nov, 9 credits) -> endframe-v3.png

Compare: endframe-v3-vs-v2.jpg, endframe-v3-zoom.jpg (v2 | v3).
- Bars on all four towers now: dots red/yellow/green, tab with favicon, label and x, inactive tab,
  +, full-width pill. PASS.
- Tab shape: reads as a small rounded rectangle; the flared shoulders are barely visible. PARTIAL.
- Side faces repeat a second set of dots and a second pill instead of continuing the bar. Minor.
- AS, roof, walls, haze, light, style: unchanged. PASS.
- "AI" badge top-left (carried over).

APPROVED by Amit, 17 Nov ("Approve it"): end frame v3 is the Gate 4 end still.
Copied to `current/still-f144-v3-approved.png`. It replaces `current/still-f144-approved.png`
(outlined, superseded; file kept). Open: Dreamina "AI" badge top-left; grain to add in post.
