# Front-Stage Restructure — Design Spec

**Date:** 2026-05-31
**Status:** Draft v2 (revised after user review of v1)

## Overview

Restructure the personal site so the work itself sits front and centre. Collapse the surface to two visible pages — Home (`/`) and Work item (`/work/<slug>`) — plus a hidden printable CV at `/cv`. The CV becomes a global mega-footer present on every page. The three existing "writing" posts are case studies of specific roles; each gets folded into the work it belongs to.

`cv.md` stays exactly as it is. The display layer reads from it where needed.

Guiding aesthetic: minimal UX, minimal design, content-heavy.

## What changes (high level)

- **Routes collapse** from seven (`/`, `/about`, `/writing`, `/writing/:slug`, `/experience/:slug`, `/playground`, `/cv`) to two visible + one hidden:
  - `/` — Home
  - `/work/<slug>` — Work item
  - `/cv` — Printable HTML CV (no nav link; reached only via the footer "Download CV" link)
  - Anything else → redirect to `/`
- **Nav reduces** to just `[avatar] Amit Kaplinsky` on the top-left. The centre pill, the Contact button, and the mobile hamburger all go.
- **Home becomes** Hero → Recent Work (5 tiles) → Mega Footer.
- **Experience entries become "Work"** in URLs and labels (`/experience/:slug` → `/work/:slug`).
- **Writing posts merge into their parent work** as the long-form body of that work item. The `/writing` index and post pages go away.
- **About and the linked CV page go away**; their content lives in the mega footer (globally on every page).
- **`cv.md` is not modified.** A new `work.md` is added per work folder, providing case-study-specific fields and the long-form body.

## Information architecture

| Route          | Purpose                                                                 | Sources                                                          |
| -------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `/`            | Home: Hero + Recent Work + Mega Footer                                  | `cv.md` (work meta) + each `work.md` (blurb, excerpt, featured flag) + hero images |
| `/work/<slug>` | One work item: hero image + meta + body + image gallery + footer        | `cv.md` (meta) + `experience/<slug>/work.md` (body) + images     |
| `/cv` (hidden) | Printable HTML CV. Not linked in nav. Reached via footer "Download CV". | `cv.md` only                                                     |
| `*`            | Redirect to `/`                                                         | —                                                                |

## Home page (`/`)

### Hero — the *case study* framing

The Hero promotes a specific case study, not a role. Layout: full-bleed (or wide-contained) editorial block with image + title + 1-line frame + "Read the case study →" affordance.

Fields it reads from the featured work:
- **Image:** the `hero` field in the featured work's `work.md` front-matter (or the first image alphabetically in the folder if `hero` is unset).
- **Title:** the H1 in the markdown body of the featured work's `work.md` (e.g. "Designing for the Supervisor").
- **Frame:** the `excerpt` field in front-matter — 1–2 sentence narrative-flavoured summary of the case study.

Clicking the Hero → `/work/<slug>` for the featured work.

Featured-work selection: a `featured: true` flag in exactly one `work.md`. Build (or content loader) errors if zero or more than one work is flagged. Initial featured pick: **Shift**.

### Recent Work — the *role* framing

A 5-item grid (one tile per workplace). One column on mobile, two on desktop.

Each tile reads:
- **Image:** the same `hero` field from the work's `work.md` (or first alphabetical), unless `tileImage` is set in front-matter.
- **Title:** `company` from the `cv.md` Experience section (e.g. "Shift").
- **Meta line:** `role · period` from `cv.md`.
- **Blurb:** the `blurb` field in `work.md` front-matter — 1–2 sentences, challenge + outcome shape. (Falls back to the `cv.md` summary paragraph if `blurb` is absent — but for this restructure all 5 works will define their own `blurb`.)
- **Click:** `/work/<slug>`.

Order: reverse-chronological, taken from a `order` field in each `work.md` (lower = earlier on the page). Locked initial order: Shift (1), Onyxia (2), Veriti (3), Semperis (4), Check Point (5). Matches the current order in `cv.md`.

The featured work (Shift) appears here as tile #1 *in addition to* being in the Hero. The Hero and the tile are complementary, not repeats — Hero = case-study presentation, tile = role-level presentation. Same destination URL, different framings.

Semperis has no images yet. Its tile renders with the existing `SkeletonImage` pulsing placeholder until images are added.

The current "Shuffle" button is removed.

### Mega Footer

See the "Mega Footer" section below.

## Work item (`/work/<slug>`)

Single centred column. Top to bottom:

1. **Back link** (`← Back` → `/`).
2. **Hero image.** From `work.md` front-matter `hero` field, or the first image alphabetically.
3. **Title.** The H1 of `work.md`'s markdown body if present (the case-study title — e.g. "Designing for the Supervisor"); otherwise the `company` from `cv.md`.
4. **Meta line.** `Role · Company · Period`, read from `cv.md`.
5. **Body.** The markdown body of `work.md` (rendered with `react-markdown` + `remark-gfm`). Inline images reference sibling files by filename. For works where `work.md`'s body holds the full case-study narrative (Shift, Veriti, Check Point), this section is long-form. For works without a case study (Onyxia, Semperis), the body is short — a paragraph or two.
6. **Image gallery.** All images in the folder, excluding the hero image and any images already referenced inline in the body. Stacked vertically, full-width. Click → lightbox (existing component reused).
7. **Mega Footer.**

One layout template handles short and long bodies — only the body length differs.

## Mega Footer (global)

Lives at the bottom of every page (Home and Work item). Two columns on desktop (`md:` and up); stacked on mobile.

**Left column:**
- Profile photo (larger than nav avatar — target ~120 × 120).
- Name: `Amit Kaplinsky`.
- 1-line tagline: `Product designer. AI builder.`
- Contact links (vertical): email, WhatsApp, LinkedIn. Same style as the current `/about` Contact section.

**Right column:**
- A condensed Experience list — 5 rows, one per work, each showing `Role · Company · Period`. Read directly from the `## Experience` section of `cv.md` (untouched).
- "Download CV" link, styled as a button → `/cv` (the hidden printable HTML; user prints to PDF from the browser when they want a file).

**Reveal mechanic.** The current footer uses `position: fixed` behind content + `marginBottom: footerH` to reveal on scroll. Need to verify this still feels right with a taller two-column footer. Likely fine on Home (long page) and on long Work items; potentially overwhelming on short Work items (Onyxia, Semperis). Decide at implementation time: keep reveal mechanic, or switch to in-flow static footer at the end of content. The spec stays neutral on which.

## Content model

```
src/content/
  cv.md                       ← UNCHANGED. Existing format and structure preserved exactly.
  experience/
    shift/
      work.md                 ← new; front-matter + case-study body
      [existing images]       ← keep
      cover-image.webp        ← moved from writing/designing-for-the-supervisor/
    onyxia-cyber/
      work.md                 ← new; front-matter + short body
      [existing images]
    veriti/
      work.md                 ← new; front-matter + case-study body
      [existing images]
      cover-image.webp        ← moved from writing/sailing-the-data-oceans/
      dropdown-row.webp
      outlook-layout.webp
      picker-container.webp
      picker-2.webp
      search-results-picker.webp
    semperis/
      work.md                 ← new; front-matter + short body (no images yet)
    checkpoint/
      work.md                 ← new; front-matter + case-study body
      [existing images]
      cover-image.webp        ← moved from writing/falling-down-the-rabbit-hole/
      HomeTabConcepts.webp
      InitialConcept.webp
      ItemPage.webp
      OnBoarding.webp
      OtherVendors.webp
      packShot.webp
```

### `work.md` shape

YAML front-matter + markdown body:

```markdown
---
blurb: AI-powered vendor security designed from zero — design system, onboarding, every surface owned end to end.
excerpt: Reframing TPRM around the agent doing the work — and the workspace for the human who supervises it.
featured: true                      # at most one work
order: 1                            # tile + footer ordering (asc)
hero: 01-shift-home.png             # optional; defaults to first image alphabetically
tileImage: 01-shift-home.png        # optional; defaults to value of `hero` (or first alphabetical)
---

# Designing for the Supervisor

[case-study body — moved from writing/designing-for-the-supervisor/index.md]
```

The two front-matter blurb fields differ in *what* they describe:
- `blurb` describes the **work** (role-shaped: "I did X at Shift").
- `excerpt` describes the **case study** (narrative-shaped: "Here's the story this case study tells").

**Field semantics:**
- `blurb` — tile copy on the home page (role-level, challenge + outcome).
- `excerpt` — hero copy on the home page (case-study narrative summary). Only meaningful when `featured: true`. Often the same shape/text as `blurb`, but distinct so they can diverge.
- `featured` — boolean. Exactly one `work.md` may set this to `true`.
- `order` — integer used to sort tiles on Home and rows in the footer Experience list.
- `hero` — filename of the hero image used in: the home-page Hero (if featured) AND the work-page hero. Defaults to first alphabetical.
- `tileImage` — filename of the tile image. Defaults to `hero`. Allows the home tile to show a different image from the page hero if desired.
- **Body H1** — used as the case-study title in: the home-page Hero (if featured) AND the work-page title. If absent, the work-page title falls back to `company` from `cv.md`.

For works without a case study (Onyxia, Semperis), `work.md` still exists but:
- `excerpt` and `featured` are omitted.
- Body has no H1 (or just a placeholder); the work-page title falls back to `company`.
- Body is short — a paragraph or two.

### What `cv.md` is used for, post-restructure

Unchanged source. Display layer reads:
- **Header** (name, tagline, contacts) — used by `/cv` printable page and (selectively) by the mega footer.
- **Experience entries** — `role`, `company`, `period`, and summary — used to compose work-item meta lines, mega-footer Experience list, and `/cv` page. The summary text is no longer surfaced on the home page (the per-work `blurb` field takes that slot).
- **Certificates, Education, Skills** — used by `/cv`.

The existing `parseCV()` in `src/lib/content.ts` does not change. New code parses `work.md` files separately and joins on slug.

## Migration

### Delete
- `src/pages/About.tsx`
- `src/pages/Writing.tsx`
- `src/pages/WritingPost.tsx`
- `src/pages/Playground.tsx`
- `src/content/posts.ts`
- `src/content/writing/` (entire folder, after content/image migration below)

### Move
- `src/content/writing/designing-for-the-supervisor/index.md` → merged into the body of `src/content/experience/shift/work.md` (H1 preserved as case-study title).
- `src/content/writing/designing-for-the-supervisor/cover-image.webp` → `src/content/experience/shift/cover-image.webp`.
- `src/content/writing/falling-down-the-rabbit-hole/index.md` → merged into the body of `src/content/experience/checkpoint/work.md`.
- `src/content/writing/falling-down-the-rabbit-hole/*.{webp,jpg,png,gif}` → `src/content/experience/checkpoint/`.
- `src/content/writing/sailing-the-data-oceans/index.md` → merged into the body of `src/content/experience/veriti/work.md`.
- `src/content/writing/sailing-the-data-oceans/*.{webp,jpg,png,gif}` → `src/content/experience/veriti/`.

### Create (new files)
- `src/content/experience/shift/work.md` — front-matter (`featured: true`, `order: 1`, `blurb`, `excerpt`, `hero`) + body (case-study, moved from writing).
- `src/content/experience/onyxia-cyber/work.md` — front-matter (`order: 2`, `blurb`) + short body.
- `src/content/experience/veriti/work.md` — front-matter (`order: 3`, `blurb`, `hero`) + body (case-study, moved from writing).
- `src/content/experience/semperis/work.md` — front-matter (`order: 4`, `blurb`) + short body. No images yet.
- `src/content/experience/checkpoint/work.md` — front-matter (`order: 5`, `blurb`, `hero`) + body (case-study, moved from writing).

### Do NOT modify
- `src/content/cv.md` — stays as-is. Source of truth for header, experience meta, certs, education, skills.

### Rename
- Route `/experience/:slug` → `/work/:slug`.
- `src/pages/ExperienceItem.tsx` → `src/pages/WorkItem.tsx`.
- `src/pages/Work.tsx` retains its filename (now serves the Home route, since the Home and the Work-index were one and the same).

### Rewrite
- `src/pages/Work.tsx` — new Home layout (Hero + Recent Work). Remove Shuffle. Reads `getFeaturedWork()` + `getAllWorks()`.
- `src/pages/WorkItem.tsx` — body + gallery layout per the "Work item" section above. Replaces the current `md:sticky` two-column layout with a single centred column.
- `src/components/Nav.tsx` — strip down to avatar + name only. Drop centre pill, hamburger, Contact button, mobile overlay.
- `src/components/Footer.tsx` — replace existing decorative footer with the mega-footer content above.
- `src/App.tsx` — routes: `/`, `/work/:slug`, `/cv` (no nav surface), `*` → `/`.
- `src/lib/content.ts`:
  - Keep `parseCV()` and existing CV-related exports intact.
  - Add `loadWorks()` that reads all `experience/*/work.md` files via `import.meta.glob` with `?raw`, parses YAML front-matter (via `remark-frontmatter` + `yaml` package, or equivalent), and joins each work's body + front-matter with the matching `cv.md` Experience entry (by slug).
  - Add exports: `getAllWorks()`, `getWorkBySlug()`, `getFeaturedWork()`.
  - Update `imageDimensionsByPath`: remove entries under `../content/writing/...`; add entries under `../content/experience/<slug>/...` for the moved images that need explicit dimensions (Shift cover, Veriti images, Check Point images).
  - Remove `getAllExperienceImages()` (used only by the Shuffle button, which is going away).
  - Remove writing-related exports (`getWritingDetail`).

### Keep (unchanged)
- `src/pages/CV.tsx` — hidden printable view, not linked in nav. Reached only via mega-footer "Download CV".
- `src/content/cv.md`.
- `src/components/SkeletonImage.tsx`, brand icons, `LottieIcon.tsx`.
- Lenis smooth scroll, fade-up animations, slide-down nav, scroll-to-top on route change, lightbox open/close transitions.
- `vite.config.ts`, build/dev scripts, package config.

### Dependencies to add
- `remark-frontmatter` and a YAML parser (`yaml` or equivalent) for front-matter parsing.

## Design principles

1. **Minimal chrome.** Avatar + name in the top-left is the entire nav. The page itself is the UI.
2. **Content carries.** Case studies are the headline content; layouts get out of the way (single centred column, generous spacing, no decoration beyond what's already in the site).
3. **One source per concept.** `cv.md` owns identity + credentials + the experience meta line. Each work's folder owns the per-work narrative (body) + the home-page framing fields (blurb, excerpt, featured, hero). No content lives in two places.

## Decisions made along the way (surface at review)

- **Tile order = reverse-chronological** (Shift → Onyxia → Veriti → Semperis → Check Point), driven by the `order` field in each `work.md`. Matches current `cv.md` order.
- **Hero and Recent Work tile #1 are the same work but different framings.** Hero shows the case-study presentation (image + case-study title + excerpt); tile shows the role presentation (image + company + role/period + work blurb). Same `/work/<slug>` destination.
- **`cv.md` stays exactly as it is.** No content moves out of it. The display layer reads from it.
- **Tile blurbs are net-new copy.** Amit writes 5 fresh challenge/outcome lines as part of populating each `work.md`. The existing `cv.md` summaries are role narratives, not challenge/outcome blurbs; they remain in `cv.md` but are not displayed in the new Home.
- **`/cv` stays as a hidden printable HTML route**, not linked in nav. Mega-footer "Download CV" goes there; user prints to PDF if they want a file.
- **Mega-footer reveal mechanic** stays tentatively; verify during implementation, fall back to in-flow static footer if it fights short-page layouts.

## Out of scope

- No CMS, no runtime fetching, no API. File-driven, rebuild to publish (same as today).
- No new colours, fonts, type tokens, or motion patterns.
- No SEO/meta-tag work as part of this restructure (separate concern).
- No new content beyond what Amit writes for the blurbs/excerpts and the Onyxia + Semperis short bodies.
- No automatic redirects from old URLs (`/about`, `/writing/*`, `/experience/*`, etc.) — they fall through to the `*` route, which redirects to `/`. (A future improvement could preserve `/experience/<slug>` → `/work/<slug>`; not part of this change.)

## Open items (Amit owns)

- Writing each work's `blurb` (1–2 sentences, challenge + outcome) and, for Shift, the `excerpt` (case-study narrative blurb).
- Choosing the hero image filename per work (`hero` field), or accepting the alphabetical-first default.
- Eventually adding Semperis images. Until then, its tile + work page render with the `SkeletonImage` placeholder.
- Generating a static `cv.pdf` from `/cv` if desired (manual one-time export); not required for this restructure to ship.
