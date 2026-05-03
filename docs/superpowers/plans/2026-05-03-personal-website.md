# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal black-on-white personal website with a CV page (Markdown-driven) and a Work section (folder-driven image galleries) using React + Vite + Tailwind v4 + shadcn/ui.

**Architecture:** Content lives in `src/content/` — a single `cv.md` for the CV and per-project folders under `works/` for the Work section. Vite's `import.meta.glob` eagerly loads all work metadata and images at build time; no server or runtime fetching. React Router v6 handles three routes: `/cv`, `/work`, and `/work/:slug`.

**Tech Stack:** React 18, Vite 5, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), shadcn/ui (latest), React Router v6, react-markdown, @fontsource/inter, Vitest, @testing-library/react

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/lib/utils.ts` | Pure helpers — `slugFromPath` |
| `src/lib/content.ts` | `import.meta.glob` wiring — `getAllWorks`, `getWorkDetail` |
| `src/components/Navbar.tsx` | Fixed top nav with active-link highlighting |
| `src/pages/CV.tsx` | Renders `cv.md` via react-markdown with styled components |
| `src/pages/Work.tsx` | Grid of work cards |
| `src/pages/WorkItem.tsx` | Full-width stacked image gallery for one work item |
| `src/App.tsx` | Router setup + redirect `/` → `/work` |
| `src/index.css` | Tailwind + Inter font imports + CSS variables |
| `src/test/setup.ts` | Vitest/jest-dom setup |
| `src/lib/utils.test.ts` | Unit tests for `slugFromPath` |
| `src/components/Navbar.test.tsx` | Render test for Navbar |
| `src/pages/CV.test.tsx` | Render test for CV page |
| `src/pages/Work.test.tsx` | Render test for Work page |
| `src/pages/WorkItem.test.tsx` | Render test for WorkItem page |

---

## Task 1: Scaffold the project

**Files:**
- Create: project root (via `npm create vite`)

- [ ] **Step 1: Create Vite project**

```bash
npm create vite@latest . -- --template react-ts
```

When prompted "Current directory is not empty. Remove existing files and continue?" — choose `y` (only `.git` and `docs/` exist, Vite will not overwrite them). Accept all defaults.

- [ ] **Step 2: Install base dependencies**

```bash
npm install react-router-dom react-markdown remark-gfm @fontsource/inter
npm install -D @types/node
```

- [ ] **Step 3: Remove Vite boilerplate**

Delete the files that the template created but we won't use:
```bash
rm -rf src/assets src/App.css
```

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
```

Expected: server starts at `http://localhost:5173`. Stop with `Ctrl+C`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vite React TypeScript project"
```

---

## Task 2: Install and configure Tailwind v4

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/index.css`

- [ ] **Step 1: Install Tailwind v4**

```bash
npm install -D tailwindcss @tailwindcss/vite
```

- [ ] **Step 2: Update `vite.config.ts`**

Replace the full contents of `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 3: Update `src/index.css`**

Replace the full contents of `src/index.css`:

```css
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import "tailwindcss";

@theme {
  --font-family-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}
```

- [ ] **Step 4: Update `tsconfig.json` to add path alias**

Add `baseUrl` and `paths` inside `compilerOptions` in `tsconfig.json`. The existing `compilerOptions` block should gain two new lines:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

(Merge with existing — do not replace the whole file.)

- [ ] **Step 5: Verify Tailwind is working**

Update `src/App.tsx` temporarily:

```tsx
export default function App() {
  return <div className="p-8 font-sans text-2xl">Tailwind works</div>
}
```

Run `npm run dev` and confirm the text is styled. Stop server.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts src/index.css tsconfig.json src/App.tsx
git commit -m "chore: add Tailwind v4 and Inter font"
```

---

## Task 3: Init shadcn/ui

**Files:**
- Create: `components.json`
- Modify: `src/index.css` (CSS variables added by init)

- [ ] **Step 1: Run shadcn init**

```bash
npx shadcn@latest init
```

When prompted:
- **Which style would you like to use?** → `Default`
- **Which color would you like to use as base color?** → `Zinc`
- **Would you like to use CSS variables for colors?** → `yes`

This will create `components.json` and append CSS variable definitions to `src/index.css`.

- [ ] **Step 2: Override CSS variables for pure black/white**

Open `src/index.css`. Find the `:root` and `.dark` blocks that shadcn added. Replace just the key color variables in `:root` to use pure black/white. The block should look like this (keep any other variables shadcn added unchanged):

```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 0%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 0%;
  --primary: 0 0% 0%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 96%;
  --secondary-foreground: 0 0% 0%;
  --muted: 0 0% 96%;
  --muted-foreground: 0 0% 40%;
  --accent: 0 0% 96%;
  --accent-foreground: 0 0% 0%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 0 0% 0%;
  --input: 0 0% 0%;
  --ring: 0 0% 0%;
  --radius: 0rem;
}
```

- [ ] **Step 3: Verify shadcn component install works**

```bash
npx shadcn@latest add button
```

Expected: creates `src/components/ui/button.tsx`. This confirms shadcn is wired up correctly.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: init shadcn/ui with black/white theme"
```

---

## Task 4: Configure Vitest

**Files:**
- Modify: `vite.config.ts`
- Create: `src/test/setup.ts`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Update `vite.config.ts` to add test config**

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 3: Create `src/test/setup.ts`**

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Add test script to `package.json`**

In `package.json`, add to the `scripts` block:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a smoke test to verify setup**

Create `src/test/smoke.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';

describe('test setup', () => {
  it('works', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run tests**

```bash
npm test
```

Expected output: `1 passed`.

- [ ] **Step 7: Delete smoke test and commit**

```bash
rm src/test/smoke.test.ts
git add -A
git commit -m "chore: configure Vitest with jsdom and jest-dom"
```

---

## Task 5: Content utilities (`src/lib/utils.ts`)

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/lib/utils.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/lib/utils.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { slugFromPath } from './utils';

describe('slugFromPath', () => {
  it('extracts slug from a works glob path', () => {
    expect(slugFromPath('../content/works/project-one/index.json')).toBe('project-one');
  });

  it('handles folder names with dashes', () => {
    expect(slugFromPath('../content/works/my-cool-project/01.jpg')).toBe('my-cool-project');
  });

  it('returns empty string for unrecognised paths', () => {
    expect(slugFromPath('some/other/path.json')).toBe('');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: 3 failures — `Cannot find module './utils'`.

- [ ] **Step 3: Implement `src/lib/utils.ts`**

```typescript
export function slugFromPath(path: string): string {
  const match = path.match(/works\/([^/]+)\//);
  return match ? match[1] : '';
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: `3 passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.ts src/lib/utils.test.ts
git commit -m "feat: add slugFromPath utility with tests"
```

---

## Task 6: Content module (`src/lib/content.ts`)

**Files:**
- Create: `src/lib/content.ts`

No unit tests here — `import.meta.glob` is a Vite build transform that doesn't run in Vitest. Integration is verified visually when the pages render.

- [ ] **Step 1: Create `src/lib/content.ts`**

```typescript
import { slugFromPath } from './utils';

export interface WorkMeta {
  slug: string;
  title: string;
  year: string;
  description: string;
  thumbnail: string;
}

export interface WorkDetail extends WorkMeta {
  images: string[];
}

const metaModules = import.meta.glob<{ default: { title: string; year: string; description: string } }>(
  '../content/works/*/index.json',
  { eager: true }
);

const imageModules = import.meta.glob<{ default: string }>(
  '../content/works/*/*.{jpg,jpeg,png,webp,gif}',
  { eager: true }
);

function getImagesForSlug(slug: string): string[] {
  return Object.entries(imageModules)
    .filter(([path]) => path.includes(`/works/${slug}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, mod]) => mod.default);
}

export function getAllWorks(): WorkMeta[] {
  return Object.entries(metaModules).map(([path, mod]) => {
    const slug = slugFromPath(path);
    const images = getImagesForSlug(slug);
    return { slug, ...mod.default, thumbnail: images[0] ?? '' };
  });
}

export function getWorkDetail(slug: string): WorkDetail | undefined {
  const entry = Object.entries(metaModules).find(([path]) => slugFromPath(path) === slug);
  if (!entry) return undefined;
  const [, mod] = entry;
  const images = getImagesForSlug(slug);
  return { slug, ...mod.default, thumbnail: images[0] ?? '', images };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/content.ts
git commit -m "feat: add content module using import.meta.glob"
```

---

## Task 7: Sample content

**Files:**
- Create: `src/content/cv.md`
- Create: `src/content/works/brand-identity/index.json`
- Create: `src/content/works/brand-identity/01.jpg` (placeholder image)
- Create: `src/content/works/editorial-layout/index.json`
- Create: `src/content/works/editorial-layout/01.jpg` (placeholder image)

- [ ] **Step 1: Create `src/content/cv.md`**

```markdown
# Your Name
**Designer & Developer** · your@email.com · linkedin.com/in/yourhandle

## Experience

### Senior Designer — Studio Name (2022–Present)
Brand identity, editorial design, and digital product work for clients across Europe.

### Designer — Agency Name (2019–2022)
Visual identity and campaign design for consumer brands.

## Education

### BFA Graphic Design — School of Art (2015–2019)

## Skills
Typography · Brand Identity · Art Direction · React · Figma
```

- [ ] **Step 2: Create work metadata files**

Create `src/content/works/brand-identity/index.json`:

```json
{
  "title": "Brand Identity",
  "year": "2024",
  "description": "Visual identity system for a European fashion label."
}
```

Create `src/content/works/editorial-layout/index.json`:

```json
{
  "title": "Editorial Layout",
  "year": "2023",
  "description": "Art direction and layout for a quarterly print publication."
}
```

- [ ] **Step 3: Add placeholder images**

Copy any two JPEG/PNG images into each work folder as `01.jpg`. You can use any image — they are just placeholders:

```bash
mkdir -p src/content/works/brand-identity
mkdir -p src/content/works/editorial-layout
# Copy placeholder images manually into each folder as 01.jpg
```

At least one image per folder is required for the thumbnail to render.

- [ ] **Step 4: Commit**

```bash
git add src/content/
git commit -m "content: add sample CV and work items"
```

---

## Task 8: Navbar component

**Files:**
- Create: `src/components/Navbar.tsx`
- Create: `src/components/Navbar.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/components/Navbar.test.tsx`:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';

function renderNavbar(path = '/work') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Navbar siteName="AK" />
    </MemoryRouter>
  );
}

describe('Navbar', () => {
  it('renders the site name', () => {
    renderNavbar();
    expect(screen.getByText('AK')).toBeInTheDocument();
  });

  it('renders CV and Work links', () => {
    renderNavbar();
    expect(screen.getByRole('link', { name: 'CV' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Work' })).toBeInTheDocument();
  });

  it('marks the active link', () => {
    renderNavbar('/cv');
    const cvLink = screen.getByRole('link', { name: 'CV' });
    expect(cvLink).toHaveAttribute('aria-current', 'page');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: failures — `Cannot find module './Navbar'`.

- [ ] **Step 3: Implement `src/components/Navbar.tsx`**

React Router v6's `NavLink` automatically adds `aria-current="page"` to the active link — no extra wiring needed.

```tsx
import { NavLink } from 'react-router-dom';

interface NavbarProps {
  siteName: string;
}

export default function Navbar({ siteName }: NavbarProps) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm tracking-wide transition-opacity ${isActive ? 'font-semibold' : 'opacity-50 hover:opacity-100'}`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-white border-b border-black">
      <NavLink to="/work" className="text-sm font-semibold tracking-widest uppercase">
        {siteName}
      </NavLink>
      <div className="flex gap-8">
        <NavLink to="/cv" className={linkClass}>CV</NavLink>
        <NavLink to="/work" className={linkClass}>Work</NavLink>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: `3 passed` (plus the earlier `utils` tests = 6 total).

- [ ] **Step 5: Commit**

```bash
git add src/components/Navbar.tsx src/components/Navbar.test.tsx
git commit -m "feat: add Navbar component with active link support"
```

---

## Task 9: App.tsx and routing

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: Update `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 2: Update `src/App.tsx`**

```tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from '@/components/Navbar'
import CV from '@/pages/CV'
import Work from '@/pages/Work'
import WorkItem from '@/pages/WorkItem'

export default function App() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <Navbar siteName="AK" />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Navigate to="/work" replace />} />
          <Route path="/cv" element={<CV />} />
          <Route path="/work" element={<Work />} />
          <Route path="/work/:slug" element={<WorkItem />} />
        </Routes>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Create stub pages (to prevent import errors)**

Create `src/pages/CV.tsx`:
```tsx
export default function CV() {
  return <div>CV</div>
}
```

Create `src/pages/Work.tsx`:
```tsx
export default function Work() {
  return <div>Work</div>
}
```

Create `src/pages/WorkItem.tsx`:
```tsx
export default function WorkItem() {
  return <div>Work Item</div>
}
```

- [ ] **Step 4: Verify dev server runs without errors**

```bash
npm run dev
```

Navigate to `http://localhost:5173` — should redirect to `/work` and show "Work". Navigate to `/cv` — should show "CV". Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/main.tsx src/pages/
git commit -m "feat: setup React Router with CV, Work, and WorkItem routes"
```

---

## Task 10: CV page

**Files:**
- Modify: `src/pages/CV.tsx`
- Create: `src/pages/CV.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/pages/CV.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CV from './CV';

vi.mock('../content/cv.md?raw', () => ({ default: '# Test Name\n\n## Experience\n\nSome experience.' }));

describe('CV', () => {
  it('renders the CV heading', () => {
    render(<CV />);
    expect(screen.getByRole('heading', { name: 'Test Name', level: 1 })).toBeInTheDocument();
  });

  it('renders a section heading', () => {
    render(<CV />);
    expect(screen.getByRole('heading', { name: 'Experience', level: 2 })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: 2 failures — the stub CV doesn't render markdown.

- [ ] **Step 3: Implement `src/pages/CV.tsx`**

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import cvContent from '../content/cv.md?raw'

const components = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-5xl font-light tracking-tight mb-3">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-xs font-semibold uppercase tracking-widest mt-14 mb-4 pb-2 border-b border-black">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-sm font-semibold mb-1">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-sm leading-relaxed mb-3 text-black/70">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-3">{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-sm leading-relaxed text-black/70">{children}</li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-medium text-black">{children}</strong>
  ),
}

export default function CV() {
  return (
    <article className="max-w-2xl mx-auto px-8 py-16">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {cvContent}
      </ReactMarkdown>
    </article>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Verify visually**

```bash
npm run dev
```

Navigate to `http://localhost:5173/cv`. Confirm the CV content renders with correct typography. Stop server.

- [ ] **Step 6: Commit**

```bash
git add src/pages/CV.tsx src/pages/CV.test.tsx
git commit -m "feat: add CV page with react-markdown and editorial typography"
```

---

## Task 11: Work index page

**Files:**
- Modify: `src/pages/Work.tsx`
- Create: `src/pages/Work.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/pages/Work.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Work from './Work';

vi.mock('@/lib/content', () => ({
  getAllWorks: vi.fn(() => [
    { slug: 'project-a', title: 'Project A', year: '2024', description: 'Desc A', thumbnail: '' },
    { slug: 'project-b', title: 'Project B', year: '2023', description: 'Desc B', thumbnail: '' },
  ]),
}));

describe('Work', () => {
  it('renders all work item titles', () => {
    render(<MemoryRouter><Work /></MemoryRouter>);
    expect(screen.getByText('Project A')).toBeInTheDocument();
    expect(screen.getByText('Project B')).toBeInTheDocument();
  });

  it('renders years', () => {
    render(<MemoryRouter><Work /></MemoryRouter>);
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('links each card to its work item', () => {
    render(<MemoryRouter><Work /></MemoryRouter>);
    const links = screen.getAllByRole('link');
    expect(links.some(l => l.getAttribute('href') === '/work/project-a')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: failures — Work is still a stub.

- [ ] **Step 3: Implement `src/pages/Work.tsx`**

```tsx
import { Link } from 'react-router-dom'
import { getAllWorks } from '@/lib/content'

export default function Work() {
  const works = getAllWorks()

  return (
    <section className="px-8 py-16 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-black">
        {works.map((work) => (
          <Link
            key={work.slug}
            to={`/work/${work.slug}`}
            className="group bg-white block p-6 hover:bg-black hover:text-white transition-colors"
          >
            {work.thumbnail && (
              <div className="aspect-[4/3] overflow-hidden mb-4 bg-black/5">
                <img
                  src={work.thumbnail}
                  alt={work.title}
                  className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                />
              </div>
            )}
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">{work.title}</span>
              <span className="text-xs opacity-50">{work.year}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Verify visually**

```bash
npm run dev
```

Navigate to `http://localhost:5173/work`. Confirm work cards render with thumbnails, titles, and years. Stop server.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Work.tsx src/pages/Work.test.tsx
git commit -m "feat: add Work index page with card grid"
```

---

## Task 12: Work detail page

**Files:**
- Modify: `src/pages/WorkItem.tsx`
- Create: `src/pages/WorkItem.test.tsx`

- [ ] **Step 1: Write failing test**

Create `src/pages/WorkItem.test.tsx`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import WorkItem from './WorkItem';

vi.mock('@/lib/content', () => ({
  getWorkDetail: vi.fn((slug: string) => {
    if (slug === 'project-a') {
      return {
        slug: 'project-a',
        title: 'Project A',
        year: '2024',
        description: 'A great project.',
        thumbnail: '/img/01.jpg',
        images: ['/img/01.jpg', '/img/02.jpg'],
      };
    }
    return undefined;
  }),
}));

function renderWorkItem(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/work/${slug}`]}>
      <Routes>
        <Route path="/work/:slug" element={<WorkItem />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('WorkItem', () => {
  it('renders the project title', () => {
    renderWorkItem('project-a');
    expect(screen.getByRole('heading', { name: 'Project A' })).toBeInTheDocument();
  });

  it('renders year and description', () => {
    renderWorkItem('project-a');
    expect(screen.getByText('2024')).toBeInTheDocument();
    expect(screen.getByText('A great project.')).toBeInTheDocument();
  });

  it('renders all images', () => {
    renderWorkItem('project-a');
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
  });

  it('shows not found for unknown slug', () => {
    renderWorkItem('unknown');
    expect(screen.getByText(/not found/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm test
```

Expected: failures — WorkItem is still a stub.

- [ ] **Step 3: Implement `src/pages/WorkItem.tsx`**

```tsx
import { useParams, Link } from 'react-router-dom'
import { getWorkDetail } from '@/lib/content'

export default function WorkItem() {
  const { slug } = useParams<{ slug: string }>()
  const work = getWorkDetail(slug ?? '')

  if (!work) {
    return (
      <div className="px-8 py-16 max-w-2xl mx-auto">
        <p className="text-sm opacity-50">Work item not found.</p>
        <Link to="/work" className="text-sm underline mt-4 inline-block">← Back to Work</Link>
      </div>
    )
  }

  return (
    <article className="px-8 py-16 max-w-4xl mx-auto">
      <Link to="/work" className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
        ← Work
      </Link>

      <header className="mt-8 mb-12">
        <h1 className="text-4xl font-light tracking-tight mb-2">{work.title}</h1>
        <div className="flex gap-6 text-sm opacity-50">
          <span>{work.year}</span>
        </div>
        {work.description && (
          <p className="mt-4 text-sm leading-relaxed max-w-xl">{work.description}</p>
        )}
      </header>

      <div className="flex flex-col gap-2">
        {work.images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${work.title} — image ${i + 1}`}
            className="w-full block"
          />
        ))}
      </div>
    </article>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 5: Verify visually**

```bash
npm run dev
```

Navigate to `http://localhost:5173/work`. Click a work card. Confirm the detail page shows title, year, description, and stacked images. Stop server.

- [ ] **Step 6: Final build check**

```bash
npm run build
```

Expected: build completes with no errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/WorkItem.tsx src/pages/WorkItem.test.tsx
git commit -m "feat: add WorkItem detail page with full-width image stack"
```

---

## Done

All 12 tasks complete. The site is fully functional:
- `/` redirects to `/work`
- `/cv` renders `src/content/cv.md` with editorial typography
- `/work` shows a card grid built from `src/content/works/` folders
- `/work/:slug` shows stacked images and metadata for one work item

To add a new work item: create `src/content/works/<folder-name>/index.json` with title/year/description and add images (`01.jpg`, `02.jpg`, …). Rebuild to publish.
