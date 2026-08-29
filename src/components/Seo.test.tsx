import { render, waitFor } from '@testing-library/react'
import Seo from './Seo'

const fixture = `
  <title data-seo="title">Amit Kaplinsky — Product Designer</title>
  <meta data-seo="description" name="description" content="Home description" />
  <link data-seo="canonical" rel="canonical" href="https://amitkap.com/" />
  <meta data-seo="og:type" property="og:type" content="website" />
  <meta data-seo="og:title" property="og:title" content="Amit Kaplinsky — Product Designer" />
  <meta data-seo="og:description" property="og:description" content="Home description" />
  <meta data-seo="og:url" property="og:url" content="https://amitkap.com/" />
  <meta data-seo="og:image" property="og:image" content="https://amitkap.com/og.png" />
  <meta data-seo="og:image:width" property="og:image:width" content="1200" />
  <meta data-seo="og:image:height" property="og:image:height" content="630" />
  <meta data-seo="og:site_name" property="og:site_name" content="Amit Kaplinsky" />
  <meta data-seo="twitter:card" name="twitter:card" content="summary_large_image" />
  <meta data-seo="twitter:title" name="twitter:title" content="Amit Kaplinsky — Product Designer" />
  <meta data-seo="twitter:description" name="twitter:description" content="Home description" />
  <meta data-seo="twitter:image" name="twitter:image" content="https://amitkap.com/og.png" />
`

describe('Seo', () => {
  beforeEach(() => {
    document.head.innerHTML = fixture
  })

  it('updates the prerendered metadata instead of adding duplicates', async () => {
    render(
      <Seo
        title="Shift — Founding Designer"
        description="A vendor-security platform designed from zero."
        path="/work/shift"
        type="article"
      />,
    )

    await waitFor(() => {
      expect(document.title).toBe('Shift — Founding Designer — Amit Kaplinsky')
    })

    expect(document.head.querySelectorAll('meta[name="description"]')).toHaveLength(1)
    expect(document.head.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'A vendor-security platform designed from zero.',
    )
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://amitkap.com/work/shift',
    )
    expect(document.head.querySelector('meta[property="og:type"]')).toHaveAttribute('content', 'article')
  })

  it('adds noindex for the not-found page and removes it on the next route', async () => {
    const { rerender } = render(<Seo title="Page not found" description="Missing." path="/404" noIndex />)

    await waitFor(() => {
      expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute('content', 'noindex')
    })

    rerender(<Seo title="About" description="About Amit." path="/about" />)

    await waitFor(() => {
      expect(document.head.querySelector('meta[name="robots"]')).toBeNull()
    })
  })
})
