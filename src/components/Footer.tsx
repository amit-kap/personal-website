import { useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '@amit-kap/glaze/theme'
import ThemeToggle from '@/components/ThemeToggle'

export default function Footer() {
  const { pathname } = useLocation()
  const isAgent = pathname === '/agent'
  const wasAgent = useRef(false)
  const { setMode } = useTheme()
  // setMode changes identity with every theme update; the route change alone
  // should drive the effect, so a manual toggle on /agent is not overridden.
  const setModeRef = useRef(setMode)
  useEffect(() => {
    setModeRef.current = setMode
  }, [setMode])

  useEffect(() => {
    const nextMode = isAgent ? 'dark' : wasAgent.current ? 'light' : null
    wasAgent.current = isAgent
    if (nextMode) setModeRef.current(nextMode)
  }, [isAgent])

  const segment = (to: string, label: string, active: boolean) => (
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`inline-flex h-[26px] items-center justify-center rounded-full px-3 transition-colors ${
        active ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <footer className="relative border-t border-border">
      <div className="inner-col flex flex-wrap items-center justify-between gap-4 py-6 text-meta text-muted-foreground">
        <span>© 2026 Amit Kaplinsky · Tel Aviv</span>
        <div className="ml-auto flex items-center gap-4">
          <nav className="flex items-center gap-[3px] rounded-full border border-border p-[3px] text-caption" aria-label="View mode">
            {segment('/', 'Human', !isAgent)}
            {segment('/agent', 'Agent', isAgent)}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
