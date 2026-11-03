import type { ReactNode } from 'react'
import { useHighlighted } from '../highlight'
import { slugify } from '../slug'

/* A small card with an uppercase label over a chart or a count. */
export function SummaryCard({ title, children }: { title: string; children: ReactNode }) {
  const id = slugify(title)
  const lit = useHighlighted(id)
  return (
    <section className="s-card s-sum" data-widget={id} data-highlight={lit}>
      <h3 className="s-sum-title">{title}</h3>
      <div className="s-sum-body">{children}</div>
    </section>
  )
}

/* A rounded count: label plus a coloured number. */
export function CountPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <span className="s-count">
      {label}
      <b style={{ color }}>{value}</b>
    </span>
  )
}
