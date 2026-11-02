import { Bell, ChevronDown, Gear, ShiftMark } from '../icons'

const links = [
  { label: 'Home', menu: false },
  { label: 'Inventory', menu: true },
  { label: 'Findings', menu: true },
  { label: 'Assessments', menu: true },
]

/* Top bar. Static for now. */
export function Nav({ active = 'Home' }: { active?: string }) {
  return (
    <header className="s-nav">
      <div className="s-logo s-head">
        <ShiftMark size={24} />
        Shift
      </div>
      <nav className="s-nav-links" aria-label="Shift">
        {links.map((l) => (
          <span key={l.label} className="s-nav-link" data-active={l.label === active}>
            {l.label}
            {l.menu && <ChevronDown size={11} />}
          </span>
        ))}
      </nav>
      <div className="s-nav-right">
        <button type="button" className="s-icon-btn" aria-label="Notifications">
          <Bell size={15} />
        </button>
        <button type="button" className="s-icon-btn" aria-label="Settings">
          <Gear size={15} />
        </button>
        <span className="s-avatar" />
      </div>
    </header>
  )
}
