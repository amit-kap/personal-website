import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const links = [
  { to: '/', label: 'Work' },
  { to: '/about', label: 'About' },
  { to: '/playground', label: 'Playground' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isWorkActive = location.pathname === '/' || location.pathname.startsWith('/experience/')

  const activeIndex = links.findIndex(({ to }) =>
    to === '/' ? isWorkActive : location.pathname.startsWith(to)
  )

  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [pill, setPill] = useState({ left: 0, width: 0 })
  const initialized = useRef(false)

  // Snap to position before first paint — no transition flash on load
  useLayoutEffect(() => {
    if (initialized.current) return
    const el = itemRefs.current[activeIndex]
    if (el) {
      setPill({ left: el.offsetLeft, width: el.offsetWidth })
      initialized.current = true
    }
  })

  // Animate on route change — runs after paint so CSS transition fires in both directions
  useEffect(() => {
    if (!initialized.current) return
    const el = itemRefs.current[activeIndex]
    if (el) setPill({ left: el.offsetLeft, width: el.offsetWidth })
  }, [activeIndex])

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 h-14">
        {/* Desktop: pill container */}
        <div className="hidden md:flex items-center bg-neutral-100 rounded-full px-1 py-1 relative">
          {/* Sliding indicator */}
          <div
            className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm transition-all duration-200 ease-out pointer-events-none"
            style={{ left: pill.left, width: pill.width }}
          />
          {links.map(({ to, label }, i) => {
            const active = to === '/' ? isWorkActive : location.pathname.startsWith(to)
            return (
              <div key={to} ref={el => { itemRefs.current[i] = el }} className="relative z-10">
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={() =>
                    `text-[13px] px-3.5 py-1.5 rounded-full transition-colors duration-200 block ${
                      active ? 'text-black' : 'text-black/45 hover:text-black'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </div>
            )
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] py-2 pr-2"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
        >
          <span className="block w-5 h-px bg-black/70" />
          <span className="block w-5 h-px bg-black/70" />
          <span className="block w-5 h-px bg-black/70" />
        </button>

        {/* Desktop: Contact button */}
        <a
          href="mailto:amitka111@gmail.com"
          className="hidden md:flex items-center px-4 py-2 bg-black text-white text-[12px] rounded-full hover:bg-black/75 transition-colors duration-200"
        >
          Contact
        </a>

        {/* Mobile: Contact link */}
        <a
          href="mailto:amitka111@gmail.com"
          className="md:hidden px-4 py-1.5 bg-black text-white text-[12px] rounded-full"
        >
          Contact
        </a>
      </nav>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-white animate-fade-in flex flex-col px-6 pt-12 pb-10">
          <button
            className="absolute top-4 right-5 text-black/40 hover:text-black transition-colors p-1"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <line x1="1" y1="1" x2="15" y2="15" stroke="currentColor" strokeWidth="1.5" />
              <line x1="15" y1="1" x2="1" y2="15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <div className="flex flex-col gap-7 mt-6">
            {links.map(({ to, label }) => {
              const active = to === '/' ? isWorkActive : location.pathname.startsWith(to)
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setOpen(false)}
                  className={() =>
                    `text-[2.5rem] font-light tracking-tight leading-none transition-colors ${
                      active ? 'text-black' : 'text-black/25 hover:text-black'
                    }`
                  }
                >
                  {label}
                </NavLink>
              )
            })}
          </div>
          <div className="mt-auto">
            <a href="mailto:amitka111@gmail.com" className="text-[13px] text-black/35">
              amitka111@gmail.com
            </a>
          </div>
        </div>
      )}
    </>
  )
}
