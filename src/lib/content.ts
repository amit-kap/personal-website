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
