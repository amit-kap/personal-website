import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import RecentWork from './RecentWork'
import { getAllWorks } from '@/lib/content'

describe('RecentWork', () => {
  it('renders the top 3 works with product titles linking to their work pages', () => {
    const top3 = getAllWorks().slice(0, 3)
    expect(top3).toHaveLength(3)

    render(
      <MemoryRouter>
        <RecentWork />
      </MemoryRouter>,
    )

    for (const work of top3) {
      const link = screen.getByRole('link', { name: new RegExp(work.productTitle, 'i') })
      expect(link).toHaveAttribute('href', `/work/${work.slug}`)
    }
  })

  it('renders the section label', () => {
    render(
      <MemoryRouter>
        <RecentWork />
      </MemoryRouter>,
    )
    expect(screen.getByText(/recent work/i)).toBeInTheDocument()
  })
})
