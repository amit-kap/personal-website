# Front-Stage Restructure — Design Spec

**Date:** 2026-05-31
**Status:** Draft v3 (revised after user clarified the content model)

## Overview

Restructure the personal site so the work itself sits front and centre. Collapse the surface to two visible pages — Home (`/`) and Work item (`/work/<slug>`) — plus a hidden printable CV at `/cv`. The CV becomes a global mega-footer present on every page. The three existing "writing" posts are case studies; each is linked to the work it's about and rendered as a section on that work's page.

The content model has three orthogonal file types, each self-contained:

1. **`cv.md`** — standalone, ready-for-print CV. Untouched by this restructure.
2. **`writing/<slug>/case-study.md`** — one per case study; includes everything it needs to render (title, excerpt, body, sibling images).
3. **`experience/<slug>/work.md`** — one per work; includes everything that work needs to render its tile and page (blurb, body, sibling images).

The display layer joins them at render time.

Guiding aesthetic: minimal UX, minimal design, content-heavy.

## What changes (high level)

- **Routes collapse** from seven (`/`, `/about`, `/writing`, `/writing/:slug`, `/experience/:slug`, `/playground`, `/cv`) to two visible + one hidden:
  - `/` — Home
  - `/work/<slug>` — Work item
  - `/cv` — Printable HTML CV (no nav link; reached only via the footer "Download CV" link)
  - Anything else → redirect to `/`
- **Nav reduces** to just `[avatar] Amit Kaplinsky` on the top-left. The centre pill, the Contact button, and the mobile hamburger all go.
- **Home becomes** Hero → Recent Work (5 tiles) → Mega Footer.
- **`/experience/:slug` becomes `/work/:slug`.** Same content with new URL shape.
- **The `/writing` index and individual writing post pages go away** as visible routes. The writing/ folder stays; each case study is rendered as a section embedded in its parent work's page.
- **About and the linked CV page disappear** from the nav. Their content lives in the mega footer (globally on every page).
- **A new `work.md`** is added to every experience folder, holding per-work data (blurb, optional body, optional image-filename hints).
- **`cv.md` is not modified.**

## Information architecture

| Route          | Purpose                                                            | Sources                                                                            |
| -------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| `/`            | Home: Hero + Recent Work + Mega Footer                             | Featured `case-study.md` (Hero) + each `work.md` (tiles) + `cv.md` (tile meta + footer Experience list) |
| `/work/<slug>` | One work item: hero image + meta + body + gallery + linked case study (if any) + footer | `cv.md` (meta) + `experience/<slug>/work.md` + linked `writing/<slug>/case-study.md` if one references this work + images from both folders |
| `/cv` (hidden) | Printable HTML CV. Not linked in nav. Reached via footer "Download CV". | `cv.md` only                                                                       |
| `*`            | Redirect to `/`                                                    | —                                                                                  |

## Home page (`/`)

### Hero — the featured case study

A single, full-bleed (or wide-contained) editorial block promoting one case study. The case-study unit is the unit promoted here, not the work unit.

Layout: image + title + 1-line frame + "Read the case study →" affordance.

Fields, all read from the case study marked `featured: true`:
- **Image:** the `cover` field in front-matter (filename within `writing/<slug>/`), or the first image alphabetically in the folder if `cover` is unset.
- **Title:** the H1 of the case study's markdown body (e.g. "Designing for the Supervisor").
- **Frame:** the `excerpt` field in front-matter — 1–2 sentence narrative summary.

Click → `/work/<work-slug-from-case-study-front-matter>`.

Featured selection: a `featured: true` flag in exactly one `case-study.md`. Build (or content loader) errors if zero or more than one is flagged. Initial featured pick: **Designing for the Supervisor** (which references work `shift`).

### Recent Work — the role-level grid

A 5-item grid, one tile per workplace. One column on mobile, two on desktop.

Each tile reads:
- **Image:** the `tileImage` field in `work.md` front-matter, or `hero`, or the first image alphabetically in the work's folder.
- **Title:** `company` from `cv.md` (e.g. "Shift").
- **Meta line:** `role · period` from `cv.md`.
- **Blurb:** the `blurb` field in `work.md` front-matter — 1–2 sentences, challenge + outcome shape.
- **Click:** `/work/<slug>`.

Order: ascending by the `order` field in each `work.md`. Locked initial order:
1. Shift
2. Onyxia
3. Veriti
4. Semperis
5. Check Point

The Hero promotes the featured case study (Shift's case study). The Recent Work grid's tile #1 is also Shift. These are complementary, not repeats — Hero = case-study presentation, tile = role-level presentation. Same `/work/shift` destination, different framing fields.

Semperis has no images yet. Its tile renders with the existing `SkeletonImage` pulsing placeholder until images are added.

The current "Shuffle" button is removed.

### Mega Footer

See the "Mega Footer" section below.

## Work item (`/work/<slug>`)

Single centred column. Top to bottom:

1. **Back link** (`← Back` → `/`).
2. **Hero image.** From `work.md` `hero` front-matter, or the first image alphabetically in the experience folder.
3. **Title.** `company` from `cv.md` (e.g. "Shift").
4. **Meta line.** `Role · Company · Period` from `cv.md`.
5. **Work overview body.** The markdown body of `work.md` (1–3 paragraphs about the role overall). Rendered with `react-markdown` + `remark-gfm`. Inline images, if any, reference sibling files in the work's experience folder.
6. **Image gallery.** All images in the experience folder, excluding the hero and any images referenced inline in the work body. Stacked vertically, full-width. Click → lightbox (existing component reused).
7. **Case study section (conditional).** If a `case-study.md` exists with `work: <this-slug>` in its front-matter, the case study is rendered as a section here:
   - Section divider (consistent with existing case-study styling).
   - The case study's H1 as a section title.
   - The case study's markdown body, with inline images resolved from the writing folder (sibling files of `case-study.md`).
8. **Mega Footer.**

Same template for all work items. The work overview body is always present (every `work.md` has one). The case study section appears only when a case study references this work.

## Mega Footer (global)

Lives at the bottom of every page (Home and Work item). Two columns on desktop (`md:` and up); stacked on mobile.

**Left column:**
- Profile photo (larger than nav avatar — target ~120 × 120).
- Name: `Amit Kaplinsky`.
- 1-line tagline: `Product designer. AI builder.`
- Contact links (vertical): email, WhatsApp, LinkedIn. Same style as the current `/about` Contact section.

**Right column:**
- A condensed Experience list — 5 rows, one per work, each showing `Role · Company · Period`. Read directly from the `## Experience` section of `cv.md`.
- "Download CV" link, styled as a button → `/cv` (the hidden printable HTML; user prints to PDF from the browser when they want a file).

**Reveal mechanic.** The current footer uses `position: fixed` behind content + `marginBottom: footerH` to reveal on scroll. Need to verify this still feels right with a taller two-column footer. Likely fine on Home and on long Work items; potentially overwhelming on short Work items (Onyxia, Semperis). Decide at implementation time: keep the reveal, or switch to in-flow static footer at the end of content.

## Content model

```
src/content/
  cv.md                              ← UNCHANGED. Standalone CV. Drives /cv and footer.
  experience/
    shift/
      work.md                        ← NEW. Front-matter + work-overview body.
      [existing Shift images]        ← unchanged
    onyxia-cyber/
      work.md                        ← NEW.
      [existing Onyxia images]
    veriti/
      work.md                        ← NEW.
      [existing Veriti images]
    semperis/
      work.md                        ← NEW.  (no images yet — Amit adds later)
    checkpoint/
      work.md                        ← NEW.
      [existing Check Point images]
  writing/
    designing-for-the-supervisor/
      case-study.md                  ← renamed from index.md, front-matter added
      cover-image.webp
    falling-down-the-rabbit-hole/
      case-study.md                  ← renamed from index.md, front-matter added
      cover-image.webp
      HomeTabConcepts.webp
      InitialConcept.webp
      ItemPage.webp
      OnBoarding.webp
      OtherVendors.webp
      packShot.webp
    sailing-the-data-oceans/
      case-study.md                  ← renamed from index.md, front-matter added
      cover-image.webp
      dropdown-row.webp
      outlook-layout.webp
      picker-container.webp
      picker-2.webp
      search-results-picker.webp
```

### `work.md` shape

YAML front-matter + markdown body:

```markdown
---
blurb: AI-powered vendor security designed from zero — design system, onboarding, every surface owned end to end.
order: 1
hero: 01-shift-home.png             # optional; defaults to first image alphabetically
tileImage: 01-shift-home.png        # optional; defaults to `hero` (or first alphabetical)
---

I lead design at Shift, an AI-powered vendor security platform. Came in to design the product from zero — design system, onboarding, every surface end to end. Most of the work lives behind the curtain for now; more once we're public.
```

**Front-matter fields:**
- `blurb` — tile copy on Home (role-level, challenge + outcome shape). Required.
- `order` — integer, ascending. Drives tile order on Home and row order in the mega-footer Experience list. Required.
- `hero` — filename of hero image used on the work page top. Optional; defaults to first image alphabetically.
- `tileImage` — filename of the Recent Work tile image. Optional; defaults to `hero` (and ultimately to first alphabetical).

**Body:**
- 1–3 paragraphs describing the work at the role level (what you did at this company overall). Rendered as the work-overview body on the work page.
- No H1 in the body — the work page's title comes from `cv.md`'s `company`.

### `case-study.md` shape

YAML front-matter + markdown body. (The existing writing posts are renamed from `index.md` to `case-study.md` and gain front-matter.)

```markdown
---
work: shift                         # slug of the parent work (which experience/<slug>/ this case study belongs to)
excerpt: Reframing TPRM around the agent doing the work — and the workspace for the human who supervises it.
featured: true                      # at most one case study; surfaces on Home Hero
cover: cover-image.webp             # optional; defaults to first image alphabetically
---

# Designing for the Supervisor

[full case-study body — moved verbatim from the current writing post's body]
```

**Front-matter fields:**
- `work` — slug of the work this case study belongs to (must match a folder under `experience/`). Required.
- `excerpt` — narrative-shaped 1–2 sentence summary used in the Home Hero. Required if `featured: true`.
- `featured` — boolean. Exactly one case study sets this to `true`. Required.
- `cover` — filename of the cover image used in the Home Hero. Optional; defaults to first image alphabetically.

**Body:**
- H1 = case-study title (e.g. "Designing for the Supervisor"). Required.
- Markdown body — the full narrative. Inline images reference sibling files in `writing/<slug>/`.

### What `cv.md` is used for

Unchanged source. Display layer reads:
- **Header** (name, tagline, contacts) — used by `/cv` print view.
- **Experience entries** — `role`, `company`, `period` — used to compose work-page meta lines, mega-footer Experience list, and `/cv`. The existing summary paragraph remains in `cv.md` for `/cv`; the home Recent Work tiles use the `blurb` field from `work.md` instead.
- **Certificates, Education, Skills** — used by `/cv` (and not surfaced elsewhere).

`parseCV()` in `src/lib/content.ts` does not change. New code parses `work.md` and `case-study.md` files separately and joins on slug.

### Joining content at render time

- **Featured case study:** look across all `case-study.md` files, pick the one with `featured: true` (error if not exactly one). Used by Home Hero.
- **Work by slug:** load the `work.md` from `experience/<slug>/`. Cross-reference `cv.md` Experience entries by slug for meta. Used by `/work/<slug>` and by Recent Work tiles.
- **Case study by work:** look across all `case-study.md` files for one where `work === <slug>`. Used by `/work/<slug>` to render the embedded case-study section.

The slug for any work is the experience folder name (`shift`, `onyxia-cyber`, `veriti`, `semperis`, `checkpoint`). The slug for any case study is its writing folder name (`designing-for-the-supervisor`, etc.). They are different namespaces, joined by the case study's `work` front-matter field.

## Migration

### Delete
- `src/pages/About.tsx`
- `src/pages/Writing.tsx` (the writing index page)
- `src/pages/WritingPost.tsx` (the standalone writing-post page)
- `src/pages/Playground.tsx`
- `src/content/posts.ts` (writing-index metadata; replaced by case-study.md front-matter)

### Rename
- `src/content/writing/designing-for-the-supervisor/index.md` → `case-study.md`.
- `src/content/writing/falling-down-the-rabbit-hole/index.md` → `case-study.md`.
- `src/content/writing/sailing-the-data-oceans/index.md` → `case-study.md`.
- Route `/experience/:slug` → `/work/:slug`.
- `src/pages/ExperienceItem.tsx` → `src/pages/WorkItem.tsx`.
- `src/pages/Work.tsx` retains its filename (now serves the Home route).

### Create
- `src/content/experience/shift/work.md`
- `src/content/experience/onyxia-cyber/work.md`
- `src/content/experience/veriti/work.md`
- `src/content/experience/semperis/work.md`
- `src/content/experience/checkpoint/work.md`

Each new `work.md` carries front-matter (blurb, order, optional hero/tileImage) and a 1–3 paragraph work-overview body.

### Edit (front-matter added)
- `src/content/writing/designing-for-the-supervisor/case-study.md` — add front-matter (`work: shift`, `excerpt`, `featured: true`, optional `cover`).
- `src/content/writing/falling-down-the-rabbit-hole/case-study.md` — add front-matter (`work: checkpoint`, `excerpt`, optional `cover`).
- `src/content/writing/sailing-the-data-oceans/case-study.md` — add front-matter (`work: veriti`, `excerpt`, optional `cover`).

Existing body content is preserved verbatim (with whatever H1 it has at the top).

### Do NOT modify
- `src/content/cv.md` — stays exactly as-is.
- Existing images under `src/content/experience/<slug>/` and `src/content/writing/<slug>/` — stay in place.

### Rewrite
- `src/pages/Work.tsx` — new Home layout (Hero + Recent Work). Remove Shuffle. Reads `getFeaturedCaseStudy()` and `getAllWorks()`.
- `src/pages/WorkItem.tsx` — body + gallery + optional case-study-section layout per the "Work item" section above. Replaces the current `md:sticky` two-column layout with a single centred column.
- `src/components/Nav.tsx` — strip down to avatar + name only. Drop centre pill, hamburger, Contact button, mobile overlay.
- `src/components/Footer.tsx` — replace existing decorative footer with the mega-footer content described above.
- `src/App.tsx` — routes: `/`, `/work/:slug`, `/cv` (no nav surface), `*` → `/`.
- `src/lib/content.ts`:
  - Keep `parseCV()` and existing CV-related exports intact.
  - Replace the writing-content glob (`writing/*/index.md`) with one targeting `writing/*/case-study.md`.
  - Parse YAML front-matter from `work.md` and `case-study.md` files via `remark-frontmatter` + `yaml` (or equivalent).
  - Add exports: `getAllWorks()`, `getWorkBySlug(slug)`, `getFeaturedCaseStudy()`, `getCaseStudyForWork(slug)`.
  - Remove `getAllExperienceImages()` (used only by the Shuffle button, which is going away).
  - Remove `getWritingDetail()` (writing posts no longer rendered as standalone pages).

### Keep (unchanged)
- `src/pages/CV.tsx` (hidden printable view, reachable only via mega-footer "Download CV").
- `src/content/cv.md`.
- All existing image files in `experience/` and `writing/` folders.
- `src/components/SkeletonImage.tsx`, brand icons, `LottieIcon.tsx`.
- Lenis smooth scroll, fade-up animations, slide-down nav, scroll-to-top on route change, lightbox open/close transitions.
- `vite.config.ts`, build/dev scripts, package config.

### Dependencies to add
- `remark-frontmatter` and `yaml` (or equivalent) for front-matter parsing.

## Design principles

1. **Minimal chrome.** Avatar + name in the top-left is the entire nav. The page itself is the UI.
2. **Content carries.** Case studies are the headline content; layouts get out of the way (single centred column, generous spacing, no decoration beyond what already exists).
3. **Three orthogonal file types.** `cv.md` owns identity + credentials. `work.md` owns per-work data. `case-study.md` owns per-case-study data. Each file is self-contained with its own images. Display layer joins them by slug.

## Decisions made along the way (surface at review)

- **Tile order = reverse-chronological** (Shift → Onyxia → Veriti → Semperis → Check Point), driven by the `order` field in each `work.md`. Matches current `cv.md` order.
- **Hero and Recent Work tile #1 are different framings of the same work.** Hero = case-study presentation (cover image + case-study title + excerpt); tile = role presentation (work image + company + role/period + blurb). Same `/work/shift` destination.
- **`cv.md` is not touched.** No content moves out; display layer reads from it.
- **Tile blurbs are net-new copy.** Amit writes 5 fresh challenge/outcome lines as part of populating each `work.md`.
- **Featured-on-home flag lives on the case study,** not on the work — because the hero promotes a case study, not a work.
- **Mega-footer reveal mechanic** stays tentatively; verify during implementation, fall back to in-flow static footer if it fights short-page layouts.
- **`writing/` folder name is kept** (no rename to `usecases/`). The UI labels the embedded section as "Case Study"; folder name is internal.

## Out of scope

- No CMS, no runtime fetching, no API. File-driven, rebuild to publish (same as today).
- No new colours, fonts, type tokens, or motion patterns.
- No SEO/meta-tag work as part of this restructure (separate concern).
- No automatic redirects from old URLs (`/about`, `/writing/*`, `/experience/*`, etc.) — they fall through to the `*` route, which redirects to `/`. (A future improvement could preserve `/experience/<slug>` → `/work/<slug>`; not part of this change.)
- No new content beyond what Amit writes for the work blurbs/bodies and the case-study `excerpt` lines.

## Open items (Amit owns)

- Writing each work's `blurb` (1–2 sentences, challenge + outcome) and the work-overview body (1–3 paragraphs).
- Writing each case study's `excerpt` (narrative-shaped 1–2 sentence summary, for the Hero on Home — at minimum for the featured one).
- Choosing the hero/tileImage filename per work (or accepting the alphabetical-first default).
- Adding Semperis images. Until then, its tile + work page render with the `SkeletonImage` placeholder.
- Generating a static `cv.pdf` from `/cv` if desired (manual one-time export); not required for this restructure to ship.
