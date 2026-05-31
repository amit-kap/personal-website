import { Link } from 'react-router-dom'

export default function Nav() {
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
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="text-[13px] font-medium text-black whitespace-nowrap">
            Amit Kaplinsky
          </span>
        </Link>
      </div>
    </nav>
  )
}
