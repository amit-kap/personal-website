import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import { toString as mdastToString } from 'mdast-util-to-string';
import { toMarkdown } from 'mdast-util-to-markdown';
import { gfmToMarkdown } from 'mdast-util-gfm';
import type { Root, RootContent, Heading, Link, Paragraph, List } from 'mdast';
import cvRaw from '../content/cv.md?raw';

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
  '../content/writing/designing-for-the-supervisor/cover-image.webp': { width: 1672, height: 941 },
  '../content/writing/falling-down-the-rabbit-hole/cover-image.webp': { width: 1320, height: 720 },
  '../content/writing/sailing-the-data-oceans/cover-image.webp': { width: 1792, height: 1024 },
  '../content/writing/sailing-the-data-oceans/search-results-picker.webp': { width: 1920, height: 640 },
};

function imageAssetFromPath(path: string, src: string): ContentImage {
  const dimensions = imageDimensionsByPath[path] ?? defaultImageDimensions;
  return { src, ...dimensions };
}

function slugFromPath(path: string): string {
  const match = path.match(/experience\/([^/]+)\//);
  return match ? match[1] : '';
}

function getImagesForSlug(slug: string): ContentImage[] {
  return Object.entries(expImageModules)
    .filter(([path]) => path.includes(`/experience/${slug}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, mod]) => imageAssetFromPath(path, mod.default));
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

export function getExperienceBySlug(slug: string): CVExperience | undefined {
  return cv.experience.find(e => e.slug === slug);
}

export function getCoverImage(slug: string, index = 0): string | undefined {
  return getImagesForSlug(slug)[index]?.src;
}

export function getAllExperienceImages(): Array<{ slug: string } & ContentImage> {
  return Object.entries(expImageModules).map(([path, mod]) => ({
    slug: slugFromPath(path),
    ...imageAssetFromPath(path, mod.default),
  }));
}

// ---- Writing ----

export interface WritingDetail {
  slug: string;
  content: string;
  images: Record<string, ContentImage>;
}

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

export function getWritingDetail(slug: string): WritingDetail | undefined {
  const entry = Object.entries(writingContentModules).find(([p]) => writingSlugFromPath(p) === slug);
  if (!entry) return undefined;
  return { slug, content: entry[1], images: writingImagesMap(slug) };
}
