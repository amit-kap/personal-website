import { MemoryRouter } from 'react-router-dom'
import { cleanup, render, screen } from '@testing-library/react'
import Header from './Header'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Header />
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
})
