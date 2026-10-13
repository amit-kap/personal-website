import { MemoryRouter, useNavigate } from 'react-router-dom'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ThemeProvider } from '@amit-kap/glaze/theme'
import { THEME_OPTIONS } from '@/theme/options'
import Footer from './Footer'

function RouteProbe() {
  const navigate = useNavigate()
  return <button type="button" onClick={() => navigate('/')}>Switch human</button>
}

function renderAt(path: string, extra?: React.ReactNode) {
  return render(
    <ThemeProvider {...THEME_OPTIONS}>
      <MemoryRouter initialEntries={[path]}>
        <Footer />
        {extra}
      </MemoryRouter>
    </ThemeProvider>,
  )
}

const isDark = () => document.documentElement.classList.contains('dark')

describe('Footer', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
  })

  it('exposes the view switch without contact links', () => {
    renderAt('/')

    expect(screen.getByRole('navigation', { name: 'View mode' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Human' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Agent' })).toHaveAttribute('href', '/agent')
    expect(screen.queryByRole('link', { name: 'Email' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'LinkedIn' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'About' })).not.toBeInTheDocument()
  })

  it('forces dark mode in Agent view', () => {
    renderAt('/agent', <RouteProbe />)

    expect(isDark()).toBe(true)
    expect(screen.getByRole('button', { name: 'Switch to dark theme' })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(screen.getByRole('button', { name: 'Switch human' }))
    expect(isDark()).toBe(false)
    expect(screen.getByRole('button', { name: 'Switch to light theme' })).toHaveAttribute('aria-pressed', 'true')
  })
})
