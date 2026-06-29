# Home Page UI Redo — Design Spec

**Date:** 2026-06-29
**Scope:** Rebuild the home page (`/`) as a single, vertically-scrolled, full-bleed
section layout with scroll-driven reveals and parallax. New "light & refined"
visual language. Detail pages (`/work/:slug`, `/case-studies/:slug`, `/cv`) are
**out of scope** and remain unchanged. No content changes.

Figma file `YMsFww5QWig1nMWlmdyI2o` (node `2001:2`) is used as a **section/layout
reference only** — not a pixel/style copy.

---

## Goals

- Replace the current home page with a new visual language (keep structure-as-sections,
  rethink the look).
- Single page, all sections stacked vertically, full-bleed bands with centered content.
- Scroll-driven animation + parallax within and between sections, kept restrained.
- Reuse all existing content and data APIs (`src/lib/content.ts`). No content edits.

## Non-Goals

- No redesign of detail pages, `Nav`, or the shared `Footer` used by detail pages.
- No information-architecture changes (same routes, same content).
- No new content, no CMS changes, no copy rewrites.

---

## Section layout (top to bottom)

1. **Hero** (~100vh)
   - Left: name ("Amit Kaplinsky") in Bodoni display, tagline below in Jakarta.
   - Right: portrait from `public/profile.jpg`, soft-rounded.
   - Motion: text fade-up on load; portrait gentle parallax (drifts slower than scroll).

2. **Featured case study** (full-bleed, ~100vh)
   - Full-bleed cover image of the `featured: true` case study (Designing for the Supervisor).
   - Overlaid bottom-left: "Featured" label, title (Bodoni), blurb (Jakarta).
   - Entire band links to `/case-studies/:slug`.
   - Motion: cover image parallax + slow scale; overlay text fades up on enter.

3. **Recent Work** — top 3 works by `order` (Shift, Onyxia, Veriti)
   - One stacked section per work, **consistent layout** for all three:
     headline (`productTitle`, Bodoni) top-left, then two image cards below
     (first two images from the work's folder via `getImagesForSlug`).
   - Each section links to `/work/:slug`.
   - Motion: headline slides/fades in on enter; the two cards parallax at slightly
     offset rates.

4. **Case Studies** — all 3 writing pieces
   - "Case Studies" heading, then a zig-zag list: each row is thumbnail ⇄ title + blurb,
     alternating sides row to row.
   - Each row links to `/case-studies/:slug`.
   - Motion: rows reveal with stagger on enter; thumbnails slight parallax.

5. **Footer** (dark band)
   - Profile image + name, contact links.
   - Built as a home-only section component (`HomeFooter`) so the shared `Footer`
     used by detail pages is untouched.

---

## Visual language — "light & refined", tonal / near-mono

- **Palette:** warm off-white background, soft near-black ink (not pure `#000`),
  muted grey for secondary text. **No chromatic accent** — hierarchy comes from
  weight, scale, and contrast only. The "Featured" label and links use ink/grey,
  not color.
- **Type:** Bodoni Moda for display headings; Plus Jakarta Sans for body, labels,
  meta. (Both already loaded in `index.css`.)
- **Form:** generous whitespace; full-bleed bands with a centered max-width content
  column; **soft rounded corners** on image cards (move off the current `--radius: 0`);
  borders/shadows used sparingly.
- Update CSS tokens in `src/index.css`: introduce a non-zero `--radius`, soften
  `--background`/`--foreground`/`--muted-foreground` toward the warm-off-white +
  soft-ink scheme. These tokens are shared, so changes must be checked against the
  detail pages to avoid regressions (verify in browser).

## Motion — GSAP + ScrollTrigger

- Add `gsap` dependency. Use `@gsap/react`'s `useGSAP` for setup/cleanup in React 19.
- A small shared helper/hook encapsulates the common reveal + parallax patterns so
  each section stays focused.
- **All animation wrapped in `gsap.matchMedia()`**: `prefers-reduced-motion: reduce`
  disables parallax entirely and converts reveals to instant (or simple opacity) —
  no transform-based motion under reduced motion.
- Parallax via transforms only (no layout-affecting properties) for performance.

---

## Component structure (home only)

- `src/pages/Home.tsx` — composes the sections. Repoint the `/` route in `App.tsx`
  to `Home`.
- `src/components/home/Hero.tsx`
- `src/components/home/FeaturedCaseStudy.tsx`
- `src/components/home/RecentWork.tsx` (renders 3 work sections)
- `src/components/home/CaseStudies.tsx`
- `src/components/home/HomeFooter.tsx`
- `src/lib/useScrollMotion.ts` (or similar) — shared `useGSAP` reveal/parallax helper.

### Data (no changes to `content.ts`)

- Recent Work: `getAllWorks()` (already sorted by `order`), take first 3.
- Work images: `getImagesForSlug(slug)` — first two.
- Featured: `getFeaturedCaseStudy()`.
- Case Studies list: `getAllCaseStudies()` with `coverImage`.
- Portrait/profile: `public/profile.jpg`.

### Dead code

- `src/pages/Work.tsx` becomes unused once `/` points to `Home`. Flag for removal
  (remove only after confirming nothing else imports it).

---

## Success criteria

- `npm run build` passes (tsc + vite).
- Home renders all five sections in order with real content.
- Scroll reveals and parallax run smoothly; verified in the browser preview.
- `prefers-reduced-motion` disables parallax and instant-reveals content (verified).
- Detail pages (`/work/:slug`, `/case-studies/:slug`, `/cv`) still render correctly
  after the shared CSS-token changes (verified in browser).
- Responsive: sections degrade to a single-column, stacked layout on narrow viewports.
