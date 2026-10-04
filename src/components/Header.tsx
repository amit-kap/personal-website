import { Link, useLocation } from 'react-router-dom'
import RollingText from '@/components/RollingText'

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
]

function isActive(to: string, pathname: string): boolean {
  if (to === '/') return pathname === '/' || pathname.startsWith('/work/')
  if (to === '/blog') return pathname === '/blog' || pathname.startsWith('/case-studies/')
  return pathname === to
}

export default function Header() {
  const { pathname } = useLocation()

  return (
    <header data-print-hide className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-6">
      <div className="nav-pill nav-drop pointer-events-auto">
        <Link to="/" aria-label="Amit Kaplinsky, home">
          <img
            src={`${import.meta.env.BASE_URL}profile.jpg`}
            alt=""
            className="block h-[34px] w-[34px] rounded-full object-cover object-top"
          />
        </Link>
        <nav aria-label="Primary navigation" className="flex items-center gap-[2px]">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="nav-pill-link roll-host"
              aria-current={isActive(item.to, pathname) ? 'page' : undefined}
            >
              <RollingText text={item.label} />
            </Link>
          ))}
        </nav>
        <a href="mailto:amitka111@gmail.com" data-umami-event="contact-email" data-umami-event-location="header" className="pill-cta roll-host px-[18px] py-2 text-[13.5px]">
          <RollingText text="Let's Talk" />
        </a>
      </div>
    </header>
  )
}
