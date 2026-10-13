import { useTheme } from '@amit-kap/glaze/theme'
import { ToggleGroup, ToggleGroupItem } from '@amit-kap/glaze/components/toggle-group'

type Theme = 'light' | 'dark'

function SunIcon() {
  return (
    <svg className="size-[13px]" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="8" cy="8" r="3.2" />
      <path d="M8 1.2v1.6M8 13.2v1.6M1.2 8h1.6M13.2 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="size-[13px]" width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M13.5 9.8A6 6 0 1 1 6.2 2.5a4.9 4.9 0 0 0 7.3 7.3z" />
    </svg>
  )
}

export default function ThemeToggle() {
  const { resolvedMode, setMode } = useTheme()

  const segment = (value: Theme, label: string, icon: React.ReactNode) => (
    <ToggleGroupItem
      value={value}
      aria-label={label}
      className="h-[26px] min-w-0 w-[26px] rounded-full p-0 text-muted-foreground hover:bg-transparent hover:text-foreground aria-pressed:bg-secondary aria-pressed:text-foreground aria-pressed:hover:bg-secondary data-[state=on]:bg-secondary"
    >
      {icon}
    </ToggleGroupItem>
  )

  return (
    <ToggleGroup
      value={[resolvedMode]}
      // A pressed segment can't be switched off: pressing it again is a no-op.
      onValueChange={(next) => next[0] && setMode(next[0] as Theme)}
      aria-label="Colour theme"
      className="gap-[3px] rounded-full border border-border p-[3px]"
    >
      {segment('light', 'Switch to light theme', <SunIcon />)}
      {segment('dark', 'Switch to dark theme', <MoonIcon />)}
    </ToggleGroup>
  )
}
