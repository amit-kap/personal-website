import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="3.2" />
      <path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M13.5 9.8A6 6 0 1 1 6.2 2.5a4.9 4.9 0 0 0 7.3 7.3z" />
    </svg>
  )
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(currentTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      /* Storage unavailable; theme still applies for this visit. */
    }
  }, [theme])

  useEffect(() => {
    const syncTheme = () => setTheme(currentTheme())
    window.addEventListener('themechange', syncTheme)
    return () => window.removeEventListener('themechange', syncTheme)
  }, [])

  const segment = (value: Theme, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      aria-label={label}
      aria-pressed={theme === value}
      onClick={() => setTheme(value)}
      className={`inline-flex h-[26px] w-[26px] items-center justify-center rounded-full transition-colors ${
        theme === value ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
    </button>
  )

  return (
    <div className="flex items-center gap-[3px] rounded-full border border-border p-[3px]">
      {segment('light', 'Switch to light theme', <SunIcon />)}
      {segment('dark', 'Switch to dark theme', <MoonIcon />)}
    </div>
  )
}
