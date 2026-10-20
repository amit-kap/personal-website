import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, vi } from 'vitest'
import { getAllCaseStudies, getAllWorks } from '@/lib/content'
import { getLenis } from '@/lib/useSmoothScroll'
import App from './App'

const homeLoad = vi.hoisted(() => {
  let release!: () => void
  const ready = new Promise<void>((resolve) => { release = resolve })
  return { ready, release }
})

vi.mock('@/pages/Home', async (importOriginal) => {
  await homeLoad.ready
  return importOriginal()
})

function Where() {
  return <output data-testid="where">{useLocation().pathname}</output>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
      <Where />
    </MemoryRouter>,
  )
}

const works = getAllWorks()
const studies = getAllCaseStudies()

/* Every route, with the title its page sets (Seo appends the site name except on /). */
const routes: [path: string, title: RegExp][] = [
  ['/', /^Amit Kaplinsky \| Senior Product Designer$/],
  ['/about', /^About \| Amit Kaplinsky$/],
  ['/work-with-me', /^Work with me \| Amit Kaplinsky$/],
  ['/agent', /^Agent view \| Amit Kaplinsky$/],
  ...works.map((w): [string, RegExp] => [`/work/${w.slug}`, new RegExp(`^${w.company} \\| ${w.role} \\| Amit Kaplinsky$`)]),
  ...studies.map((s): [string, RegExp] => [`/case-studies/${s.slug}`, /\| Amit Kaplinsky$/]),
  ['/no/such/page', /^Page not found \| Amit Kaplinsky$/],
  ['/work/no-such-work', /^Page not found \| Amit Kaplinsky$/],
]

describe('App routes', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, text: () => Promise.resolve('# Portfolio') })))
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    document.title = ''
  })

  it('keeps navigation available and restores scrolling after a slow route loads', async () => {
    renderAt('/')
    const scrollTo = vi.spyOn(getLenis()!, 'scrollTo')

    try {
      expect(screen.getByText('Loading page…')).toBeInTheDocument()
      expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      expect(screen.queryByRole('main')).not.toBeInTheDocument()
      await act(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())))
      expect(scrollTo).not.toHaveBeenCalled()
    } finally {
      homeLoad.release()
    }

    await screen.findByRole('main')
    expect(screen.queryByText('Loading page…')).not.toBeInTheDocument()
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, { immediate: true }))
  })

  it.each(routes)('%s renders one main landmark and sets its document title', async (path, title) => {
    renderAt(path)

    expect(await screen.findByRole('main')).toBeInTheDocument()
    expect(screen.getAllByRole('main')).toHaveLength(1)
    await waitFor(() => expect(document.title).toMatch(title))
    expect(screen.getAllByRole('banner')[0]).toHaveTextContent('Amit Kaplinsky')
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it.each(['/blog', '/writing'])('redirects the hidden %s index home', async (path) => {
    renderAt(path)

    await screen.findByRole('main')
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/$/)
  })

  it('hides the primary navigation on the agent view only', async () => {
    const { unmount } = renderAt('/agent')
    await screen.findByRole('main')
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).not.toBeInTheDocument()
    unmount()

    renderAt('/about')
    await screen.findByRole('main')
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument()
  })

  it('has a not-found page that offers a way home', async () => {
    renderAt('/nope')

    expect(await screen.findByRole('heading', { name: 'This page does not exist.' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Back to home' })[0]).toHaveAttribute('href', '/')
  })

  // Real gap: an unknown /work/<slug> renders a bare div, so the page has no main
  // landmark and never sets a title (the previous route's title lingers).
})
