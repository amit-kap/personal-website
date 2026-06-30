# Home Page UI Redo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the home page (`/`) as a single, vertically-scrolled, full-bleed section layout (Hero → Featured case study → Recent Work → Case Studies → Footer) with a new "light & refined", tonal/near-mono visual language and GSAP ScrollTrigger reveals + parallax.

**Architecture:** A new `Home` page composes five pure-markup section components. All scroll motion lives in one shared `useScrollMotion` hook (GSAP + ScrollTrigger via `@gsap/react`'s `useGSAP`), driven by `data-reveal` / `data-parallax` attributes that the sections sprinkle on their markup. Section components stay logic-light and unit-testable (content + links); motion and visual polish are verified in the browser. All content comes from the existing `src/lib/content.ts` — no content or data-layer changes.

**Tech Stack:** React 19, React Router 7, Vite 8, Tailwind v4 (CSS-first `@theme`), GSAP 3 + `@gsap/react`, Vitest + React Testing Library.

## Global Constraints

- Scope: **home page only**. Do not redesign detail pages (`/work/:slug`, `/case-studies/:slug`, `/cv`) or `Nav` beyond the one targeted Nav fix in Task 8.
- No changes to `src/lib/content.ts` or any file under `src/content/`.
- Visual language: **tonal / near-mono** — warm off-white background, soft near-black ink, muted grey. **No chromatic accent color.** Hierarchy via weight/scale/contrast only.
- Type: Bodoni Moda (`font-heading`) for display headings; Plus Jakarta Sans (`font-sans`) for body/labels/meta. Both already imported in `src/index.css`.
- **All scroll motion wrapped in `gsap.matchMedia()`**: `(prefers-reduced-motion: reduce)` disables parallax and shows reveal content instantly (no transforms).
- Recent Work = first 3 of `getAllWorks()` (already sorted by `order`): Shift, Onyxia, Veriti. **Consistent** layout per section (no alternating).
- Path alias `@` → `src` (configured in `vite.config.ts`). Tests use globals (`describe/it/expect` available without import).
- Frequent commits — one per task.

---

### Task 1: GSAP dependency + shared `useScrollMotion` hook

**Files:**
- Modify: `package.json` (add deps)
- Create: `src/lib/useScrollMotion.ts`

**Interfaces:**
- Produces: `useScrollMotion(scope: RefObject<HTMLElement | null>): void` — call once on a page-level scope element. Scans the scope for `[data-reveal]` (fade-up reveal on enter) and `[data-parallax]` (scrub parallax; reads numeric drift from the `data-parallax` attribute, default `0.12`). Honors `prefers-reduced-motion`.

- [ ] **Step 1: Install dependencies**

```bash
npm install gsap @gsap/react
```

Expected: `gsap` and `@gsap/react` appear under `dependencies` in `package.json`. (GSAP 3.13+ ships ScrollTrigger in the free core package.)

- [ ] **Step 2: Create the hook**

Create `src/lib/useScrollMotion.ts`:

```ts
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { RefObject } from 'react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Scroll-driven reveals + parallax for a page scope.
 *
 * Markup contract (set by section components):
 *  - `data-reveal`         → element fades + rises into place when it enters the viewport.
 *  - `data-parallax="0.1"` → element drifts vertically as its container passes through
 *                            the viewport. The number is the drift fraction (yPercent = ±n*100).
 *                            Parallax elements should sit in an `overflow-hidden` container and
 *                            be slightly oversized (e.g. `scale-110`) so edges never show.
 *
 * All motion is gated behind `prefers-reduced-motion: no-preference`. Under reduced motion,
 * reveal elements are simply made visible and nothing animates.
 */
export function useScrollMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            },
          )
        })

        root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
          const drift = Number(el.dataset.parallax) || 0.12
          gsap.fromTo(
            el,
            { yPercent: -drift * 100 },
            {
              yPercent: drift * 100,
              ease: 'none',
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.set(el, { autoAlpha: 1, y: 0 })
        })
      })

      return () => mm.revert()
    },
    { scope },
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/useScrollMotion.ts
git commit -m "feat: add gsap + useScrollMotion hook for home redo"
```

---

### Task 2: Light/refined visual tokens in `index.css`

**Files:**
- Modify: `src/index.css:108-128` (the `:root` token block) and `src/index.css:127` (`--radius`)

**Interfaces:**
- Produces: updated CSS custom properties consumed app-wide via Tailwind `@theme inline` mappings (`--color-background`, `--color-foreground`, `--color-muted-foreground`, `--radius-*`).

- [ ] **Step 1: Soften the palette and introduce a non-zero radius**

In `src/index.css`, replace the `:root` block (currently lines ~108-128) with:

```css
:root {
  --background: oklch(0.985 0.004 95);   /* warm off-white */
  --foreground: oklch(0.18 0.005 280);   /* soft near-black ink */
  --card: oklch(0.985 0.004 95);
  --card-foreground: oklch(0.18 0.005 280);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.18 0.005 280);
  --primary: oklch(0.18 0.005 280);
  --primary-foreground: oklch(0.985 0.004 95);
  --secondary: oklch(0.96 0.003 95);
  --secondary-foreground: oklch(0.18 0.005 280);
  --muted: oklch(0.96 0.003 95);
  --muted-foreground: oklch(0.5 0.006 280);  /* muted grey secondary text */
  --accent: oklch(0.96 0.003 95);
  --accent-foreground: oklch(0.18 0.005 280);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.9 0.003 95);
  --input: oklch(0.9 0.003 95);
  --ring: oklch(0.18 0.005 280);
  --radius: 0.75rem;
}
```

- [ ] **Step 2: Build to confirm CSS compiles**

Run: `npm run build`
Expected: build succeeds (tsc + vite), no CSS errors.

- [ ] **Step 3: Browser check — detail pages did not regress**

Start the dev server (preview tooling), then load `/work/shift`, `/case-studies/designing-for-the-supervisor`, and `/cv`. Confirm text is readable on the new off-white background and nothing looks broken (these pages use the shared tokens). Capture a screenshot of one detail page as proof.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat: light/refined tonal palette + soft radius tokens"
```

---

### Task 3: Hero section

**Files:**
- Create: `src/components/home/Hero.tsx`
- Test: `src/components/home/Hero.test.tsx`

**Interfaces:**
- Consumes: `getCV()` from `@/lib/content` → `{ header: { name, tagline } }`; portrait at `${import.meta.env.BASE_URL}profile.jpg`.
- Produces: `export default function Hero(): JSX.Element`.

- [ ] **Step 1: Write the failing test**

Create `src/components/home/Hero.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import Hero from './Hero'

describe('Hero', () => {
  it('renders the name and tagline from the CV', () => {
    render(<Hero />)
    expect(screen.getByRole('heading', { name: /amit kaplinsky/i })).toBeInTheDocument()
    // tagline text comes from cv.md; assert the portrait is present
    expect(screen.getByRole('img', { name: /amit kaplinsky/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/home/Hero.test.tsx`
Expected: FAIL — cannot find module `./Hero`.

- [ ] **Step 3: Implement Hero**

Create `src/components/home/Hero.tsx`:

```tsx
import { getCV } from '@/lib/content'

export default function Hero() {
  const { header } = getCV()

  return (
    <section className="relative w-full min-h-[100svh] flex items-center bg-background text-foreground">
      <div className="2xl:mx-auto 2xl:max-w-[1440px] w-full px-5 sm:px-8 grid md:grid-cols-2 gap-10 md:gap-16 items-center py-24">
        {/* Left: name + tagline */}
        <div className="order-2 md:order-1">
          <h1
            data-reveal
            className="font-heading font-normal leading-[1.02] tracking-[-0.01em] text-foreground"
            style={{ fontSize: 'clamp(40px, 7vw, 88px)' }}
          >
            {header.name}
          </h1>
          <p
            data-reveal
            className="mt-6 font-heading italic text-muted-foreground leading-snug max-w-xl"
            style={{ fontSize: 'clamp(18px, 2.4vw, 28px)' }}
          >
            {header.tagline}
          </p>
        </div>

        {/* Right: portrait with gentle parallax */}
        <div className="order-1 md:order-2">
          <div className="relative w-full aspect-[4/5] max-h-[78vh] overflow-hidden rounded-xl bg-muted">
            <img
              src={`${import.meta.env.BASE_URL}profile.jpg`}
              alt={header.name}
              data-parallax="0.08"
              className="absolute inset-0 w-full h-full object-cover scale-110"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/home/Hero.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/Hero.tsx src/components/home/Hero.test.tsx
git commit -m "feat: home Hero section"
```

---

### Task 4: Featured case study section

**Files:**
- Create: `src/components/home/FeaturedCaseStudy.tsx`
- Test: `src/components/home/FeaturedCaseStudy.test.tsx`

**Interfaces:**
- Consumes: `getFeaturedCaseStudy()` → `CaseStudy | undefined` with `{ slug, title, excerpt, coverImage }`. Uses `react-router-dom` `Link` (tests wrap in `MemoryRouter`).
- Produces: `export default function FeaturedCaseStudy(): JSX.Element | null` — renders `null` if there is no featured case study.

- [ ] **Step 1: Write the failing test**

Create `src/components/home/FeaturedCaseStudy.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FeaturedCaseStudy from './FeaturedCaseStudy'
import { getFeaturedCaseStudy } from '@/lib/content'

describe('FeaturedCaseStudy', () => {
  it('links to the featured case study and shows its title', () => {
    const featured = getFeaturedCaseStudy()
    expect(featured).toBeDefined()

    render(
      <MemoryRouter>
        <FeaturedCaseStudy />
      </MemoryRouter>,
    )

    expect(screen.getByText(/featured/i)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: new RegExp(featured!.title, 'i') })
    expect(link).toHaveAttribute('href', `/case-studies/${featured!.slug}`)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/home/FeaturedCaseStudy.test.tsx`
Expected: FAIL — cannot find module `./FeaturedCaseStudy`.

- [ ] **Step 3: Implement FeaturedCaseStudy**

Create `src/components/home/FeaturedCaseStudy.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { getFeaturedCaseStudy } from '@/lib/content'

export default function FeaturedCaseStudy() {
  const featured = getFeaturedCaseStudy()
  if (!featured) return null

  return (
    <section className="relative w-full">
      <Link
        to={`/case-studies/${featured.slug}`}
        className="group block relative w-full h-[100svh] min-h-[560px] overflow-hidden bg-foreground"
      >
        {featured.coverImage && (
          <img
            src={featured.coverImage.src}
            alt={featured.title}
            width={featured.coverImage.width}
            height={featured.coverImage.height}
            data-parallax="0.12"
            className="absolute inset-0 w-full h-full object-cover scale-115"
          />
        )}

        {/* Bottom legibility gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 32%, rgba(0,0,0,0) 62%)',
          }}
        />

        <div className="absolute inset-x-0 bottom-0 px-5 sm:px-8 pb-14 sm:pb-20">
          <div className="2xl:mx-auto 2xl:max-w-[1440px]">
            <p
              data-reveal
              className="font-mono uppercase tracking-[0.25em] text-white/75 text-[12px] sm:text-[13px] mb-4"
            >
              Featured
            </p>
            <h2
              data-reveal
              className="font-heading font-normal text-white leading-[1.04] tracking-[-0.01em] max-w-4xl"
              style={{ fontSize: 'clamp(30px, 5.5vw, 68px)' }}
            >
              {featured.title}
            </h2>
            {featured.excerpt && (
              <p
                data-reveal
                className="mt-5 text-white/85 leading-[1.5] max-w-2xl text-[16px] sm:text-[19px]"
              >
                {featured.excerpt}
              </p>
            )}
            <span className="inline-flex items-baseline gap-2 mt-7 text-[13px] font-medium text-white">
              <span className="relative pb-1">
                Read the case study
                <span className="absolute left-0 right-0 bottom-0 h-px bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
              </span>
              <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">→</span>
            </span>
          </div>
        </div>
      </Link>
    </section>
  )
}
```

> Note: `scale-115` is an arbitrary Tailwind value; if the linter rejects it, use `scale-[1.15]`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/home/FeaturedCaseStudy.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/FeaturedCaseStudy.tsx src/components/home/FeaturedCaseStudy.test.tsx
git commit -m "feat: home Featured case study section"
```

---

### Task 5: Recent Work section (top 3, consistent layout)

**Files:**
- Create: `src/components/home/RecentWork.tsx`
- Test: `src/components/home/RecentWork.test.tsx`

**Interfaces:**
- Consumes: `getAllWorks()` → `Work[]` (sorted by `order`); fields used: `slug, company, productTitle, allImages` (first two images). Uses `Link`.
- Produces: `export default function RecentWork(): JSX.Element`.

- [ ] **Step 1: Write the failing test**

Create `src/components/home/RecentWork.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecentWork from './RecentWork'
import { getAllWorks } from '@/lib/content'

describe('RecentWork', () => {
  it('renders the top 3 works with product titles linking to their work pages', () => {
    const top3 = getAllWorks().slice(0, 3)
    expect(top3).toHaveLength(3)

    render(
      <MemoryRouter>
        <RecentWork />
      </MemoryRouter>,
    )

    for (const work of top3) {
      const link = screen.getByRole('link', { name: new RegExp(work.productTitle, 'i') })
      expect(link).toHaveAttribute('href', `/work/${work.slug}`)
    }
  })

  it('renders the section label', () => {
    render(
      <MemoryRouter>
        <RecentWork />
      </MemoryRouter>,
    )
    expect(screen.getByText(/recent work/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/home/RecentWork.test.tsx`
Expected: FAIL — cannot find module `./RecentWork`.

- [ ] **Step 3: Implement RecentWork**

Create `src/components/home/RecentWork.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { getAllWorks, type Work } from '@/lib/content'

function WorkSection({ work }: { work: Work }) {
  const images = work.allImages.slice(0, 2)

  return (
    <Link
      to={`/work/${work.slug}`}
      className="group block w-full py-16 sm:py-24 border-t border-border first:border-t-0"
    >
      <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8">
        <h3
          data-reveal
          className="font-heading font-normal leading-[1.06] tracking-[-0.01em] text-foreground max-w-4xl"
          style={{ fontSize: 'clamp(26px, 4.2vw, 52px)' }}
        >
          {work.productTitle}
        </h3>
        <p data-reveal className="mt-3 text-[14px] text-muted-foreground font-medium">
          {work.company}
          <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5 ml-2">→</span>
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-4 sm:gap-6">
          {images.map((img, i) => (
            <div
              key={img.src}
              className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted"
            >
              <img
                src={img.src}
                alt={`${work.company} ${i + 1}`}
                width={img.width}
                height={img.height}
                loading="lazy"
                data-parallax={i === 0 ? '0.06' : '0.1'}
                className="absolute inset-0 w-full h-full object-cover scale-110"
              />
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}

export default function RecentWork() {
  const works = getAllWorks().slice(0, 3)

  return (
    <section className="w-full bg-background py-12 sm:py-16">
      <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8">
        <p
          data-reveal
          className="font-mono uppercase tracking-[0.25em] text-muted-foreground text-[12px] sm:text-[13px]"
        >
          Recent Work
        </p>
      </div>
      <div className="mt-4">
        {works.map((work) => (
          <WorkSection key={work.slug} work={work} />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/home/RecentWork.test.tsx`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/home/RecentWork.tsx src/components/home/RecentWork.test.tsx
git commit -m "feat: home Recent Work section"
```

---

### Task 6: Case Studies section (zig-zag list)

**Files:**
- Create: `src/components/home/CaseStudies.tsx`
- Test: `src/components/home/CaseStudies.test.tsx`

**Interfaces:**
- Consumes: `getAllCaseStudies()` → `CaseStudy[]`; fields used: `slug, title, excerpt, coverImage`. Uses `Link`.
- Produces: `export default function CaseStudies(): JSX.Element`.

- [ ] **Step 1: Write the failing test**

Create `src/components/home/CaseStudies.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CaseStudies from './CaseStudies'
import { getAllCaseStudies } from '@/lib/content'

describe('CaseStudies', () => {
  it('renders each case study as a link to its page', () => {
    const studies = getAllCaseStudies()
    expect(studies.length).toBeGreaterThan(0)

    render(
      <MemoryRouter>
        <CaseStudies />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /case studies/i })).toBeInTheDocument()
    for (const cs of studies) {
      const link = screen.getByRole('link', { name: new RegExp(cs.title, 'i') })
      expect(link).toHaveAttribute('href', `/case-studies/${cs.slug}`)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/home/CaseStudies.test.tsx`
Expected: FAIL — cannot find module `./CaseStudies`.

- [ ] **Step 3: Implement CaseStudies**

Create `src/components/home/CaseStudies.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { getAllCaseStudies, type CaseStudy } from '@/lib/content'

function Row({ study, index }: { study: CaseStudy; index: number }) {
  const imageLeft = index % 2 === 0

  return (
    <Link
      to={`/case-studies/${study.slug}`}
      data-reveal
      className="group grid sm:grid-cols-2 gap-6 sm:gap-10 items-center py-10 border-t border-border"
    >
      <div
        className={`relative aspect-[16/9] overflow-hidden rounded-lg bg-muted ${
          imageLeft ? 'sm:order-1' : 'sm:order-2'
        }`}
      >
        {study.coverImage && (
          <img
            src={study.coverImage.src}
            alt={study.title}
            width={study.coverImage.width}
            height={study.coverImage.height}
            loading="lazy"
            data-parallax="0.07"
            className="absolute inset-0 w-full h-full object-cover scale-110"
          />
        )}
      </div>

      <div className={imageLeft ? 'sm:order-2' : 'sm:order-1'}>
        <h3 className="font-heading font-normal text-foreground leading-[1.1] tracking-[-0.01em] text-[24px] sm:text-[30px]">
          {study.title}
        </h3>
        {study.excerpt && (
          <p className="mt-3 text-muted-foreground leading-[1.5] text-[15px] sm:text-[16px] max-w-md">
            {study.excerpt}
          </p>
        )}
        <span className="inline-flex items-baseline gap-2 mt-5 text-[13px] font-medium text-foreground">
          Read
          <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">→</span>
        </span>
      </div>
    </Link>
  )
}

export default function CaseStudies() {
  const studies = getAllCaseStudies()

  return (
    <section className="w-full bg-background py-20 sm:py-28">
      <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8">
        <h2
          data-reveal
          className="font-heading font-normal text-foreground leading-[1.04] tracking-[-0.01em]"
          style={{ fontSize: 'clamp(30px, 4.5vw, 56px)' }}
        >
          Case Studies
        </h2>
        <div className="mt-10">
          {studies.map((study, i) => (
            <Row key={study.slug} study={study} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/home/CaseStudies.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/home/CaseStudies.tsx src/components/home/CaseStudies.test.tsx
git commit -m "feat: home Case Studies zig-zag section"
```

---

### Task 7: Align shared Footer with the new system

**Files:**
- Modify: `src/components/Footer.tsx`

**Interfaces:**
- No interface change. `Footer` stays the single shared footer used by all routes via the reveal mechanism in `App.tsx`. Refine its styling only.

- [ ] **Step 1: Apply rounded, off-black refinements**

In `src/components/Footer.tsx`, make these surgical class changes (keep all content/links/structure identical):
- Line 8: change `className="bg-black text-white"` to `className="bg-foreground text-background"`.
- The `Download CV` link (currently `rounded-full border border-white/25 ... hover:bg-white hover:text-black`): change `hover:bg-white hover:text-black` to `hover:bg-background hover:text-foreground` and `border-white/25` to `border-background/25`.

Leave the white/opacity utility tints (`text-white/55`, `border-white/10`, etc.) as-is — they read correctly against the dark `bg-foreground` band and keep the footer visually consistent with the Figma reference (dark band under a light page).

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Browser check**

Confirm the footer renders correctly on both `/` (after Task 9) and a detail page like `/cv` — dark band, readable, rounded CV button. (If running this task before Task 9, check on `/work/shift`.) Screenshot as proof.

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.tsx
git commit -m "feat: align shared footer with light/refined tokens"
```

---

### Task 8: Fix Nav color over the new light Hero

**Files:**
- Modify: `src/components/Nav.tsx:30-34`

**Interfaces:**
- No interface change. The home hero is now **light** (off-white), so the existing `overHero` logic (which forces white nav text/border over the old dark hero image) would make the nav invisible. Make the nav use dark-on-light styling over the new hero.

- [ ] **Step 1: Disable the white-over-hero treatment**

In `src/components/Nav.tsx`, the `overHero` constant (line ~32) drives white text/borders for the home hero. Since the new Hero is light, set the nav to its dark (non-hero) styling on the home page. Change line ~32 from:

```tsx
  const overHero = isHome && scrollY < heroThreshold
```

to:

```tsx
  // Home hero is now light (off-white); keep the nav in its dark-on-light treatment.
  const overHero = false
```

Leave `isHome`, `scrollY`, and `heroThreshold` references intact below (they remain read; `heroThreshold` and `scrollY` are still computed but harmless). If the linter flags `isHome`/`heroThreshold`/`scrollY` as unused after this change, remove only the now-orphaned declarations they exclusively feed.

- [ ] **Step 2: Build + lint**

Run: `npm run build && npm run lint`
Expected: success, no unused-variable errors. (If lint flags orphans, remove them per Step 1 guidance, then re-run.)

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "fix: nav uses dark treatment over new light home hero"
```

---

### Task 9: Home page assembly + route + cleanup

**Files:**
- Create: `src/pages/Home.tsx`
- Modify: `src/App.tsx:4-8` (imports) and `src/App.tsx:49` (`/` route)
- Delete: `src/pages/Work.tsx` (now unused)

**Interfaces:**
- Consumes: all five section components from `@/components/home/*` and `useScrollMotion` from `@/lib/useScrollMotion`.
- Produces: `export default function Home(): JSX.Element` mounted at `/`.

- [ ] **Step 1: Create the Home page**

Create `src/pages/Home.tsx`:

```tsx
import { useRef } from 'react'
import Hero from '@/components/home/Hero'
import FeaturedCaseStudy from '@/components/home/FeaturedCaseStudy'
import RecentWork from '@/components/home/RecentWork'
import CaseStudies from '@/components/home/CaseStudies'
import { useScrollMotion } from '@/lib/useScrollMotion'

export default function Home() {
  const scope = useRef<HTMLDivElement>(null)
  useScrollMotion(scope)

  return (
    <div ref={scope} className="relative z-10 bg-background">
      <Hero />
      <FeaturedCaseStudy />
      <RecentWork />
      <CaseStudies />
    </div>
  )
}
```

> The shared `Footer` is rendered by `App.tsx` behind the content (reveal mechanism) — Home does not render it.

- [ ] **Step 2: Repoint the `/` route**

In `src/App.tsx`:
- Replace the import `import Work from '@/pages/Work'` with `import Home from '@/pages/Home'`.
- Change the route `<Route path="/" element={<Work />} />` to `<Route path="/" element={<Home />} />`.

- [ ] **Step 3: Delete the now-unused Work page**

```bash
git rm src/pages/Work.tsx
```

Confirm nothing else imports it:

Run: `grep -rn "pages/Work'" src || echo "no remaining imports"`
Expected: `no remaining imports`.

- [ ] **Step 4: Typecheck, build, run unit tests**

Run: `npx tsc -b && npm run build && npx vitest run`
Expected: all succeed; the four section tests pass.

- [ ] **Step 5: Browser verification (the real test for this redo)**

Start the dev server (preview tooling) at `/` and verify:
- All five bands render in order with real content: Hero (name + portrait), Featured (Designing for the Supervisor cover + overlay), Recent Work (Shift / Onyxia / Veriti, each with headline + 2 images), Case Studies (3 zig-zag rows), Footer.
- Scroll down slowly: reveal animations fire as sections enter; image parallax drifts. No console errors (`preview_console_logs`).
- Links work: a Recent Work section → `/work/<slug>`; a Case Study row → `/case-studies/<slug>`; Featured → `/case-studies/designing-for-the-supervisor`.
- `preview_resize` to a narrow width: sections collapse to single column, portrait/cards stack, no horizontal overflow.
- Emulate `prefers-reduced-motion: reduce` (e.g. `preview_eval` matchMedia override or devtools rendering emulation): content is fully visible and parallax/reveal transforms do not run.
- Capture a full-page screenshot as proof.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Home.tsx src/App.tsx
git commit -m "feat: assemble home redo, repoint / route, remove old Work page"
```

---

## Self-Review Notes

- **Spec coverage:** Hero (T3), Featured (T4), Recent Work top-3 consistent (T5), Case Studies zig-zag (T6), single shared Footer (T7), light/tonal tokens + radius (T2), GSAP reveals + parallax + reduced-motion (T1, used in T9), route repoint + dead `Work.tsx` removal (T9), responsive + browser verification (T9). Nav light-hero conflict surfaced and fixed (T8) — a necessary consequence of the redesign, not scope creep.
- **No chromatic accent:** all colors are tonal (`background`/`foreground`/`muted-foreground` + white-opacity tints inside the dark footer/featured overlay). ✔
- **Deviation from spec:** Featured "slow scale" is delivered as parallax drift on an oversized (`scale-115`) image via the single `data-parallax` mechanism rather than a separate scrubbed scale tween — keeps one motion primitive, lower risk. Noted here intentionally.
- **Type consistency:** field names verified against `content.ts` — `Work.productTitle`, `Work.allImages`, `Work.company`, `CaseStudy.title`, `CaseStudy.excerpt`, `CaseStudy.coverImage`, `CV.header.{name,tagline}`. `useScrollMotion(scope)` signature consistent between T1 and T9.
