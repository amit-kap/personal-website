# AS hero style (DRAFT, not locked)

Source: `as-model-sheet-locked.png`. Colours sampled from that file.
Rule: the whole hero (AS and the city) uses this one style. No ink outlines.

## Style prompt (reuse word for word)

Flat mid-century poster illustration, screen-print look.

Shapes: built from flat colour blocks with hard edges. No outlines, no gradients,
no soft airbrush shading. Shading is a second flat shape in a darker tone.

Print offset: each object has a slightly misregistered edge, a thin pale peach
rim (#FAC68B) on one side and a dark teal shadow shape (#30616F) offset on the
other, like two print layers out of register.

Texture: fine paper grain and a faint halftone/riso speckle over all fills.

Palette (limited):
- burnt orange #D15E2B
- muted cornflower blue #5979A7
- deep navy #334B6A
- dark teal-grey #30616F / #4A605E
- warm cream #F1DCC4 on a cream ground #FFF4E2

Mood: calm, confident, retro; simple and graphic, not glossy or 3D.

## AS (character)

Tall athletic man, about 1:7 head-to-body, slim not bulky. Smooth bald cream head
with no features except a blue domino mask with white eye slits. Orange one-piece
suit with high collar and centre zip, blue side panels and shoulder pads, blue cuffs,
orange boots with blue tops. Cream shield badge on the left chest with "AS": orange A,
navy S. Long blue cape with a darker teal inner side, falling in a few large flat folds.

## Browser tower (APPROVED 2026-11-16: orange chrome)

A plain rectangular box with a flat roof. Nothing sticks out anywhere: no rooftop box,
no ledges, no bevels, no raised panels. All detail is flat print on the surface.

- Top section (the top cube of the tower): painted on every side as a Chrome tab strip:
  navy title bar, three small round dots at the left, one lighter tab joined to the
  toolbar below, a long rounded cream address pill. Wraps around the corner.
- Walls below: one equal grid of identical windows, the same on every floor top to
  bottom. A horizontal separator between floors, a thin vertical separator between
  windows on a floor. No variation, no bands, no missing or faded windows.

Approved design: `tower/tower-34-v2-orange.svg` (Paper page "08 — Browsercity tower",
artboard "Tower v2 — orange chrome"). Generator: `tower/tower_gen.py iso orange`.

- Chrome, lit side: title bar orange #D15E2B, toolbar and tab cream #FFF4E2, pill #E2C3A0,
  dots cream / peach / navy, navy #334B6A divider line under the toolbar.
- Chrome, shadow side: title bar #A4481F, toolbar #D7BFA3, pill #B89878, divider #263A52.
- Glass: lit #5979A7 with cream #F1DCC4 frames; shadow #334B6A with #4A605E frames.
- Grid: panes ~1:2 (30x62), 3px mullions, 8px floor bands, 12 floors, 10 x 7 panes.
- Roof: plain cream #F1DCC4. Sharp box corners. Peach rim on the lit edge, teal offset shadow.
- Grain/print texture: not in the design; added at render stage.

## Change 2026-11-16 (Amit): monotone towers

Supersedes the orange chrome. Towers are monotone (grey, cream, light blue); windows barely
visible; the browser chrome uses the same shades as the building, no orange.
Values: `scripts/as-hero/blender/build_hero_still.py` (PALETTE=mono, the default).
Status: DRAFT until Amit approves layout v7.

## Change 2026-11-16 (Amit): Browsercity reference buildings

Buildings follow the Browsercity reference look (the image Amit shared, saved as
current/hero-base.png (= _archive/renders/endframe-medium-v1-1.png)):
- Thin dark ink lines only as dividers inside a building side (panel and chrome divisions).
  No outlines around buildings.
- Raised roof rim and rooftop boxes: yes (more realistic). Supersedes "nothing sticks out".
- Red, amber, green browser dots: must have, so people get the concept.
