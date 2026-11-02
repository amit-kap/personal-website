import type { ReactNode } from 'react'
import { AgentGlyph } from '../icons'

/* A titled card, with the agent's one-line read of it under the title. */
export function Panel({ title, insight, children }: { title: string; insight: string; children: ReactNode }) {
  return (
    <section className="s-card s-panel">
      <h3 className="s-panel-title">{title}</h3>
      <div className="s-chip">
        <AgentGlyph size={16} />
        <span className="s-chip-text">{insight}</span>
      </div>
      {children}
    </section>
  )
}
