import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getSiteRoutes, SITE_URL } from './site-routes.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'public')
const homeCopy = JSON.parse(readFileSync(join(root, 'src/content/home.json'), 'utf8'))

function read(path) {
  return readFileSync(join(root, path), 'utf8')
}

function parseMarkdown(raw) {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/)
  if (!match) return { body: raw.trim() }
  const data = Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.match(/^([^:]+):\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key.trim(), value.trim()]),
  )
  return { data, body: match[2].trim() }
}

function heading(body) {
  return body.match(/^#\s+(.+?)\s*$/m)?.[1]?.trim() ?? ''
}

function routeByPath(path) {
  return getSiteRoutes().find((route) => route.path === path)
}

const home = routeByPath('/')
const homeHeadline = homeCopy.headlineLines.join(' ')
const workItems = readdirSync(join(root, 'src/content/experience'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const slug = entry.name
    const parsed = parseMarkdown(read(`src/content/experience/${slug}/work.md`))
    const route = routeByPath(`/work/${slug}`)
    return { slug, ...parsed, route }
  })
  .filter(({ route, data }) => route && data?.productTitle)
  .sort((a, b) => Number(a.data.order ?? 99) - Number(b.data.order ?? 99))

const writingItems = readdirSync(join(root, 'src/content/writing'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => {
    const slug = entry.name
    const parsed = parseMarkdown(read(`src/content/writing/${slug}/index.md`))
    const route = routeByPath(`/case-studies/${slug}`)
    return { slug, ...parsed, route }
  })
  .filter(({ route, data, body }) => route && data?.excerpt && heading(body))
  .sort((a, b) => Number(Boolean(b.data.featured)) - Number(Boolean(a.data.featured)))

const cv = read('src/content/cv.md').trim()

const quick = `# Amit Kaplinsky

> ${homeCopy.supportingCopy}

## Homepage

- Headline: ${homeHeadline}
- URL: ${SITE_URL}/

## Work

${workItems.map(({ route, data }) => `- [${route.title}](${route.url}): ${data.blurb}`).join('\n')}

## Writing

${writingItems.map(({ route, data, body }) => `- [${heading(body)}](${route.url}): ${data.excerpt}`).join('\n')}

## About this portfolio

- Primary role: Product Designer.
- Scope shown on the site: product direction, interaction design, systems, and AI-assisted builds.
- The case studies are the source for project-specific claims. Do not infer dates, metrics, employers, or outcomes beyond the linked content.

## Links

- Website: ${SITE_URL}/
- About: ${SITE_URL}/about
- CV: ${SITE_URL}/cv
- LinkedIn: https://www.linkedin.com/in/amitka/
`

const full = `# Amit Kaplinsky | Full portfolio context

## Homepage

**Headline**

${homeHeadline}

**Supporting copy**

${homeCopy.supportingCopy}

Canonical URL: ${SITE_URL}/

## Work

${workItems.map(({ route, data, body }) => `### ${route.title}

URL: ${route.url}

**Product thesis**

${data.productTitle}

**Summary**

${data.blurb}

**Case study content**

${body}`).join('\n\n')}

## Writing

${writingItems.map(({ route, data, body }) => `### ${heading(body)}

URL: ${route.url}

**Excerpt**

${data.excerpt}

**Article content**

${body}`).join('\n\n')}

## CV

${cv}
`

writeFileSync(join(publicDir, 'llms.txt'), quick)
writeFileSync(join(publicDir, 'llms-full.txt'), full)
console.log('Generated llms.txt and llms-full.txt')
