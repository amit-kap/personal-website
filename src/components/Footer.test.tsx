import { MemoryRouter } from 'react-router-dom'
import { cleanup, render, screen, within } from '@testing-library/react'
import { CV_PDF_NAME, CV_PDF_URL } from '@/lib/cvPdf'
import Footer from './Footer'

function renderFooter(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
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

  it('offers LinkedIn and CV as links named by their revealed labels', () => {
    renderFooter()

    const linkedin = screen.getByRole('link', { name: 'View profile' })
    expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/amitkaplinsky')
    expect(linkedin).toHaveAttribute('target', '_blank')
    const cv = screen.getByRole('link', { name: 'Download CV' })
    expect(cv).toHaveAttribute('href', CV_PDF_URL)
    expect(cv).toHaveAttribute('download')
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

  it('offers exactly three reveal links with their names, targets and analytics events', () => {
    renderFooter()
    const links = within(screen.getByRole('contentinfo')).getAllByRole('link')
    expect(links.map((l) => l.getAttribute('aria-label') ?? l.textContent)).toHaveLength(3)

    const [talk, linkedin, cv] = ['Let\'s talk', 'View profile', 'Download CV'].map((name) => screen.getByRole('link', { name }))
    expect(links).toEqual([talk, linkedin, cv])

    expect(talk).not.toHaveAttribute('target')
    expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer')
    expect(linkedin).toHaveAttribute('data-umami-event', 'contact-linkedin')
    expect(cv).toHaveAttribute('data-umami-event', 'download-cv')
    expect(cv).toHaveAttribute('download', CV_PDF_NAME)
    expect(cv).not.toHaveAttribute('target')
  })

  it('leaves extra room for the package circle on the home page only', () => {
    const { container, unmount } = renderFooter('/')
    expect(container.querySelector('.bg-primary\\/90')).toHaveClass('pt-30')
    expect(container.querySelector('.bg-primary\\/90')).not.toHaveClass('pt-20')
    unmount()

    const other = renderFooter('/about')
    expect(other.container.querySelector('.bg-primary\\/90')).toHaveClass('pt-20')
    expect(other.container.querySelector('.bg-primary\\/90')).not.toHaveClass('pt-30')
  })
})
