import { useEffect, useRef, useState, type ReactNode } from 'react'
import { dashboardAsk, type AskScript } from '../fixtures/ask'
import { HighlightContext } from '../highlight'
import { AskFab } from '../primitives/AskFab'
import { AskShift } from '../primitives/AskShift'
import { Nav } from '../primitives/Nav'

/* The Shift app shell: the nav stays put, the page scrolls in its own column,
   and Ask Shift pushes in beside it from a floating button. Every screen sits
   inside this, so the nav, the panel and the highlighting behave the same. */
export function ShiftFrame({ active, script = dashboardAsk, children }: { active: string; script?: AskScript; children: ReactNode }) {
  const [askOpen, setAskOpen] = useState(false)
  const [askWidth, setAskWidth] = useState(360)
  const [dragging, setDragging] = useState(false)
  const [lit, setLit] = useState<{ ids: string[]; scroll: boolean }>({ ids: [], scroll: false })
  const main = useRef<HTMLDivElement>(null)

  /* Closing the panel clears the highlight. */
  const toggleAsk = () => {
    if (askOpen) setLit({ ids: [], scroll: false })
    setAskOpen(!askOpen)
  }

  /* Bring the first highlighted widget into view, clear of the floating button. */
  useEffect(() => {
    const m = main.current
    if (!m || !lit.scroll || lit.ids.length === 0) return
    const el = lit.ids.map((id) => m.querySelector<HTMLElement>(`[data-widget="${id}"]`)).find(Boolean)
    if (!el) return
    /* The screen may be scaled down on the work page; work in its own pixels. */
    const box = m.getBoundingClientRect()
    const k = box.width / m.offsetWidth || 1
    const r = el.getBoundingClientRect()
    const top = (r.top - box.top) / k
    const bottom = (r.bottom - box.top) / k
    const height = box.height / k
    if (top >= 8 && bottom <= height - 90) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    m.scrollTo({ top: m.scrollTop + top - Math.max(16, (height - (bottom - top)) / 2 - 30), behavior: reduce ? 'auto' : 'smooth' })
  }, [lit])
  return (
    <>
      <Nav active={active} />
      <div
        className="s-body"
        data-dragging={dragging}
        data-ask={askOpen}
        style={{ '--s-ask-w': `${askWidth}px` } as React.CSSProperties}
        onKeyDown={(e) => e.key === 'Escape' && askOpen && toggleAsk()}>
        <div className="s-main-wrap">
          <div ref={main} className="s-main" data-lenis-prevent>
            <HighlightContext value={lit.ids}>{children}</HighlightContext>
          </div>
          <AskFab open={askOpen} onToggle={toggleAsk} />
        </div>
        <AskShift open={askOpen} script={script} onClose={toggleAsk} width={askWidth} onWidth={setAskWidth} onDragging={setDragging} onHighlight={(ids, scroll) => setLit({ ids, scroll })} />
      </div>
    </>
  )
}
