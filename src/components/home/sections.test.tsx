import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import homeCopy from '@/content/home.json'
import workCopy from '@/content/workWithMe.json'
import { getAllWorks } from '@/lib/content'
import { Featured } from './Featured'
import { Problem } from './Problem'
import { RecentWork } from './RecentWork'
import { Solution } from './Solution'

describe('Problem', () => {
  it('renders four numbered cards that FlowOverlay can measure', () => {
    const { container } = render(<Problem />)

    const cards = container.querySelectorAll('[data-flow="problem"]')
    expect(cards).toHaveLength(4)
    expect([...cards].map((card) => card.querySelector('span')?.textContent)).toEqual(['01', '02', '03', '04'])
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(workCopy.problem.label)
  })
})

describe('Solution', () => {
  it('renders three steps and a final circle, all measurable by FlowOverlay', () => {
    const { container } = render(<Solution />)

    const steps = container.querySelectorAll('[data-flow="step"]')
    expect(steps).toHaveLength(3)
    expect([...steps].map((s) => s.querySelector('h3')?.textContent)).toEqual(['Diagnose', 'Plan', 'Build'])
    expect(container.querySelectorAll('[data-flow="final"]')).toHaveLength(1)
    // FlowOverlay measures the circle through the final element's first child.
    expect(container.querySelector('[data-flow="final"]')?.firstElementChild).toBeInTheDocument()
  })

  it('keeps the connectors out of the accessibility tree', () => {
    const { container } = render(<Solution />)
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})

describe('Featured', () => {
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
