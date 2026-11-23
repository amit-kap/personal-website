import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bot, Moon, Sun, User } from 'lucide-react'

/* The small footer at the end of the new pages: name, local time in Tel Aviv,
   the human / agent view switch and the light / dark toggle. */

/* Local time in Tel Aviv, 24-hour, refreshed on the minute. */
const telAvivTime = () =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', hour12: false }).format(
    new Date(),
  )

function useTelAvivTime() {
  const [time, setTime] = useState(telAvivTime)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      setTime(telAvivTime())
      timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50)
    }
    timer = setTimeout(tick, 60000 - (Date.now() % 60000) + 50)
    return () => clearTimeout(timer)
  }, [])
  return time
}

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'theme'

/* The theme follows the system until the visitor picks one; the pick is remembered in this browser. */
function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* storage can be blocked; fall back to the system */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* not remembered, still applied */
    }
    setTheme(next)
  }
  return { theme, toggle }
}

export default function SiteFooter() {
  const time = useTelAvivTime()
  const { theme, toggle } = useTheme()
  const agent = useLocation().pathname === '/agent'

  return (
    <footer className="h01-footer">
      <span>© 2026 Amit Kaplinsky</span>
      <span>
        Tel Aviv <time>{time}</time>
      </span>
      <span className="h01-grow" />
      <nav className="h01-switch" aria-label="View">
        <Link to="/" className={agent ? undefined : 'on'} aria-current={agent ? undefined : 'page'} aria-label="Human view" title="Human view">
          <User size={16} strokeWidth={1.75} aria-hidden />
        </Link>
        <Link to="/agent" className={agent ? 'on' : undefined} aria-current={agent ? 'page' : undefined} aria-label="Agent view" title="Agent view">
          <Bot size={16} strokeWidth={1.75} aria-hidden />
        </Link>
      </nav>
      <button
        type="button"
        className="h01-theme"
        onClick={toggle}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
      >
        {theme === 'dark' ? <Sun size={16} strokeWidth={1.75} aria-hidden /> : <Moon size={16} strokeWidth={1.75} aria-hidden />}
      </button>
    </footer>
  )
}
