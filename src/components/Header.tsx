/* Sticky site header: name, Home / About nav, and the human / agent view switch. */
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IconSwitch } from '@amit-kap/glaze/components/icon-switch'
import { headerNav, isActive } from '@/components/siteNav'

/* Paper's 18px user and bot icons for the human / agent switch. */
function HumanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="6" r="2.222" />
      <path d="M15 15.75a6 6 0 0 0-12 0" />
    </svg>
  )
}

function AgentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 6V3H6" />
      <rect width="12" height="9" x="3" y="6" rx="2" />
      <path d="M1.5 10.5h1.5" />
      <path d="M15 10.5h1.5" />
      <path d="M11.25 9.75v1.5" />
      <path d="M6.75 9.75v1.5" />
    </svg>
  )
}

/* Glaze's IconSwitch, set to Paper: item radius instead of a pill, a 4px gap
   between the cells (so the thumb travels 28px), and a primary-hover thumb. */
const viewSwitchClass =
  'h-auto gap-1 rounded-item [&>[data-slot=icon-switch-thumb]]:rounded-item [&>[data-slot=icon-switch-thumb]]:bg-primary-hover [&>[data-slot=icon-switch-thumb][data-checked]]:translate-x-7'

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const agent = pathname === '/agent'

  return (
    /* Stays pinned to the top of the 960px column while the page scrolls.
       Its row lines up with the sections' content: 16px gutter, 800px wide. */
    <header className="sticky top-0 z-50 flex justify-center bg-card/90 px-4 text-meta font-medium">
      <div className="flex w-full max-w-[800px] items-center justify-between gap-6 py-4 sm:py-6">
        <Link to="/" className="shrink-0 text-foreground">
          Amit Kaplinsky
        </Link>
        {/* The agent view is plain text; Home and About belong to the human view. */}
        {!agent && (
          <nav aria-label="Primary navigation" className="flex items-start gap-1">
            {headerNav.map((item, i) => (
              <span key={item.label} className="flex gap-1">
                {i > 0 && (
                  <span aria-hidden="true" className="whitespace-pre text-dim">
                    {' ·'}
                  </span>
                )}
                <Link
                  to={item.to}
                  aria-current={isActive(item.to, pathname) ? 'page' : undefined}
                  className="text-dim transition-colors hover:text-secondary-foreground aria-[current=page]:text-primary"
                >
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
        )}
        <IconSwitch
          aria-label="Agent view"
          checked={agent}
          onCheckedChange={(checked) => navigate(checked ? '/agent' : '/')}
          icon={<HumanIcon />}
          checkedIcon={<AgentIcon />}
          className={viewSwitchClass}
        />
      </div>
    </header>
  )
}
