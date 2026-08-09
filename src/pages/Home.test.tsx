import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getAllCaseStudies, getAllWorks } from '@/lib/content'
import Home from './Home'

describe('Home', () => {
  it('keeps original Shift filenames as image lookup keys', () => {
    const shift = getAllWorks().find((work) => work.slug === 'shift')

    expect(shift?.bodyImages['01-shift-dashboard.webp']?.src).toBeTruthy()
    expect(shift?.bodyImages['02-inventory-vendors-page.webp']?.src).toBeTruthy()
    expect(shift?.bodyImages['04-vendor-access-graph.webp']?.src).toBeTruthy()
    expect(shift?.bodyImages['05-threat-center.webp']?.src).toBeTruthy()
    expect(shift?.bodyImages['07-assessment-flow-1.webp']?.src).toBeTruthy()
  })

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
