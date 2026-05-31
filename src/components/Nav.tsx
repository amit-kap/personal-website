import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const location = useLocation()
  // Pages with a full-bleed dark hero at the top
  const hasHero =
    location.pathname === '/' || location.pathname.startsWith('/work/')
  const [overHero, setOverHero] = useState(hasHero)
  const [hidden, setHidden] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    if (!hasHero) setOverHero(false)

    const onScroll = () => {
      const y = window.scrollY
      const diff = y - lastScrollY.current

      // Auto-hide on scroll down, reveal on scroll up
      if (y < 60) {
        setHidden(false)
      } else if (diff > 6) {
        setHidden(true)
      } else if (diff < -6) {
        setHidden(false)
      }

      // Over-hero state — white treatment while hero is in view
      if (hasHero) {
        setOverHero(y < window.innerHeight * 0.6)
      }

      lastScrollY.current = y
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [hasHero])

  const navTextClass = overHero ? 'text-white' : 'text-black'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-14 animate-slide-down-in transition-transform duration-300 ease-out ${
        hidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="relative 2xl:mx-auto 2xl:max-w-[1440px] h-full px-5 sm:px-8 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-3 hover:opacity-70 transition-opacity"
          aria-label="Home"
        >
          <img
            src={`${import.meta.env.BASE_URL}profile.jpg`}
            alt="Amit Kaplinsky"
            className={`h-8 w-8 rounded-full object-cover transition-shadow duration-300 ${
              overHero ? 'ring-1 ring-white/40' : ''
            }`}
          />
          <div className="flex flex-col leading-[1.15]">
            <span
              className={`text-[13px] font-medium whitespace-nowrap transition-colors duration-300 ${navTextClass}`}
            >
              Amit Kaplinsky
            </span>
            <span
              className={`text-[11.5px] whitespace-nowrap transition-colors duration-300 ${
                overHero ? 'text-white/70' : 'text-black/55'
              }`}
            >
              Product Designer. AI Builder.
            </span>
          </div>
        </Link>

        <a
          href="mailto:amitka111@gmail.com"
          className={`text-[12px] px-4 py-2 rounded-full border transition-colors duration-300 ${
            overHero
              ? 'border-white/45 text-white hover:bg-white hover:text-black hover:border-white'
              : 'border-transparent bg-black text-white hover:bg-black/75'
          }`}
        >
          Contact
        </a>
      </div>
    </nav>
  )
}
