import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { label: 'Work', to: '/#work' },
  { label: 'Writing', to: '/writing' },
  { label: 'CV', to: '/cv' },
]

export default function Header() {
  const location = useLocation()

  return (
    <header className="relative z-30 border-b border-foreground/10 bg-background">
      <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8">
        <Link to="/" className="text-meta font-bold tracking-[-0.05em] text-foreground">
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
                className={`text-meta transition-opacity hover:opacity-55 ${active ? 'font-semibold' : 'font-medium'}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <p className="hidden text-caption font-semibold uppercase tracking-[0.12em] text-foreground md:block">
          Product Designer · AI Builder
        </p>
      </div>
    </header>
  )
}
