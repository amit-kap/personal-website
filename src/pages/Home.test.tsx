import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getAllCaseStudies, getAllWorks } from '@/lib/content'
import Home from './Home'

describe('Home', () => {
  it('links each product and article from the live landing page', () => {
    render(<Home />, { wrapper: MemoryRouter })

    for (const work of getAllWorks()) {
      expect(screen.getByRole('link', { name: new RegExp(work.productTitle, 'i') }))
        .toHaveAttribute('href', `/work/${work.slug}`)
    }

    for (const study of getAllCaseStudies()) {
      expect(screen.getByRole('link', { name: new RegExp(study.title, 'i') }))
        .toHaveAttribute('href', `/case-studies/${study.slug}`)
    }
  })
})
