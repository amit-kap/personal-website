import type { ReactNode } from 'react'
import { AgentGlyph } from '../icons'
import { useHighlighted } from '../highlight'
import { slugify } from '../slug'

/* A titled card: a header row with a divider, then the agent's one-line read
   and the content. */
export function Panel({ title, insight, action, children }: { title: string; insight: string; action?: ReactNode; children: ReactNode }) {
  const id = slugify(title)
  const lit = useHighlighted(id)
  return (
    <section className="s-card s-panel" data-widget={id} data-highlight={lit}>
      <header className="s-panel-head">
        <h3 className="s-panel-title">{title}</h3>
        {action}
      </header>
      <div className="s-panel-body">
        <div className="s-chip">
          <AgentGlyph size={16} />
          <span className="s-chip-text">{insight}</span>
        </div>
        {children}
      </div>
    </section>
  )
}
