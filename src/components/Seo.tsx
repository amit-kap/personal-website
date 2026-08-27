/* Per-route metadata. React 19 hoists <title>, <meta> and <link> rendered
   anywhere in the tree into <head>, so this needs no helmet library.
   Absolute URLs throughout — crawlers resolve og:image against nothing. */

export const SITE_URL = 'https://amitkap.com'
const OG_IMAGE = `${SITE_URL}/og.png`

export default function Seo({
  title,
  description,
  path,
  type = 'website',
}: {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
}) {
  const url = `${SITE_URL}${path}`
  const full = path === '/' ? title : `${title} — Amit Kaplinsky`
  return (
    <>
      <title>{full}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Amit Kaplinsky" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={full} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
    </>
  )
}
