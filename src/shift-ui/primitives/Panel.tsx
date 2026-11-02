import type { ReactNode } from 'react'
import { AgentGlyph } from '../icons'
import { useHighlighted } from '../highlight'
import { slugify } from '../slug'

/* A titled card, with the agent's one-line read of it under the title. */
export function Panel({ title, insight, children }: { title: string; insight: string; children: ReactNode }) {
  const id = slugify(title)
  const lit = useHighlighted(id)
  return (
    <section className="s-card s-panel" data-widget={id} data-highlight={lit}>
      <h3 className="s-panel-title">{title}</h3>
      <div className="s-chip">
        <AgentGlyph size={16} />
        <span className="s-chip-text">{insight}</span>
      </div>
      {children}
    </section>
  )
}
