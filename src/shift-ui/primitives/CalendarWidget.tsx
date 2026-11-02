import { useState } from 'react'
import { calendar } from '../fixtures/dashboard'
import { ChevronLeft, ChevronRight } from '../icons'
import { VendorLogo } from './VendorLogo'

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const monthName = new Date(calendar.year, calendar.month, 1).toLocaleString('en-US', { month: 'long' })

/* A month view of upcoming assessments: each day with one shows the vendor's
   logo, and a clicked day is spelled out underneath. */
export function CalendarWidget() {
  const [selected, setSelected] = useState<number | null>(null)
  const first = new Date(calendar.year, calendar.month, 1)
  const daysInMonth = new Date(calendar.year, calendar.month + 1, 0).getDate()
  const lead = first.getDay()
  const cells = Math.ceil((lead + daysInMonth) / 7) * 7
  const event = calendar.events.find((e) => e.day === selected)

  return (
    <div className="s-cal">
      <div className="s-cal-head">
        <span className="s-cal-month">
          {monthName} {calendar.year}
        </span>
        <span className="s-cal-nav">
          <button type="button" className="s-icon-btn" aria-label="Previous month">
            <ChevronLeft size={14} />
          </button>
          <button type="button" className="s-icon-btn" aria-label="Next month">
            <ChevronRight size={14} />
          </button>
        </span>
      </div>
      <div className="s-cal-grid">
        {weekdays.map((d, i) => (
          <span key={i} className="s-cal-dow">
            {d}
          </span>
        ))}
        {Array.from({ length: cells }, (_, i) => {
          const day = i - lead + 1
          const inMonth = day >= 1 && day <= daysInMonth
          const ev = inMonth ? calendar.events.find((e) => e.day === day) : undefined
          const label = inMonth ? day : day < 1 ? new Date(calendar.year, calendar.month, day).getDate() : day - daysInMonth
          return (
            <button
              key={i}
              type="button"
              className="s-cal-day"
              data-out={!inMonth}
              data-event={!!ev}
              data-selected={ev && ev.day === selected}
              disabled={!ev}
              onClick={() => ev && setSelected(selected === ev.day ? null : ev.day)}
              aria-label={ev ? `${monthName} ${day}: ${ev.vendor}, ${ev.label}` : undefined}
            >
              {label}
              {ev && <VendorLogo name={ev.vendor} size={12} />}
            </button>
          )
        })}
      </div>
      {event && (
        <div className="s-cal-detail" data-kind={event.kind}>
          <VendorLogo name={event.vendor} size={14} />
          <b>{event.vendor}</b>
          <span>
            {event.label} · {monthName.slice(0, 3)} {event.day}
          </span>
        </div>
      )}
    </div>
  )
}
