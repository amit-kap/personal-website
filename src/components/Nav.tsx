import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Nav() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [overHero, setOverHero] = useState(isHome)

  useEffect(() => {
    if (!isHome) {
      setOverHero(false)
      return
    }
    const onScroll = () => {
      // Switch to light treatment once the hero image is mostly off-screen.
      setOverHero(window.scrollY < window.innerHeight * 0.6)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 animate-slide-down-in">
      <div className="relative 2xl:mx-auto 2xl:max-w-[1440px] h-full px-5 sm:px-8 flex items-center">
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
          <span
            className={`text-[13px] font-medium whitespace-nowrap transition-colors duration-300 ${
              overHero ? 'text-white' : 'text-black'
            }`}
          >
            Amit Kaplinsky
          </span>
        </Link>
      </div>
    </nav>
  )
}
