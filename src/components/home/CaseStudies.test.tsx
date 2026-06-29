import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import CaseStudies from './CaseStudies'
import { getAllCaseStudies } from '@/lib/content'

describe('CaseStudies', () => {
  it('renders each case study as a link to its page', () => {
    const studies = getAllCaseStudies()
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
})
