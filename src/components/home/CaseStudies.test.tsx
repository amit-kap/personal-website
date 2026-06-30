import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CaseStudies from './CaseStudies'
import { getAllCaseStudies } from '@/lib/content'

describe('CaseStudies', () => {
  it('renders each non-featured case study as a link to its page', () => {
    // The featured study lives in the Featured band, so this section excludes it.
    const studies = getAllCaseStudies().filter((cs) => !cs.featured)
    expect(studies.length).toBeGreaterThan(0)

    render(
      <MemoryRouter>
        <CaseStudies />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /case studies/i })).toBeInTheDocument()
    for (const cs of studies) {
      const link = screen.getByRole('link', { name: new RegExp(cs.title, 'i') })
      expect(link).toHaveAttribute('href', `/case-studies/${cs.slug}`)
    }
  })

  it('excludes the featured case study from this section', () => {
    const featured = getAllCaseStudies().find((cs) => cs.featured)
    render(
      <MemoryRouter>
        <CaseStudies />
      </MemoryRouter>,
    )
    if (featured) {
      expect(
        screen.queryByRole('link', { name: new RegExp(featured.title, 'i') }),
      ).not.toBeInTheDocument()
    }
  })
})
