import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import homeCopy from '@/content/home.json'
import workCopy from '@/content/workWithMe.json'
import { getAllWorks } from '@/lib/content'
import { Featured } from './Featured'
import { Problem } from './Problem'
import { RecentWork } from './RecentWork'
import { Solution } from './Solution'

describe('Problem', () => {
  it('renders the four problems as a list under the headline', () => {
    render(<Problem />)

    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(workCopy.problem.items.map((item) => item.title))
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(workCopy.problem.label)
  })
})

describe('Solution', () => {
  it('renders three numbered steps as an ordered list, with no links', () => {
    const { container } = render(<Solution />)

    expect(container.querySelector('ol')?.querySelectorAll(':scope > li')).toHaveLength(3)
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['1. Diagnose', '2. Plan', '3. Build'])
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})

describe('Featured', () => {
  it('opens the case study from a click anywhere on the text under the media', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Featured />} />
          <Route path="/work/:slug" element={<p>case study page</p>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByText(homeCopy.featured.tagline))
    expect(screen.getByText('case study page')).toBeInTheDocument()
  })

  it('has exactly one link, the View button into the Shift case study', () => {
    render(<Featured />, { wrapper: MemoryRouter })

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAttribute('href', '/work/shift')
    expect(links[0]).toHaveAccessibleName(/view the shift case study/i)
    expect(links[0]).toHaveTextContent('View')
  })

  it('does not make the card itself a link', () => {
    const { container } = render(<Featured />, { wrapper: MemoryRouter })

    const link = screen.getByRole('link')
    const card = container.querySelector('section')!
    // The link wraps only its own button, never the media or the title.
    expect(link.contains(card.querySelector('video, img'))).toBe(false)
    expect(link).not.toContainElement(screen.getByText(homeCopy.featured.tagline))
  })
})

describe('RecentWork', () => {
  it('links a tile to each work that has an outcome', () => {
    render(<RecentWork works={getAllWorks()} />, { wrapper: MemoryRouter })

    const outcomes = Object.keys(homeCopy.recentWork.outcomes)
    const tiles = within(screen.getByRole('heading', { name: homeCopy.recentWork.label }).closest('section')!).getAllByRole('link')
    expect(tiles.map((t) => t.getAttribute('href'))).toEqual(outcomes.map((slug) => `/work/${slug}`))
  })

  it('skips works with no configured outcome', () => {
    const unknown = { ...getAllWorks()[0], slug: 'unlisted' }
    render(<RecentWork works={[unknown]} />, { wrapper: MemoryRouter })
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})
