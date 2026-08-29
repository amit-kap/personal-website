/* Writes a complete, route-specific <head> into static HTML after Vite builds.
   Cloudflare Pages can then serve each route to crawlers without waiting for
   client-side React. The body stays the same app shell and hydrates normally. */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { getSiteRoutes, notFoundMetadata, OG_IMAGE, SITE_URL } from './site-routes.mjs'

const dist = join(process.cwd(), 'dist')
const template = readFileSync(join(dist, 'index.html'), 'utf8')

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function metadataBlock({ fullTitle, title, description, type, url, noIndex = false }) {
  const safeTitle = escapeHtml(fullTitle ?? title)
  const safeDescription = escapeHtml(description)
  const safeUrl = escapeHtml(url)
  return `<!-- seo:start -->
    <title data-seo="title">${safeTitle}</title>
    <meta data-seo="description" name="description" content="${safeDescription}" />
    ${url ? `<link data-seo="canonical" rel="canonical" href="${safeUrl}" />` : ''}
    <meta data-seo="og:type" property="og:type" content="${type}" />
    <meta data-seo="og:title" property="og:title" content="${safeTitle}" />
    <meta data-seo="og:description" property="og:description" content="${safeDescription}" />
    ${url ? `<meta data-seo="og:url" property="og:url" content="${safeUrl}" />` : ''}
    <meta data-seo="og:image" property="og:image" content="${OG_IMAGE}" />
    <meta data-seo="og:image:width" property="og:image:width" content="1200" />
    <meta data-seo="og:image:height" property="og:image:height" content="630" />
    <meta data-seo="og:site_name" property="og:site_name" content="Amit Kaplinsky" />
    <meta data-seo="twitter:card" name="twitter:card" content="summary_large_image" />
    <meta data-seo="twitter:title" name="twitter:title" content="${safeTitle}" />
    <meta data-seo="twitter:description" name="twitter:description" content="${safeDescription}" />
    <meta data-seo="twitter:image" name="twitter:image" content="${OG_IMAGE}" />
    ${noIndex ? '<meta data-seo="robots" name="robots" content="noindex" />' : ''}
    <!-- seo:end -->`
}

function withMetadata(metadata) {
  const block = metadataBlock(metadata)
  const result = template.replace(/<!-- seo:start -->[\s\S]*?<!-- seo:end -->/, block)
  if (result === template) throw new Error('Missing SEO markers in index.html')
  return result
}

for (const route of getSiteRoutes()) {
  const output = route.path === '/' ? join(dist, 'index.html') : join(dist, route.path.slice(1), 'index.html')
  mkdirSync(dirname(output), { recursive: true })
  writeFileSync(output, withMetadata(route))
}

writeFileSync(
  join(dist, '404.html'),
  withMetadata({ ...notFoundMetadata, url: `${SITE_URL}/404` }),
)

console.log(`Prerendered ${getSiteRoutes().length} routes and a 404 page`)
