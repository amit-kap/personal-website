import { Link, useLocation } from 'react-router-dom'
import ThemeToggle from '@/components/ThemeToggle'

export default function Footer() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <footer className="relative border-t border-border">
      <div className="inner-col flex flex-wrap items-center justify-between gap-4 py-6 text-meta text-muted-foreground">
        <span>© 2026 Amit Kaplinsky · Tel Aviv</span>
        <div className="flex items-center gap-6">
          {isHome && (
            <>
              <a href="mailto:amitka111@gmail.com" className="transition-colors hover:text-accent">Email</a>
              <a
                href="https://www.linkedin.com/in/amitka/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-accent"
              >
                LinkedIn
              </a>
              <Link to="/about" className="transition-colors hover:text-accent">About</Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
