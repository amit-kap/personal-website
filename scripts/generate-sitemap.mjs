/* Writes public/sitemap.xml from the content folders, so adding a work or a
   writing folder is enough — nothing here needs editing. Runs before build. */
import { readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://amit-kap.github.io/personal-website'

const dirs = (path) =>
  readdirSync(join(root, path), { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()

const routes = [
  { path: '/', priority: '1.0' },
  { path: '/about', priority: '0.8' },
  { path: '/blog', priority: '0.8' },
  { path: '/cv', priority: '0.6' },
  ...dirs('src/content/experience').map((slug) => ({ path: `/work/${slug}`, priority: '0.9' })),
  ...dirs('src/content/writing').map((slug) => ({ path: `/case-studies/${slug}`, priority: '0.7' })),
]

const today = new Date().toISOString().slice(0, 10)
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    ({ path, priority }) =>
      `  <url>\n    <loc>${SITE}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`

writeFileSync(join(root, 'public/sitemap.xml'), xml)
console.log(`sitemap.xml: ${routes.length} routes`)
