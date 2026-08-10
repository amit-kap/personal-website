import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getCaseStudyBySlug, getWorkBySlug } from '@/lib/content'

const navItems = [
  { label: 'Work', to: '/', section: 'work' as const },
  { label: 'Writing', to: '/writing', section: 'writing' as const },
  { label: 'CV', to: '/cv', section: 'cv' as const },
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

  // Resolve breadcrumb context for work / case-study detail pages
  let workContext: { parent: string; current: string } | null = null
  let writingContext: { parent: string; current: string } | null = null

  if (location.pathname.startsWith('/work/')) {
    const slug = location.pathname.split('/work/')[1]
    const work = slug ? getWorkBySlug(slug) : undefined
    if (work) workContext = { parent: 'Work', current: work.company }
  } else if (location.pathname.startsWith('/case-studies/')) {
    const slug = location.pathname.split('/case-studies/')[1]
    const study = slug ? getCaseStudyBySlug(slug) : undefined
    if (study) writingContext = { parent: 'Writing', current: study.title }
  }

  return (
    <header className={`site-header sticky top-0 z-50 ${scrolled ? 'site-header-scrolled' : ''}`}>
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <Link to="/" className="profile-identity inline-flex items-center gap-2.5 text-body font-bold text-foreground">
          <span className="profile-avatar">
            <img
              src={`${import.meta.env.BASE_URL}profile.jpg`}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover object-center"
            />
          </span>
          <span className="profile-identity-name">AMIT KAPLINSKY</span>
        </Link>

        <nav aria-label="Primary navigation" className="absolute left-1/2 flex -translate-x-1/2 items-center gap-6 sm:gap-8">
          {navItems.map((item) => {
            const context = item.section === 'work' ? workContext : item.section === 'writing' ? writingContext : null

            if (context) {
              return (
                <span key={item.label} className="inline-flex items-center gap-0 animate-fade-in">
                  <Link
                    to={item.section === 'work' ? '/' : '/writing'}
                    className="site-nav-link text-foreground/35 hover:text-foreground/55"
                  >
                    {context.parent}
                  </Link>
                  <span className="mx-1.5 text-foreground/15" aria-hidden="true">/</span>
                  <span className="site-nav-link site-nav-link-active max-w-[120px] truncate sm:max-w-none" aria-current="page">
                    {context.current}
                  </span>
                </span>
              )
            }

            const active = item.to === '/writing'
              ? location.pathname === '/writing' || location.pathname.startsWith('/case-studies/')
              : item.to === '/cv'
                ? location.pathname === '/cv'
                : location.pathname === '/' || location.pathname.startsWith('/work/')
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`site-nav-link ${active ? 'site-nav-link-active' : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <a href="mailto:amitka111@gmail.com" className="header-contact-cta hidden md:inline-flex">
          <span>Get in touch</span>
        </a>

      </div>
    </header>
  )
}
