# Personal Website Design Spec
**Date:** 2026-05-03

## Overview

A minimal personal website showcasing a CV and curated works. Two top-level pages, a detail page per work item. Content is file-driven — updating the content folder reflects on the site after a rebuild.

**Stack:** React + Vite + Tailwind CSS (latest) + shadcn/ui

---

## Pages

### `/cv` — CV Page
Renders a single Markdown file (`src/content/cv.md`) as styled HTML. Imported as raw text via Vite's `?raw` suffix, rendered with `react-markdown`. Custom component mappings apply editorial typography styles to `h1`, `h2`, `h3`, `p`, `ul`, etc.

The Markdown file is the single source of truth for all CV content — no separate JSON structure.

### `/work` — Work Index Page
A grid of work item cards. Each card shows:
- Project title (from `index.json`)
- Year (from `index.json`)
- Thumbnail (first image found in the folder, alphabetically)

Clicking a card navigates to `/work/:slug` where slug = folder name.

### `/work/:slug` — Work Detail Page
Displays a single work item. Layout:
- Title, year, and description at the top
- Images stacked vertically, full width, in filename order (use `01.jpg`, `02.jpg` for explicit ordering)

No carousel, no lightbox — clean editorial scroll.

---

## Content Structure

```
src/
  content/
    cv.md
    works/
      project-one/
        index.json
        01.jpg
        02.jpg
      project-two/
        index.json
        01.png
```

### `index.json` schema (per work item)
```json
{
  "title": "Project Name",
  "year": "2024",
  "description": "Short description of the work."
}
```

### `cv.md` format
Free-form Markdown. Suggested structure:
```md
# Full Name
**Title** · email@example.com

## Experience
### Role — Company (Year–Year)
...

## Education
...
```

---

## Content Loading

`src/lib/content.ts` uses Vite's `import.meta.glob` to:
- Eagerly load all `works/*/index.json` metadata at build time
- Lazily import images per folder when a detail page is visited
- Derive slugs from folder paths

No runtime fetching, no server required. Changes to content require a rebuild.

---

## Visual Design

- **Color**: Pure black (`#000`) on white (`#fff`). No grays, no color accents.
- **Typography**: `Inter` (sans-serif), loaded via Google Fonts or bundled. Generous line height, tight letter spacing for headings.
- **Spacing**: Generous padding and white space throughout.
- **Icons**: `lucide-react` (outlined, black) — already included with shadcn/ui.
- **shadcn/ui**: Used minimally for interactive primitives (navigation menu, any buttons). No colored or decorative components.

---

## Navigation

Fixed top navbar:
- Left: site name or monogram
- Right: "CV" and "Work" links

Active link is visually distinguished (e.g. underline or bold). No hamburger menu — two links fit inline at all breakpoints.

---

## Routing

React Router v6:
| Path | Component |
|------|-----------|
| `/` | Redirect to `/work` |
| `/cv` | `CV.tsx` |
| `/work` | `Work.tsx` |
| `/work/:slug` | `WorkItem.tsx` |

---

## File Structure

```
src/
  content/
    cv.md
    works/
      ...
  pages/
    CV.tsx
    Work.tsx
    WorkItem.tsx
  components/
    Navbar.tsx
  lib/
    content.ts
  App.tsx
  main.tsx
index.html
vite.config.ts
tailwind.config.ts
```

---

## Out of Scope

- CMS or admin UI
- PDF download
- Dark mode
- Contact form
- Animations beyond basic transitions
- Mobile-specific nav (hamburger)
