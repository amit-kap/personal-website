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
    renderFooter('/work-with-me')

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

    expect(screen.getByText(/^I\s*Claude$/)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'love' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Agent view' })).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'View mode' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /theme/i })).not.toBeInTheDocument()
  })

  it('shows the Tel Aviv clock', () => {
    renderFooter()

    expect(screen.getByText(/^Tel Aviv · \d{2}:\d{2}:\d{2}$/)).toBeInTheDocument()
  })

  it('offers exactly four reveal links with their names, targets and analytics events', () => {
    renderFooter('/work-with-me')
    // The contact links, apart from the footer navigation.
    const nav = screen.getByRole('navigation', { name: 'Footer navigation' })
    const links = within(screen.getByRole('contentinfo')).getAllByRole('link').filter((l) => !nav.contains(l))
    expect(links).toHaveLength(4)

    const [talk, linkedin, github, cv] = ['Let\'s talk', 'View profile', 'View GitHub', 'Download CV'].map((name) => screen.getByRole('link', { name }))
    expect(links).toEqual([talk, linkedin, github, cv])
    expect(github).toHaveAttribute('href', 'https://github.com/amit-kap')
    expect(github).toHaveAttribute('rel', 'noopener noreferrer')
    expect(github).toHaveAttribute('data-umami-event', 'contact-github')

    expect(talk).not.toHaveAttribute('target')
    expect(linkedin).toHaveAttribute('rel', 'noopener noreferrer')
    expect(linkedin).toHaveAttribute('data-umami-event', 'contact-linkedin')
    expect(cv).toHaveAttribute('data-umami-event', 'download-cv')
    expect(cv).toHaveAttribute('download', CV_PDF_NAME)
    expect(cv).not.toHaveAttribute('target')
  })

  it('leaves extra room for the package circle on Work with me only', () => {
    const { container, unmount } = renderFooter('/work-with-me')
    expect(container.querySelector('.bg-primary\\/90')).toHaveClass('pt-30')
    expect(container.querySelector('.bg-primary\\/90')).not.toHaveClass('pt-20')
    unmount()

    const other = renderFooter('/')
    expect(other.container.querySelector('.bg-primary\\/90')).toHaveClass('pt-20')
    expect(other.container.querySelector('.bg-primary\\/90')).not.toHaveClass('pt-30')
  })

  it('pitches founders on Work with me', () => {
    renderFooter('/work-with-me')

    expect(screen.getByRole('heading', { name: /Building a new product\?\s*Let's see if it's a fit\./ })).toBeInTheDocument()
  })

  it('invites plainly elsewhere', () => {
    renderFooter('/about')

    expect(screen.getByRole('heading', { name: /Bring me the\s*complicated one\./ })).toBeInTheDocument()
    expect(screen.getByText('Email, LinkedIn, GitHub or my CV below.')).toBeInTheDocument()
  })

  it('links every page in one row, marking the current one', () => {
    renderFooter('/work-with-me')

    const nav = screen.getByRole('navigation', { name: 'Footer navigation' })
    const links = within(nav).getAllByRole('link')
    expect(links.map((l) => [l.textContent, l.getAttribute('href')])).toEqual([
      ['Home', '/'],
      ['Work with me', '/work-with-me'],
      ['About', '/about'],
    ])
    expect(within(nav).getByRole('link', { name: 'Work with me' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })
})
