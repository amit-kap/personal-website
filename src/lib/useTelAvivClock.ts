import { useEffect, useState } from 'react'

/* "Tel Aviv · HH:MM:SS" in Asia/Jerusalem, ticking every second. Renders a
   fixed placeholder until mounted so server and client markup agree. */
const PLACEHOLDER = 'Tel Aviv · --:--:--'

const formatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Jerusalem',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
})

export function formatTelAviv(date: Date): string {
  return `Tel Aviv · ${formatter.format(date)}`
}

export function useTelAvivClock(): string {
  const [label, setLabel] = useState(PLACEHOLDER)

  useEffect(() => {
    const tick = () => setLabel(formatTelAviv(new Date()))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [])

  return label
}
