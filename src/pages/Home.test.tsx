import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { getAllWorks } from '@/lib/content'
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

  it('renders the hero exactly as designed, with no call to action', () => {
    render(<Home />, { wrapper: MemoryRouter })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Senior\s*Product Designer/)
    expect(screen.getByText('Available for new projects')).toBeInTheDocument()
    expect(
      screen.getByText('Founding designer at Shift and Veriti. Twelve years designing security products, from Check Point to AI-native startups.'),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /let's talk/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /mailto/i })).not.toBeInTheDocument()
  })

  it('features Shift and links it to its case study', () => {
    render(<Home />, { wrapper: MemoryRouter })

    expect(screen.getByRole('link', { name: /shift.*case study/i })).toHaveAttribute('href', '/work/shift')
  })

  it('links the four recent works with their outcome', () => {
    render(<Home />, { wrapper: MemoryRouter })

    const slugs = ['onyxia-cyber', 'veriti', 'semperis', 'checkpoint']
    for (const slug of slugs) {
      const work = getAllWorks().find((w) => w.slug === slug)
      expect(work).toBeDefined()
      const company = work!.company.replace(/ Software$/, '')
      expect(screen.getByRole('link', { name: new RegExp(`^${company} case study:`, 'i') }))
        .toHaveAttribute('href', `/work/${slug}`)
    }
  })

  it('teases Work with me and links to its page, without the founder pitch', () => {
    render(<Home />, { wrapper: MemoryRouter })

    expect(screen.getByRole('heading', { level: 2, name: 'Work with me' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /work with me: see how i help founders/i })).toHaveAttribute('href', '/work-with-me')
    expect(screen.queryByText('Sound familiar?')).not.toBeInTheDocument()
    expect(screen.queryByText('How I can help')).not.toBeInTheDocument()
  })
})
