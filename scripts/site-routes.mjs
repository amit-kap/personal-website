import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

export const SITE_URL = 'https://amitkap.com'
export const OG_IMAGE = `${SITE_URL}/og-v2.png`

const staticRoutes = [
  {
    path: '/',
    title: 'Amit Kaplinsky | Product Designer',
    description: 'Product designer with twelve years in cybersecurity, working across product direction, interaction design, systems, and AI-assisted builds.',
    type: 'website',
    priority: '1.0',
  },
  {
    path: '/about',
    title: 'About',
    description: 'Product designer with twelve years in cybersecurity, working across product direction, design systems, human-agent workflows, and AI-assisted prototyping.',
    type: 'website',
    priority: '0.8',
  },
  {
    path: '/blog',
    title: 'Blog',
    description: 'Product strategy and design notes on AI-agent supervision, high-volume security data, and shipping a mobile app inside enterprise security.',
    type: 'website',
    priority: '0.8',
  },
  {
    path: '/cv',
    title: 'CV',
    description: "Amit Kaplinsky's CV: cybersecurity product direction, founding design, design systems, human-agent workflows, and AI prototyping.",
    type: 'website',
    priority: '0.6',
  },
  {
    path: '/agent',
    title: 'Agent view',
    description: "A text-first, machine-readable view of Amit Kaplinsky's portfolio and case studies.",
    type: 'website',
    priority: '0.5',
  },
]

function read(path) {
  return readFileSync(join(root, path), 'utf8')
}

function directories(path) {
  return readdirSync(join(root, path), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

function frontMatter(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return { data: {}, body: raw }
  return { data: parseYaml(match[1]) ?? {}, body: match[2] }
}

function experienceBySlug() {
  const entries = new Map()
  const expression = /^### \[([^\]]+)\]\(\/experience\/([^/)]+)\)\s*\n\s*\*\*([^*]+)\*\*/gm
  for (const match of read('src/content/cv.md').matchAll(expression)) {
    entries.set(match[2], { company: match[1], role: match[3].trim() })
  }
  return entries
}

function fullTitle(title, path) {
  return path === '/' ? title : `${title} | Amit Kaplinsky`
}

export function getSiteRoutes() {
  const experience = experienceBySlug()
  const works = directories('src/content/experience').flatMap((slug) => {
    const entry = experience.get(slug)
    if (!entry) return []
    const { data } = frontMatter(read(`src/content/experience/${slug}/work.md`))
    const description = typeof data.blurb === 'string' ? data.blurb.trim() : ''
    if (!description) return []
    return [{
      path: `/work/${slug}`,
      title: `${entry.company} | ${entry.role}`,
      description,
      type: 'article',
      priority: '0.9',
    }]
  })

  const caseStudies = directories('src/content/writing').flatMap((slug) => {
    const { data, body } = frontMatter(read(`src/content/writing/${slug}/index.md`))
    if (typeof data.work !== 'string' || typeof data.excerpt !== 'string') return []
    const title = body.trim().match(/^#\s+(.+?)\s*$/m)?.[1]?.trim()
    if (!title) return []
    return [{
      path: `/case-studies/${slug}`,
      title,
      description: data.excerpt.trim(),
      type: 'article',
      priority: '0.7',
    }]
  })

  return [...staticRoutes, ...works, ...caseStudies].map((route) => ({
    ...route,
    fullTitle: fullTitle(route.title, route.path),
    url: `${SITE_URL}${route.path}`,
  }))
}

export const notFoundMetadata = {
  title: 'Page not found | Amit Kaplinsky',
  description: 'This page does not exist.',
  type: 'website',
  noIndex: true,
}
