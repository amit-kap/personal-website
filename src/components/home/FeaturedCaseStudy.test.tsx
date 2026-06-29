import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import FeaturedCaseStudy from './FeaturedCaseStudy'
import { getFeaturedCaseStudy } from '@/lib/content'

describe('FeaturedCaseStudy', () => {
  it('links to the featured case study and shows its title', () => {
    const featured = getFeaturedCaseStudy()
    expect(featured).toBeDefined()

    render(
      <MemoryRouter>
        <FeaturedCaseStudy />
      </MemoryRouter>,
    )

    expect(screen.getByText(/featured/i)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: new RegExp(featured!.title, 'i') })
    expect(link).toHaveAttribute('href', `/case-studies/${featured!.slug}`)
  })
})
