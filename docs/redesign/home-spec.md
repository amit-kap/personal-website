# Redesign spec — Home (exact match to Paper)

**Rule: the Paper design is the spec. Match it one to one — copy, colours, sizes, spacing, radii, borders, layout. Do not "improve" anything, including copy that looks like a typo or a duplicate.**

Source: Paper file `peronal-website` (fileId `01M43H5TY00X3ZJPM7B68E9DAE`), frame `home-page` (node `H5-0`, 1440 wide). Read exact values with `get_jsx` (format `inline-styles`) and `get_computed_styles`. Never read values from screenshots.

## Paper token mapping
Paper's token names are the light-theme names, but the frame is dark. Resolve by **value**, not by name:
`--color-background` = #FFFFFF (white text in Paper), `--color-foreground` = #111111 (panel), `--color-secondary` = #F4F4F2, `--color-copy` = #454542, `--color-muted-foreground` = #70706D, `--color-primary` = #F04A00, `--color-primary-foreground` = #FFFFFF, `--color-dark-background` #0F0F0E, `--color-dark-foreground` #F2F2EF, `--color-dark-copy` #B8B8B2, `--color-dark-muted-foreground` #8F8F8A, `--color-dark-border` #262624. Radius `container` 14px. Font Inter (400 / 500).
In the site, express these through tokens (add site tokens if one is missing) so the light theme can come later — but the rendered values must equal Paper's.

## Node map
centre column `HD-0` · header `HE-0` · hero `HG-0` · featured `J1-0` · recent work `I4-0` · problem `LO-0` · solution `NN-0` · footer `MK-0`.

## Allowed differences (only these)
- Page halftone = animated `DotWaves` canvas (orange dots on #0F0F0E); footer halftone = contained DotWaves with dark dots on orange. Paper shows stills of these.
- Featured 16:9 frame plays `public/shift-walk.mp4` (muted loop, poster `public/featured-shift.webp`).
- Recent Work tiles and the Shift block are links to their case studies (no visible change; accessible names required). The arrow button links to `/work/shift`.
- Header nav items are links (Work → `/`, About → `/about`); clocks are live (Asia/Jerusalem).
- Below 1440 / 960 widths: only shrink and stack to fit (16px gutters, no horizontal scroll at 390px). At ≥ 1440 the page must match Paper.
- Entrance `Reveal` animations may stay.
