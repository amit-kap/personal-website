import { Link, useLocation } from 'react-router-dom'
import { useTelAvivClock } from '@/lib/useTelAvivClock'

const navItems = [
  { label: 'Work', to: '/' },
  { label: 'About', to: '/about' },
]

function isActive(to: string, pathname: string): boolean {
  if (to === '/') return pathname === '/' || pathname.startsWith('/work/')
  return pathname === to
}

export default function Header() {
  const { pathname } = useLocation()
  const clock = useTelAvivClock()

  return (
    <header className="relative z-50 bg-panel-90 text-meta font-medium">
      <div className="flex items-start justify-between gap-6 p-4 sm:p-6">
        <Link to="/" className="shrink-0 text-bright">
          Amit Kaplinsky
        </Link>
        <nav aria-label="Primary navigation" className="flex items-start gap-1">
          {navItems.map((item, i) => (
            <span key={item.label} className="flex gap-1">
              {i > 0 && (
                <span aria-hidden="true" className="whitespace-pre text-dim">
                  {' ·'}
                </span>
              )}
              <Link
                to={item.to}
                aria-current={isActive(item.to, pathname) ? 'page' : undefined}
                className="text-dim transition-colors hover:text-ink-soft aria-[current=page]:text-ink-soft"
              >
                {item.label}
              </Link>
            </span>
          ))}
        </nav>
        <span className="hidden shrink-0 font-normal tabular-nums text-dim sm:block" suppressHydrationWarning>
          {clock}
        </span>
      </div>
    </header>
  )
}
