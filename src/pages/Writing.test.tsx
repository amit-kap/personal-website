import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getAllCaseStudies } from '@/lib/content'
import Writing from './Writing'

describe('Writing', () => {
  it('renders the featured and supporting articles with their live routes', () => {
    render(<Writing />, { wrapper: MemoryRouter })

    for (const study of getAllCaseStudies()) {
      expect(screen.getByRole('link', { name: new RegExp(study.title, 'i') }))
        .toHaveAttribute('href', `/case-studies/${study.slug}`)
    }
  })
})
