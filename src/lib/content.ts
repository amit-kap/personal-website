import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString as mdastToString } from 'mdast-util-to-string';
import { toMarkdown } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm';
import type { Root, RootContent, Heading, Link, Paragraph, List } from 'mdast';
import { parse as parseYaml } from 'yaml';
import cvRaw from '../content/cv.md?raw';

// ---- Front-matter helper ----

function stripFrontMatter(raw: string): {
  frontMatter: Record<string, unknown> | null;
  body: string;
} {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontMatter: null, body: raw };
  const [, fmText, body] = match;
  try {
    return {
      frontMatter: parseYaml(fmText) as Record<string, unknown>,
      body,
    };
  } catch {
    return { frontMatter: null, body: raw };
  }
}

// ---- CV (single source of truth, parsed from cv.md) ----

export interface CVExperience {
  slug: string;
  company: string;
  role: string;
  period: string;
  summary: string;   // first paragraph of body, plain text — used by About
  body: string;      // full body as markdown — used by /experience/<slug>
  hasImages: boolean;
  images: ContentImage[];
}

export interface ContentImage {
  src: string;
  width: number;
  height: number;
}

export interface CVNamedEntry {
  title: string;
  meta: string;
}

export interface CVSkillGroup {
  category: string;
  items: string[];
}

export interface CVHeader {
  name: string;
  tagline: string;
  contacts: string; // raw paragraph text (markdown), rendered by the page
}

export interface CV {
  raw: string;
  header: CVHeader;
  experience: CVExperience[];
  certificates: CVNamedEntry[];
  education: CVNamedEntry[];
  skills: CVSkillGroup[];
}

const expImageModules = import.meta.glob<{ default: string }>(
  '../content/experience/*/*.{jpg,jpeg,png,webp,gif}',
  { eager: true }
);

const defaultImageDimensions = { width: 1920, height: 1080 };

const imageDimensionsByPath: Record<string, { width: number; height: number }> = {
  '../content/experience/onyxia-cyber/03-frameworks.jpg': { width: 1920, height: 930 },
  '../content/experience/onyxia-cyber/04-insights.jpg': { width: 1920, height: 930 },
  '../content/experience/onyxia-cyber/05-p-hub.jpg': { width: 1920, height: 930 },
  '../content/experience/checkpoint/EndPoint_Ani_Ref.gif': { width: 1600, height: 1000 },
  '../content/experience/checkpoint/MonitorWire.gif': { width: 2000, height: 1144 },
  '../content/experience/checkpoint/MTP_Ani_Ref.gif': { width: 1366, height: 768 },
  '../content/experience/checkpoint/ZA_Ani_Ref.gif': { width: 1366, height: 768 },
  '../content/experience/shift/00-login.jpg': { width: 3840, height: 1920 },
  '../content/experience/shift/01-shift-home.png': { width: 5120, height: 2582 },
  '../content/experience/shift/02-inventory-vendors.png': { width: 5150, height: 2580 },
  '../content/experience/shift/03-inventory-vendors-card.png': { width: 5122, height: 2578 },
  '../content/experience/shift/04-access-graph.png': { width: 5120, height: 2580 },
  '../content/experience/shift/05-findings-threat-center.png': { width: 5124, height: 2582 },
  '../content/experience/shift/06-integrations-grid.jpg': { width: 3840, height: 1920 },
  '../content/writing/designing-for-the-supervisor/channel-per-assessment.jpg': { width: 1920, height: 960 },
  '../content/writing/designing-for-the-supervisor/concept-001.jpg': { width: 1920, height: 960 },
  '../content/writing/designing-for-the-supervisor/concept-002.jpg': { width: 1944, height: 966 },
  '../content/writing/designing-for-the-supervisor/cover-image.webp': { width: 1672, height: 941 },
  '../content/writing/designing-for-the-supervisor/drata.jpg': { width: 640, height: 481 },
  '../content/writing/designing-for-the-supervisor/dropzone AI.jpg': { width: 1280, height: 702 },
  '../content/writing/designing-for-the-supervisor/fleet-dashboard.jpg': { width: 1920, height: 960 },
  '../content/writing/designing-for-the-supervisor/safe.jpg': { width: 755, height: 480 },
  '../content/writing/designing-for-the-supervisor/vanta.jpg': { width: 806, height: 480 },
  '../content/writing/falling-down-the-rabbit-hole/cover-image.webp': { width: 1320, height: 720 },
  '../content/writing/sailing-the-data-oceans/cover-image.webp': { width: 1792, height: 1024 },
  '../content/writing/sailing-the-data-oceans/search-results-picker.webp': { width: 1920, height: 640 },
};

function imageAssetFromPath(path: string, src: string): ContentImage {
  const dimensions = imageDimensionsByPath[path] ?? defaultImageDimensions;
  return { src, ...dimensions };
}

function getImagesForSlug(slug: string): ContentImage[] {
  return Object.entries(expImageModules)
    .filter(([path]) => path.includes(`/experience/${slug}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, mod]) => imageAssetFromPath(path, mod.default));
}

// Optional brand icon per work folder: drop an `icon.svg` into the folder.
const workIconModules = import.meta.glob<{ default: string }>(
  '../content/experience/*/icon.svg',
  { eager: true }
);

function getIconForSlug(slug: string): string | undefined {
  const entry = Object.entries(workIconModules).find(([path]) =>
    path.includes(`/experience/${slug}/`),
  );
  return entry?.[1].default;
}

function splitByDepth(nodes: RootContent[], depth: 2 | 3): Array<{ heading: Heading; body: RootContent[] }> {
  const entries: Array<{ heading: Heading; body: RootContent[] }> = [];
  let current: { heading: Heading; body: RootContent[] } | null = null;
  for (const node of nodes) {
    if (node.type === 'heading' && node.depth === depth) {
      if (current) entries.push(current);
      current = { heading: node, body: [] };
    } else if (current) {
      current.body.push(node);
    }
  }
  if (current) entries.push(current);
  return entries;
}

function nodesToMarkdown(nodes: RootContent[]): string {
  if (nodes.length === 0) return '';
  const root: Root = { type: 'root', children: nodes };
  return toMarkdown(root, { extensions: [gfmToMarkdown()] }).trim();
}

function parseCV(): CV {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(cvRaw) as Root;
  const children = tree.children;

  // Header: h1 + preamble paragraphs (until the first h2)
  let name = '';
  let tagline = '';
  let contacts = '';
  let i = 0;
  for (; i < children.length; i++) {
    const node = children[i];
    if (node.type === 'heading' && node.depth === 2) break;
    if (node.type === 'heading' && node.depth === 1) {
      name = mdastToString(node);
    } else if (node.type === 'paragraph') {
      if (!tagline) tagline = nodesToMarkdown([node]);
      else if (!contacts) contacts = nodesToMarkdown([node]);
    }
  }

  // Group remaining content by h2 sections, keyed by lowercased title.
  const sections = new Map<string, RootContent[]>();
  let currentKey = '';
  for (; i < children.length; i++) {
    const node = children[i];
    if (node.type === 'heading' && node.depth === 2) {
      currentKey = mdastToString(node).toLowerCase();
      sections.set(currentKey, []);
    } else if (currentKey) {
      sections.get(currentKey)!.push(node);
    }
  }

  // Experience entries
  const experience: CVExperience[] = [];
  for (const entry of splitByDepth(sections.get('experience') ?? [], 3)) {
    const link = entry.heading.children.find((c): c is Link => c.type === 'link');
    if (!link) continue;
    const slug = link.url.replace(/^\/experience\//, '').replace(/\/$/, '');
    const company = mdastToString(link);

    // First paragraph in the body = meta line: **Role** · Period
    let role = '';
    let period = '';
    const firstBody = entry.body[0];
    if (firstBody && firstBody.type === 'paragraph') {
      const meta = firstBody as Paragraph;
      const strong = meta.children.find(c => c.type === 'strong');
      role = strong ? mdastToString(strong) : '';
      const full = mdastToString(meta);
      period = full.slice(role.length).replace(/^[\s·]+/, '').trim();
    }

    const bodyNodes = entry.body.slice(1);
    const body = nodesToMarkdown(bodyNodes);
    const firstPara = bodyNodes.find(n => n.type === 'paragraph');
    const summary = firstPara ? mdastToString(firstPara) : '';
    const images = getImagesForSlug(slug);

    experience.push({
      slug,
      company,
      role,
      period,
      summary,
      body,
      images,
      hasImages: images.length > 0,
    });
  }

  // Cert / Education: h3 title + free-form body, flattened to plain meta
  function parseNamedEntries(key: string): CVNamedEntry[] {
    return splitByDepth(sections.get(key) ?? [], 3).map(entry => ({
      title: mdastToString(entry.heading),
      meta: entry.body.map(n => mdastToString(n)).join(' ').trim(),
    }));
  }

  // Skills: h3 category + list items
  const skills: CVSkillGroup[] = [];
  for (const entry of splitByDepth(sections.get('skills') ?? [], 3)) {
    const list = entry.body.find((n): n is List => n.type === 'list');
    const items = list ? list.children.map(li => mdastToString(li)) : [];
    skills.push({ category: mdastToString(entry.heading), items });
  }

  return {
    raw: cvRaw,
    header: { name, tagline, contacts },
    experience,
    certificates: parseNamedEntries('certificates'),
    education: parseNamedEntries('education'),
    skills,
  };
}

const cv = parseCV();

export function getCV(): CV {
  return cv;
}

// ---- Writing folder loaders (used by case-study loader below) ----

const writingContentModules = import.meta.glob<string>(
  '../content/writing/*/index.md',
  { query: '?raw', import: 'default', eager: true }
);

const writingImageModules = import.meta.glob<{ default: string }>(
  '../content/writing/*/*.{jpg,jpeg,png,webp,gif,svg}',
  { eager: true }
);

function writingSlugFromPath(path: string): string {
  const m = path.match(/writing\/([^/]+)\//);
  return m ? m[1] : '';
}

function writingImagesMap(slug: string): Record<string, ContentImage> {
  const map: Record<string, ContentImage> = {};
  for (const [path, mod] of Object.entries(writingImageModules)) {
    if (!path.includes(`/writing/${slug}/`)) continue;
    const filename = path.split('/').pop();
    if (filename) map[filename] = imageAssetFromPath(path, mod.default);
  }
  return map;
}

// ---- Work (per-experience-folder work.md) ----

export interface Work {
  slug: string;
  company: string;
  role: string;
  period: string;
  cvSummary: string;             // first paragraph from cv.md (fallback for blurb)
  headline: string;              // editorial, clickable title; falls back to productTitle
  productTitle: string;          // product-value sentence; falls back to company
  blurb: string;                 // tile copy (work.md `blurb`, falls back to cvSummary)
  order: number;                 // ascending sort key
  icon?: string;                 // optional brand icon (icon.svg in the folder)
  heroImage?: ContentImage;      // top of work page
  tileImage?: ContentImage;      // Recent Work tile (first frame of cycle)
  body: string;                  // work.md markdown body (overview paragraphs)
  bodyImages: Record<string, ContentImage>; // keyed by filename, for inline image refs
  allImages: ContentImage[];     // every image in the folder, sorted (Recent Work cycles through these)
  galleryImages: ContentImage[]; // everything in folder excluding heroImage
}

interface WorkFrontMatter {
  headline?: string;
  productTitle?: string;
  blurb?: string;
  order?: number;
  hero?: string;
  tileImage?: string;
}

const workContentModules = import.meta.glob<string>(
  '../content/experience/*/work.md',
  { query: '?raw', import: 'default', eager: true }
);

function workSlugFromPath(path: string): string {
  const m = path.match(/experience\/([^/]+)\//);
  return m ? m[1] : '';
}

function buildWorks(): Work[] {
  const out: Work[] = [];
  for (const [path, raw] of Object.entries(workContentModules)) {
    const slug = workSlugFromPath(path);
    if (!slug) continue;
    const { frontMatter, body } = stripFrontMatter(raw);
    const fm = (frontMatter ?? {}) as WorkFrontMatter;

    const cvEntry = cv.experience.find(e => e.slug === slug);
    if (!cvEntry) continue;

    const allImages = getImagesForSlug(slug);
    const imageMap: Record<string, ContentImage> = {};
    for (const img of allImages) {
      const filename = img.src.split('/').pop();
      if (filename) imageMap[filename] = img;
    }

    const heroByName = fm.hero
      ? Object.entries(imageMap).find(([k]) => k.startsWith(fm.hero!))?.[1]
      : undefined;
    const tileByName = fm.tileImage
      ? Object.entries(imageMap).find(([k]) => k.startsWith(fm.tileImage!))?.[1]
      : undefined;

    const heroImage = heroByName ?? allImages[0];
    const tileImage = tileByName ?? heroImage;

    const galleryImages = heroImage
      ? allImages.filter(img => img.src !== heroImage.src)
      : allImages;

    const productTitle = fm.productTitle?.trim() || cvEntry.company;

    out.push({
      slug,
      company: cvEntry.company,
      role: cvEntry.role,
      period: cvEntry.period,
      cvSummary: cvEntry.summary,
      headline: fm.headline?.trim() || productTitle,
      productTitle,
      blurb: fm.blurb?.trim() || cvEntry.summary,
      order: typeof fm.order === 'number' ? fm.order : 999,
      icon: getIconForSlug(slug),
      heroImage,
      tileImage,
      body: body.trim(),
      bodyImages: imageMap,
      allImages,
      galleryImages,
    });
  }
  return out.sort((a, b) => a.order - b.order);
}

const works = buildWorks();

export function getAllWorks(): Work[] {
  return works;
}

export function getWorkBySlug(slug: string): Work | undefined {
  return works.find(w => w.slug === slug);
}

// ---- Case Studies (writing/<slug>/index.md with front-matter) ----

export interface CaseStudy {
  slug: string;                    // writing folder name
  workSlug: string;                // links to a Work
  title: string;                   // parsed from the first H1 in body
  excerpt: string;                 // 1–2 sentence narrative summary for Home Hero
  featured: boolean;
  coverImage?: ContentImage;
  body: string;                    // markdown body (includes H1)
  bodyImages: Record<string, ContentImage>;
}

function extractH1(body: string): string {
  const m = body.match(/^#\s+(.+?)\s*$/m);
  return m ? m[1].trim() : '';
}

interface CaseStudyFrontMatter {
  work?: string;
  excerpt?: string;
  featured?: boolean;
  cover?: string;
}

function buildCaseStudies(): CaseStudy[] {
  const out: CaseStudy[] = [];
  for (const [path, raw] of Object.entries(writingContentModules)) {
    const slug = writingSlugFromPath(path);
    if (!slug) continue;
    const { frontMatter, body } = stripFrontMatter(raw);
    const fm = (frontMatter ?? {}) as CaseStudyFrontMatter;

    // Skip files that haven't been migrated yet (no `work` field)
    if (!fm.work) continue;

    const images = writingImagesMap(slug);

    let coverImage: ContentImage | undefined;
    if (fm.cover) {
      const key = Object.keys(images).find(k => k.startsWith(fm.cover!));
      if (key) coverImage = images[key];
    }
    if (!coverImage) {
      const key = Object.keys(images).find(k => /^cover[-_.]/i.test(k));
      if (key) coverImage = images[key];
    }

    const trimmedBody = body.trim();
    out.push({
      slug,
      workSlug: fm.work,
      title: extractH1(trimmedBody),
      excerpt: fm.excerpt ?? '',
      featured: fm.featured === true,
      coverImage,
      body: trimmedBody,
      bodyImages: images,
    });
  }
  // Order case studies by their parent work's order, so the prev/next
  // navigation on case-study pages follows the same rhythm as Recent Work.
  return out.sort((a, b) => {
    const orderA = works.find(w => w.slug === a.workSlug)?.order ?? 999;
    const orderB = works.find(w => w.slug === b.workSlug)?.order ?? 999;
    return orderA - orderB;
  });
}

const caseStudies = buildCaseStudies();

export function getAllCaseStudies(): CaseStudy[] {
  return caseStudies;
}

export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find(cs => cs.slug === slug);
}

// Wrap-around adjacency so every page has both a prev and a next —
// the last item's "next" loops back to the first, and vice versa.
export function getAdjacentCaseStudies(slug: string): { prev?: CaseStudy; next?: CaseStudy } {
  const n = caseStudies.length;
  if (n <= 1) return {};
  const i = caseStudies.findIndex(cs => cs.slug === slug);
  if (i === -1) return {};
  return {
    prev: caseStudies[(i - 1 + n) % n],
    next: caseStudies[(i + 1) % n],
  };
}

export function getAdjacentWorks(slug: string): { prev?: Work; next?: Work } {
  const n = works.length;
  if (n <= 1) return {};
  const i = works.findIndex(w => w.slug === slug);
  if (i === -1) return {};
  return {
    prev: works[(i - 1 + n) % n],
    next: works[(i + 1) % n],
  };
}

export function getFeaturedCaseStudy(): CaseStudy | undefined {
  return caseStudies.find(cs => cs.featured);
}
