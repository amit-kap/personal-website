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
