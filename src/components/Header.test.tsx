import { MemoryRouter, useLocation } from 'react-router-dom'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import Header from './Header'

function Where() {
  return <output data-testid="where">{useLocation().pathname}</output>
}

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
      <Where />
    </MemoryRouter>,
  )
}

describe('Header', () => {
  afterEach(cleanup)

  it('links the name home and offers Work and About', () => {
    renderAt('/')

    expect(screen.getByRole('link', { name: 'Amit Kaplinsky' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/about')
  })

  it('marks the current section', () => {
    renderAt('/about')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Work' })).not.toHaveAttribute('aria-current')

    cleanup()
    renderAt('/work/shift')
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('aria-current', 'page')
  })

  it('switches between the human and agent views', () => {
    renderAt('/')
    expect(screen.getByRole('switch', { name: 'Agent view' })).not.toBeChecked()

    cleanup()
    renderAt('/agent')
    expect(screen.getByRole('switch', { name: 'Agent view' })).toBeChecked()
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).not.toBeInTheDocument()
  })

  it('navigates to /agent when the switch is turned on, and back to / when turned off', () => {
    renderAt('/about')
    const toggle = screen.getByRole('switch', { name: 'Agent view' })

    fireEvent.click(toggle)
    expect(screen.getByTestId('where')).toHaveTextContent('/agent')
    expect(screen.getByRole('switch', { name: 'Agent view' })).toBeChecked()
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('switch', { name: 'Agent view' }))
    expect(screen.getByTestId('where')).toHaveTextContent(/^\/$/)
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeInTheDocument()
  })

  it('keeps the name link on the agent view and marks nothing current elsewhere', () => {
    renderAt('/agent')
    expect(screen.getByRole('link', { name: 'Amit Kaplinsky' })).toHaveAttribute('href', '/')

    cleanup()
    renderAt('/blog')
    expect(screen.getByRole('link', { name: 'Work' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'About' })).not.toHaveAttribute('aria-current')
  })
})
