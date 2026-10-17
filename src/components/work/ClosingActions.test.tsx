import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ClosingActions } from './ClosingActions'

describe('ClosingActions', () => {
  it('offers only a link back home by default', () => {
    render(<ClosingActions />, { wrapper: MemoryRouter })

    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveAccessibleName('Back to home')
    expect(links[0]).toHaveAttribute('href', '/')
  })

  it('adds the related-writing link, after Back to home', () => {
    render(<ClosingActions read={{ to: '/case-studies/x', label: 'Read: X' }} />, { wrapper: MemoryRouter })

    const links = screen.getAllByRole('link')
    expect(links.map((l) => l.getAttribute('href'))).toEqual(['/', '/case-studies/x'])
    expect(screen.getByRole('link', { name: 'Read: X' })).toBeInTheDocument()
  })

  it('renders reveal buttons as real anchors, not buttons', () => {
    render(<ClosingActions read={{ to: '/a', label: 'Read: A' }} />, { wrapper: MemoryRouter })

    expect(screen.queryAllByRole('button')).toHaveLength(0)
    for (const link of screen.getAllByRole('link')) expect(link.tagName).toBe('A')
  })

  it('takes a custom back link', () => {
    render(<ClosingActions back={{ to: '/work/shift', label: 'Back to Shift' }} />, { wrapper: MemoryRouter })

    expect(screen.getByRole('link', { name: 'Back to Shift' })).toHaveAttribute('href', '/work/shift')
  })
})
