import { useEffect } from 'react'

/* Production HTML is written at build time by scripts/prerender.mjs. This
   component updates that one metadata set after client-side navigation without
   adding duplicate tags to the document head. */

export const SITE_URL = 'https://amitkap.com'
const OG_IMAGE = `${SITE_URL}/og-v2.png`

export default function Seo({
  title,
  description,
  path,
  type = 'website',
  noIndex = false,
}: {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  noIndex?: boolean
}) {
  const url = `${SITE_URL}${path}`
  const full = path === '/' ? title : `${title} | Amit Kaplinsky`

  useEffect(() => {
    document.title = full
    const content = {
      description,
      canonical: url,
      'og:type': type,
      'og:title': full,
      'og:description': description,
      'og:url': url,
      'og:image': OG_IMAGE,
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:site_name': 'Amit Kaplinsky',
      'twitter:card': 'summary_large_image',
      'twitter:title': full,
      'twitter:description': description,
      'twitter:image': OG_IMAGE,
    }

    for (const [name, value] of Object.entries(content)) {
      const element = document.head.querySelector<HTMLElement>(`[data-seo="${name}"]`)
      if (!element) continue
      if (element instanceof HTMLLinkElement) element.href = value
      else element.setAttribute('content', value)
    }

    const robots = document.head.querySelector<HTMLMetaElement>('meta[data-seo="robots"]')
    if (noIndex) {
      const element = robots ?? document.head.appendChild(document.createElement('meta'))
      element.dataset.seo = 'robots'
      element.name = 'robots'
      element.content = 'noindex'
    } else {
      robots?.remove()
    }
  }, [description, full, noIndex, type, url])

  return null
}
