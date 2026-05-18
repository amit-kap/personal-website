export interface ExperienceDetail {
  slug: string;
  content: string;
  images: string[];
}

const expContentModules = import.meta.glob<string>(
  '../content/experience/*/index.md',
  { query: '?raw', import: 'default', eager: true }
);

const expImageModules = import.meta.glob<{ default: string }>(
  '../content/experience/*/*.{jpg,jpeg,png,webp,gif}',
  { eager: true }
);

function slugFromPath(path: string): string {
  const match = path.match(/experience\/([^/]+)\//);
  return match ? match[1] : '';
}

function getImagesForSlug(slug: string): string[] {
  return Object.entries(expImageModules)
    .filter(([path]) => path.includes(`/experience/${slug}/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, mod]) => mod.default);
}

export function getExperienceDetail(slug: string): ExperienceDetail | undefined {
  const entry = Object.entries(expContentModules).find(([path]) => slugFromPath(path) === slug);
  if (!entry) return undefined;
  return { slug, content: entry[1], images: getImagesForSlug(slug) };
}

export function getCoverImage(slug: string, index = 0): string | undefined {
  return getImagesForSlug(slug)[index];
}

export function getAllExperienceImages(): Array<{ slug: string; src: string }> {
  return Object.entries(expImageModules).map(([path, mod]) => ({
    slug: slugFromPath(path),
    src: mod.default,
  }));
}

// ---- Writing ----

export interface WritingDetail {
  slug: string;
  content: string;
  images: Record<string, string>;
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

function writingImagesMap(slug: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [path, mod] of Object.entries(writingImageModules)) {
    if (!path.includes(`/writing/${slug}/`)) continue;
    const filename = path.split('/').pop();
    if (filename) map[filename] = mod.default;
  }
  return map;
}

export function getWritingDetail(slug: string): WritingDetail | undefined {
  const entry = Object.entries(writingContentModules).find(([p]) => writingSlugFromPath(p) === slug);
  if (!entry) return undefined;
  return { slug, content: entry[1], images: writingImagesMap(slug) };
}
