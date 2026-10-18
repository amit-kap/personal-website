import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, vi } from 'vitest'
import Agent from './Agent'

const markdown = '# Portfolio\n\n## Work\n\nSome **plain** text with a [link](https://example.com).\n\n- one\n- two\n'

function mockFetch(impl: () => Promise<Partial<Response>>) {
  const fetchMock = vi.fn(impl)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('Agent page', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('fetches /llms-full.txt and renders the markdown', async () => {
    const fetchMock = mockFetch(() => Promise.resolve({ ok: true, text: () => Promise.resolve(markdown) }))
    render(<Agent />, { wrapper: MemoryRouter })

    expect(screen.getByText(/Loading the full portfolio text/)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: 'Portfolio' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledWith('/llms-full.txt')
    expect(screen.getByRole('heading', { name: 'Work' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute('href', 'https://example.com')
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.queryByText(/Loading the full portfolio text/)).not.toBeInTheDocument()
  })

  it('has no Human view or Download Markdown buttons', async () => {
    mockFetch(() => Promise.resolve({ ok: true, text: () => Promise.resolve(markdown) }))
    render(<Agent />, { wrapper: MemoryRouter })
    await screen.findByRole('heading', { name: 'Portfolio' })

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.queryByText(/human view/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/download markdown/i)).not.toBeInTheDocument()
  })

  it('shows the raw-file fallback when the request fails', async () => {
    mockFetch(() => Promise.reject(new Error('offline')))
    render(<Agent />, { wrapper: MemoryRouter })

    expect(await screen.findByText(/temporarily unavailable/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'raw Markdown file' })).toHaveAttribute('href', '/llms-full.txt')
  })

  it('shows the fallback for a non-OK response', async () => {
    mockFetch(() => Promise.resolve({ ok: false, status: 404, text: () => Promise.resolve('nope') }))
    render(<Agent />, { wrapper: MemoryRouter })

    expect(await screen.findByRole('link', { name: 'raw Markdown file' })).toBeInTheDocument()
    expect(screen.queryByText('nope')).not.toBeInTheDocument()
  })

  it('ignores a response that arrives after unmount', async () => {
    let resolve!: (r: Partial<Response>) => void
    mockFetch(() => new Promise((r) => (resolve = r)))
    const { unmount } = render(<Agent />, { wrapper: MemoryRouter })
    unmount()

    resolve({ ok: true, text: () => Promise.resolve(markdown) })
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Portfolio' })).not.toBeInTheDocument())
  })
})
