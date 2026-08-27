import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getAllCaseStudies } from '@/lib/content'
import Blog from './Blog'

describe('Blog', () => {
  it('renders the featured and supporting articles with their live routes', () => {
    render(<Blog />, { wrapper: MemoryRouter })

    for (const study of getAllCaseStudies()) {
      expect(screen.getByRole('link', { name: new RegExp(`${study.title} cover`, 'i') }))
        .toHaveAttribute('href', `/case-studies/${study.slug}`)
    }
  })
})
