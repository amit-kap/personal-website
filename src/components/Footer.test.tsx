import { MemoryRouter, useNavigate } from 'react-router-dom'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import Footer from './Footer'

function RouteProbe() {
  const navigate = useNavigate()
  return <button type="button" onClick={() => navigate('/')}>Switch human</button>
}

describe('Footer', () => {
  afterEach(() => {
    cleanup()
    delete document.documentElement.dataset.theme
  })

  it('exposes the view switch without contact links', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Footer />
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation', { name: 'View mode' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Human' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Agent' })).toHaveAttribute('href', '/agent')
    expect(screen.queryByRole('link', { name: 'Email' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'LinkedIn' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument()
  })

  it('forces dark mode in Agent view', () => {
    render(
      <MemoryRouter initialEntries={['/agent']}>
        <Footer />
        <RouteProbe />
      </MemoryRouter>,
    )

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Switch human' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toHaveAttribute('aria-pressed', 'true')
  })
})
