# Front-Stage Restructure — Design Spec

**Date:** 2026-05-31
**Status:** Draft

## Overview

Restructure the personal site so the work itself sits front and centre. Collapse the surface to two visible pages — Home (`/`) and Work item (`/work/<slug>`) — plus a hidden printable CV at `/cv`. The CV becomes a global mega-footer present on every page. The three existing "writing" posts are case studies of specific roles; each is merged into the work it belongs to. The result: a portfolio whose primary unit is *the work*, with the CV as supporting evidence in the footer.

Guiding aesthetic: minimal UX, minimal design, content-heavy.

## What changes (high level)

- **Routes collapse** from seven (`/`, `/about`, `/writing`, `/writing/:slug`, `/experience/:slug`, `/playground`, `/cv`) to two visible + one hidden:
  - `/` — Home
  - `/work/<slug>` — Work item
  - `/cv` — Printable HTML CV (no nav link; reached only via the footer "Download CV" link)
  - Anything else → redirect to `/`
- **Nav reduces** to just `[avatar] Amit Kaplinsky` on the top-left. The centre pill, the Contact button, and the mobile hamburger menu all go.
- **Home becomes** Hero → Recent Work (5 tiles) → Mega Footer.
- **Experience entries become "Work"** in URLs and labels (`/experience/:slug` → `/work/:slug`).
- **Writing posts merge into their parent work** as the long-form body of that work item. The `/writing` index and post pages go away.
- **About and the linked CV page go away**; their content lives in the mega footer (globally).
- **Per-work content moves to per-work folders** owning a single `work.md` plus images.

## Information architecture

| Route          | Purpose                                                        | Source of content                                              |
| -------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| `/`            | Home: Hero + Recent Work + Mega Footer                         | `work.md` front-matter for all works; selected work's hero image |
| `/work/<slug>` | One work item: hero image + meta + body + image gallery + footer | `experience/<slug>/work.md` + images in that folder            |
| `/cv` (hidden) | Printable HTML CV. Not linked in nav.                          | `cv.md` (non-work parts) + all `work.md` front-matter          |
| `*`            | Redirect to `/`                                                | —                                                              |

## Home page (`/`)

### Hero
- A single, manually-chosen featured work, rendered as a full-bleed editorial block (image + headline + 1-line frame + "Read →" affordance).
- Image source: the featured work's hero image.
- Headline source: the work's `title` (e.g., "Designing for the Supervisor").
- Frame source: the work's `blurb` (1–2 sentences, challenge + outcome).
- Clicking anywhere in the hero → `/work/<slug>` for the featured work.
- Featured-work selection: a `featured: true` flag in exactly one `work.md` front-matter. Build fails (or content loader throws) if zero or more than one work is marked featured.
- Initial featured pick: **Shift** (`experience/shift/work.md`).

### Recent Work
- A 5-item grid (one per workplace). One column on mobile, two on desktop. Order: reverse-chronological — explicitly Shift → Onyxia → Veriti → Semperis → Check Point. (The featured work — Shift — also appears here as tile #1. Intentional repetition for emphasis.)
- Each tile: hero image, title (`company`), role + period meta line, and the 1–2 sentence `blurb` from `work.md`. Click → `/work/<slug>`.
- The existing "Shuffle" button is removed.
- Semperis has no images yet. Its tile renders with the existing `SkeletonImage` pulsing placeholder until images are added.

### Mega Footer
See the "Mega Footer" section below.

## Work item (`/work/<slug>`)

Single centred column. Top to bottom:

1. **Back link** (`← Back` → `/`).
2. **Hero image.** Determined by: (a) the `hero` field in `work.md` front-matter if present; otherwise (b) the first image in the folder by alphabetical filename.
3. **Title** (`title` from front-matter — defaults to `company` if `title` not set).
4. **Meta line.** `Role · Company · Period`, all from front-matter.
5. **Body.** Markdown body of `work.md`. May include inline images that reference sibling files by filename (`![alt](image.webp)`).
6. **Image gallery.** All images in the folder, excluding the hero and any images already referenced inline in the body. Stacked vertically, full-width within the column. Click → lightbox (existing component reused).
7. **Mega Footer.**

The same template handles both short (Onyxia, Semperis) and long-form (Shift, Veriti, Check Point) bodies. The only difference is body length.

## Mega Footer (global)

Present at the bottom of every page (Home and Work item). Layout: two columns on desktop (`md:` and up), stacked on mobile.

**Left column:**
- Profile photo (larger than nav avatar — target ~120 × 120).
- Name: `Amit Kaplinsky`.
- 1-line tagline: `Product designer. AI builder.`
- Contact links (vertical list): email, WhatsApp, LinkedIn. Same style as the current `/about` Contact section.

**Right column:**
- A condensed Experience list — 5 rows, one per work, each showing `Role · Company · Period`. Source: `work.md` front-matter for each work.
- "Download CV" link, styled as a button. Target: `/cv` (the hidden printable HTML page; user prints to PDF from there).

Behavioural note: the footer's `position: fixed`-reveal mechanic (App.tsx + `marginBottom: footerH`) needs verification against this taller content. If the reveal exposes the entire footer immediately on short pages, switch the footer to in-flow (`position: static` at end of page) and remove the reveal trick. Decide at implementation time based on what looks right.

## Content model

```
src/content/
  cv.md                   ← header (name/tagline/contacts), certs, education, skills only
                            (no Experience section — moved out)
  experience/
    shift/
      work.md             ← front-matter + body
      hero.webp           ← optional; if missing, first image alphabetically is hero
      00-login.jpg
      01-shift-home.png
      ...
    onyxia-cyber/
      work.md
      01-SSM-1.jpg
      ...
    veriti/
      work.md
      01.jpg ... 07.jpg
      cover-image.webp    ← moved from writing/sailing-the-data-oceans/
      dropdown-row.webp
      outlook-layout.webp
      picker-container.webp
      picker-2.webp
      search-results-picker.webp
    semperis/
      work.md             ← present even with no images yet
    checkpoint/
      work.md
      01-details.jpg ... 06-mainPage.jpg
      EndPoint_Ani_Ref.gif ... ZA_Ani_Ref.gif
      cover-image.webp    ← moved from writing/falling-down-the-rabbit-hole/
      InitialConcept.webp
      HomeTabConcepts.webp
      ItemPage.webp
      OnBoarding.webp
      OtherVendors.webp
      packShot.webp
```

### `work.md` shape

YAML front-matter + markdown body:

```markdown
---
company: Shift
role: Product Design Lead
period: 10/2024 – Now
title: Designing for the Supervisor          # optional, defaults to company
blurb: Reframing TPRM around the agent doing the work — and designing the workspace for the supervisor of that agent.
featured: true                                # at most one work has this
hero: 01-shift-home.png                       # optional; defaults to first image alphabetically
order: 1                                      # used for tile + footer ordering
---

In my current role at Shift, I've been working on the next generation of vendor risk software...
[full case study body — moved from writing/designing-for-the-supervisor/index.md]
```

Parser changes: extend `src/lib/content.ts` to use `remark-frontmatter` + a YAML parser (e.g. `yaml` package) to read each `work.md` front-matter into a typed object. Existing `parseCV()` shrinks to handle only header + certs + education + skills.

### What lives in `cv.md` after this change

```markdown
# Amit Kaplinsky

Product Designer. AI Builder.

Tel Aviv · [email] · [phone] · [LinkedIn] · [Portfolio]

## Certificates
...

## Education
...

## Skills
...
```

No `## Experience` section — that's now distributed across per-work `work.md` files.

### Tile/footer ordering

Use the `order` field in `work.md` front-matter as the canonical sort key (ascending). Locked initial order:

1. Shift
2. Onyxia
3. Veriti
4. Semperis
5. Check Point

(Matches the current order in cv.md.)

## Migration

### Delete
- `src/pages/About.tsx`
- `src/pages/Writing.tsx`
- `src/pages/WritingPost.tsx`
- `src/pages/Playground.tsx`
- `src/content/posts.ts`
- `src/content/writing/` (entire folder — files move into experience folders; see below)

### Move
- `src/content/writing/designing-for-the-supervisor/index.md` → merged into `src/content/experience/shift/work.md` (as body). Front-matter populated from the corresponding cv.md Shift section.
- `src/content/writing/designing-for-the-supervisor/cover-image.webp` → `src/content/experience/shift/cover-image.webp` (or rename if a clash).
- `src/content/writing/falling-down-the-rabbit-hole/index.md` → merged into `src/content/experience/checkpoint/work.md`.
- `src/content/writing/falling-down-the-rabbit-hole/*.{webp,jpg,png,gif}` → `src/content/experience/checkpoint/`.
- `src/content/writing/sailing-the-data-oceans/index.md` → merged into `src/content/experience/veriti/work.md`.
- `src/content/writing/sailing-the-data-oceans/*.{webp,jpg,png,gif}` → `src/content/experience/veriti/`.

### Create (new files)
- `src/content/experience/shift/work.md` (front-matter + merged case-study body; `featured: true`)
- `src/content/experience/onyxia-cyber/work.md` (front-matter + short body from cv.md summary)
- `src/content/experience/veriti/work.md` (front-matter + merged case-study body)
- `src/content/experience/semperis/work.md` (front-matter + short body from cv.md summary; no images yet — flagged)
- `src/content/experience/checkpoint/work.md` (front-matter + merged case-study body)

### Rename
- Route `/experience/:slug` → `/work/:slug`
- `src/pages/ExperienceItem.tsx` → `src/pages/WorkItem.tsx`
- `src/pages/Work.tsx` keeps its name (now serves the Home route).

### Rewrite
- `src/pages/Work.tsx` — new Home layout (Hero + Recent Work). Remove Shuffle. Read from `getAllWorks()`.
- `src/pages/WorkItem.tsx` — body + gallery layout per "Work item" section above. Replaces the current `md:sticky` two-column layout with a single centred column.
- `src/components/Nav.tsx` — strip down to avatar + name only. Drop centre pill, hamburger, Contact button. Mobile overlay also removed.
- `src/components/Footer.tsx` — replace existing decorative footer with the mega-footer content above.
- `src/App.tsx` — routes: `/`, `/work/:slug`, `/cv` (hidden, no nav surface), `*` → `/`.
- `src/lib/content.ts` — replace `parseCV` to handle the shrunken cv.md (no Experience section). Add `loadWorks()` reading all `work.md` files, parsing YAML front-matter via `remark-frontmatter` + `yaml`, exposing typed `Work[]`. Add `getFeaturedWork()`, `getAllWorks()`, `getWorkBySlug()`. Remove `getAllExperienceImages()` (no longer used). Remove writing-related exports.
- `src/lib/content.ts` — update `imageDimensionsByPath`: remove entries under `../content/writing/...`, add entries under the new `../content/experience/<slug>/...` paths for the moved images that need explicit dimensions.

### Keep (unchanged)
- `src/pages/CV.tsx` (hidden printable view, reachable only via footer "Download CV")
- `src/content/cv.md` (still source of truth for non-work parts)
- `src/components/SkeletonImage.tsx`, brand icons, `LottieIcon.tsx`
- Lenis smooth scroll, fade-up animations, slide-down nav, scroll-to-top on route change, lightbox open/close transitions
- `vite.config.ts`, build/dev scripts

### Dependencies
- Add `remark-frontmatter` and `yaml` (or equivalent YAML parser already compatible with unified pipeline).

## Design principles

1. **Minimal chrome.** The avatar/name in the top-left is the entire nav. The page itself is the UI.
2. **Content carries.** Long-form case studies are the headline content; layouts get out of the way (single centred column, generous spacing, no decoration beyond what's already in the site).
3. **One source per concept.** `cv.md` owns identity + credentials. Each work's folder owns that work end to end (text + images). No duplicated metadata.

## Decisions made along the way (call out at review)

- **Tile order = reverse-chronological**, mirroring current `cv.md` order. Driven by `order` field in `work.md`.
- **Featured work appears in both Hero and Recent Work tiles** (intentional repetition; first tile is the same work as the hero).
- **Tile blurb shape = challenge + outcome in 1–2 sentences**, lifted from the `blurb` field in `work.md`. Existing `cv.md` summaries (role narratives) are *not* reused for tiles — Amit will write fresh blurbs as part of populating each `work.md`.
- **`/cv` stays as a hidden printable HTML route**, not linked in nav. The footer "Download CV" goes there; user prints to PDF when desired.
- **Mega-footer reveal mechanic** (current fixed-position + reveal-on-scroll) is preserved tentatively; verify during implementation. Fallback: switch to in-flow footer.

## Out of scope

- No CMS, no runtime fetching, no API. File-driven, rebuild to publish (same as today).
- No new colours, fonts, type tokens, or motion patterns.
- No SEO/meta-tag work as part of this restructure (separate concern).
- No new content beyond what Amit will write for the blurbs and the Onyxia/Semperis short bodies.

## Open items (Amit's to resolve later)

- Writing the 5 `blurb` lines for each `work.md`.
- Choosing the hero image filename per work (or accepting the alphabetical-first default).
- Eventually adding Semperis images. Until then, its tile + page render with the SkeletonImage placeholder.
- A static `cv.pdf` deliverable can be generated from `/cv` once content stabilises — not required for this restructure to ship.
