import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import WorkItem from '@/pages/WorkItem'
import { compactStories } from './compactStories'

function renderWork(slug: string) {
  return render(
    <MemoryRouter initialEntries={[`/work/${slug}`]}>
      <Routes>
        <Route path="/work/:slug" element={<WorkItem />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Shift work page', () => {
  it('shows the meta line without the TLV tag', () => {
    renderWork('shift')

    const meta = document.querySelector('.meta-line')!
    expect(meta).toHaveTextContent('Third-Party Risk')
    expect(meta).toHaveTextContent('Founding Designer')
    expect(meta.textContent).not.toMatch(/TLV/)
  })

  it('ends with Back to home and the related Read link', () => {
    renderWork('shift')

    expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Read: Designing for the Supervisor' }))
      .toHaveAttribute('href', '/case-studies/designing-for-the-supervisor')
  })

  it('renders a window card for each feature and opens it in a lightbox with the window bar', async () => {
    renderWork('shift')

    const cards = screen.getAllByRole('button', { name: /^Enlarge: / })
    expect(cards).toHaveLength(4)
    for (const card of cards) expect(card.querySelector('.winbar')).toBeInTheDocument()

    cards[1].focus()
    fireEvent.click(cards[1])
    const dialog = screen.getByRole('dialog', { name: 'Shift vendor inventory' })
    expect(dialog.querySelector('.winbar-lg')).toBeInTheDocument()

    fireEvent.keyDown(dialog, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(cards[1]).toHaveFocus()
  })
})

describe('compact work pages', () => {
  it('show the story meta without TLV, for every compact work', () => {
    for (const slug of Object.keys(compactStories)) {
      const { unmount } = renderWork(slug)
      const meta = document.querySelector('.meta-line')!
      expect(meta.textContent).toBe(compactStories[slug].meta)
      expect(meta.textContent).not.toMatch(/TLV/)
      unmount()
    }
  })

  it('renders the Veriti page with its surfaces as window cards', () => {
    renderWork('veriti')

    const surfaces = compactStories.veriti.surfaces!
    expect(screen.getByRole('heading', { name: surfaces.heading })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /^Enlarge: / }).length).toBeGreaterThan(0)
    for (const item of surfaces.items) expect(screen.getByRole('heading', { name: item.title })).toBeInTheDocument()
  })

  it('closes the page with Back to home, plus Read only where the story has related writing', () => {
    for (const [slug, story] of Object.entries(compactStories)) {
      const { unmount } = renderWork(slug)
      expect(screen.getByRole('link', { name: 'Back to home' })).toBeInTheDocument()
      // Only the closing actions row: inline copy may link to writing too.
      const actions = within(screen.getByRole('link', { name: 'Back to home' }).closest('section')!).getAllByRole('link')
      expect(actions).toHaveLength(story.related ? 2 : 1)
      if (story.related) expect(screen.getByRole('link', { name: story.related.label })).toHaveAttribute('href', story.related.to)
      unmount()
    }
  })

  it('opens a surface in the lightbox', () => {
    renderWork('veriti')

    fireEvent.click(screen.getAllByRole('button', { name: /^Enlarge: / })[0])
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('img')).toBeInTheDocument()
    expect(dialog.querySelector('.winbar-lg')).toBeInTheDocument()
  })
})
