import { MemoryRouter } from 'react-router-dom'
import { cleanup, render, screen } from '@testing-library/react'
import { CV_PDF_URL } from '@/lib/cvPdf'
import Footer from './Footer'

function renderFooter() {
  return render(
    <MemoryRouter>
      <Footer />
    </MemoryRouter>,
  )
}

describe('Footer', () => {
  afterEach(cleanup)

  it('offers the contact CTA with its analytics attributes', () => {
    renderFooter()

    expect(screen.getByRole('heading', { name: /Building a new product\?\s*Let's see if it's a fit\./ })).toBeInTheDocument()
    const talk = screen.getByRole('link', { name: "Let's talk" })
    expect(talk).toHaveAttribute('href', 'mailto:amitka111@gmail.com')
    expect(talk).toHaveAttribute('data-umami-event', 'contact-email')
    expect(talk).toHaveAttribute('data-umami-event-location', 'footer')
  })

  it('offers LinkedIn and CV as icon-only links', () => {
    renderFooter()

    const linkedin = screen.getByRole('link', { name: 'LinkedIn' })
    expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/amitkaplinsky')
    expect(linkedin).toHaveTextContent('')
    const cv = screen.getByRole('link', { name: 'CV' })
    expect(cv).toHaveAttribute('href', CV_PDF_URL)
    expect(cv).toHaveTextContent('')
  })

  it('has the credits and clock at the bottom, with no agent link or switches', () => {
    renderFooter()

    expect(screen.getByText('Built using Claude Code, Devin AI')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Agent view' })).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'View mode' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /theme/i })).not.toBeInTheDocument()
  })

  it('shows the Tel Aviv clock', () => {
    renderFooter()

    expect(screen.getByText(/^Tel Aviv · \d{2}:\d{2}:\d{2}$/)).toBeInTheDocument()
  })
})
