import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Work', to: '/#work' },
  { label: 'Writing', to: '/writing' },
  { label: 'CV', to: '/cv' },
]

export default function Header() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const updateScrolledState = () => setScrolled(window.scrollY > 12)
    updateScrolledState()
    window.addEventListener('scroll', updateScrolledState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrolledState)
  }, [])

  return (
    <header className={`site-header sticky top-0 z-50 ${scrolled ? 'site-header-scrolled' : ''}`}>
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <Link to="/" className="text-meta font-bold tracking-[0.02em] text-foreground">
          AMIT KAPLINSKY
        </Link>

        <nav aria-label="Primary navigation" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-6 sm:gap-8">
          {navItems.map((item) => {
            const active = item.to === '/writing'
              ? location.pathname === '/writing' || location.pathname.startsWith('/case-studies/')
              : item.to === '/cv'
                ? location.pathname === '/cv'
                : location.pathname === '/'
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`site-nav-link text-meta ${active ? 'site-nav-link-active' : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <a href="mailto:amitka111@gmail.com" className="header-contact-cta hidden md:inline-flex">
          <span>Get in touch</span>
          <span aria-hidden="true">↗</span>
        </a>

      </div>
    </header>
  )
}
