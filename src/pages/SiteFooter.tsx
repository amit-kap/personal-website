import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bot, Moon, Sun, User } from 'lucide-react'

/* The small footer at the end of the new pages: name, local time in Tel Aviv,
   the human / agent view switch and the light / dark switch. */

/* Local time in Tel Aviv, 24-hour, with its UTC offset (GMT+2 / GMT+3 in summer), refreshed on the minute. */
const telAvivTime = () => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZoneName: 'shortOffset',
  }).formatToParts(new Date())
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('hour')}:${get('minute')} ${get('timeZoneName')}`.trim()
}

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

const DARK_QUERY = '(prefers-color-scheme: dark)'
const systemTheme = (): Theme => (window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light')

/* The theme follows the browser / system, live. A footer pick overrides it for this tab session only,
   and a later system change takes over again. */
function readTheme(): Theme {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* storage can be blocked; fall back to the system */
  }
  return systemTheme()
}

function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme)
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  useEffect(() => {
    const media = window.matchMedia(DARK_QUERY)
    const follow = () => {
      try {
        sessionStorage.removeItem(STORAGE_KEY)
      } catch {
        /* nothing to clear */
      }
      setTheme(systemTheme())
    }
    media.addEventListener('change', follow)
    return () => media.removeEventListener('change', follow)
  }, [])
  const pick = (next: Theme) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* not remembered, still applied */
    }
    setTheme(next)
  }
  return { theme, setTheme: pick }
}

export default function SiteFooter() {
  const time = useTelAvivTime()
  const { theme, setTheme } = useTheme()
  const agent = useLocation().pathname === '/agent'

  return (
    <footer className="h01-footer">
      <span>© 2026 Amit Kaplinsky</span>
      <span className="h01-grow" />
      <nav className="h01-switch" aria-label="View">
        <Link to="/" className={agent ? undefined : 'on'} aria-current={agent ? undefined : 'page'} aria-label="Human view" title="Human view">
          <User size={16} strokeWidth={1.5} aria-hidden />
        </Link>
        <Link to="/agent" className={agent ? 'on' : undefined} aria-current={agent ? 'page' : undefined} aria-label="Agent view" title="Agent view">
          <Bot size={16} strokeWidth={1.5} aria-hidden />
        </Link>
      </nav>
      <div className="h01-switch" role="group" aria-label="Theme">
        <button type="button" className={theme === 'light' ? 'on' : undefined} aria-pressed={theme === 'light'} onClick={() => setTheme('light')} aria-label="Light mode" title="Light mode">
          <Sun size={16} strokeWidth={1.5} aria-hidden />
        </button>
        <button type="button" className={theme === 'dark' ? 'on' : undefined} aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')} aria-label="Dark mode" title="Dark mode">
          <Moon size={16} strokeWidth={1.5} aria-hidden />
        </button>
      </div>
      <span>
        Tel Aviv · <time>{time}</time>
      </span>
    </footer>
  )
}
