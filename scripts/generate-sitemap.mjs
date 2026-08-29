/* Uses the same route manifest as prerendering. Omit lastmod instead of
   claiming every URL changed on every deployment. */
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getSiteRoutes } from './site-routes.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const routes = getSiteRoutes()
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    ({ url, priority }) =>
      `  <url>\n    <loc>${url}</loc>\n    <priority>${priority}</priority>\n  </url>`,
  )
  .join('\n')}
</urlset>
`

writeFileSync(join(root, 'public/sitemap.xml'), xml)
console.log(`sitemap.xml: ${routes.length} routes`)
