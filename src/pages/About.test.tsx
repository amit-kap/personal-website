import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getCV } from '@/lib/content'
import About from './About'

const cv = getCV()

function renderAbout() {
  return render(<About />, { wrapper: MemoryRouter })
}

/* The whole CV entry (date column and content) a heading belongs to. */
function entryOf(heading: HTMLElement) {
  return heading.closest<HTMLElement>('.grid')!
}

function rowOf(company: string) {
  const heading = screen.getAllByRole('heading', { level: 2 }).find((h) => h.textContent?.startsWith(company))
  return entryOf(heading!)
}

describe('About experience', () => {
  it('shows one row per job with the company as plain text, not a link', () => {
    renderAbout()

    for (const entry of cv.experience) {
      const heading = screen.getAllByRole('heading', { level: 2 }).find((h) => h.textContent?.includes(entry.company))
      expect(heading).toBeDefined()
      expect(within(heading!).queryByRole('link')).not.toBeInTheDocument()
    }
  })

  it('puts the role on its own element and formats the period', () => {
    renderAbout()

    const row = rowOf('Shift')
    const role = within(row).getByText('Founding Designer')
    expect(role.tagName).toBe('SPAN')
    expect(role).not.toHaveTextContent('Shift')
    expect(within(row).getByText('10/2024–Now')).toBeInTheDocument()
  })

  it('shimmers Founding Designer roles only', () => {
    renderAbout()

    for (const entry of cv.experience) {
      const role = within(rowOf(entry.company)).getByText(entry.role)
      if (/founding designer/i.test(entry.role)) expect(role).toHaveClass('shimmer-text')
      else expect(role).not.toHaveClass('shimmer-text')
    }
    expect(document.querySelectorAll('.shimmer-text').length).toBe(cv.experience.filter((e) => /founding designer/i.test(e.role)).length)
  })

  it('links a View button per row to its work page', () => {
    renderAbout()

    const views = screen.getAllByRole('link', { name: /^View the .+ work$/ })
    expect(views.map((v) => v.getAttribute('href'))).toEqual(cv.experience.map((e) => `/work/${e.slug}`))
    for (const view of views) expect(view).toHaveTextContent('View')
  })

  it('lists each role\'s bullets', () => {
    renderAbout()
    for (const bullet of cv.experience[0].bullets) expect(screen.getByText(bullet)).toBeInTheDocument()
  })
})

describe('About certificates and education', () => {
  it('renders a row for each entry with its place and en-dash date', () => {
    renderAbout()

    for (const entry of [...cv.certificates, ...cv.education]) {
      expect(screen.getByRole('heading', { name: entry.title })).toBeInTheDocument()
    }
    const degree = entryOf(screen.getByRole('heading', { name: 'B.A. Economics' }))
    expect(within(degree).getByText('Tel Aviv University')).toBeInTheDocument()
    expect(within(degree).getByText('1994–1996')).toBeInTheDocument()
  })
})
