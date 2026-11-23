import { useEffect, useRef, useState, type ReactNode } from 'react'
import { dashboardAsk, type AskScript } from '../fixtures/ask'
import { HighlightContext } from '../highlight'
import { AskFab } from '../primitives/AskFab'
import { AskShift } from '../primitives/AskShift'
import { Nav } from '../primitives/Nav'
import type { AskMode } from '../primitives/AskShift'

/* The floating Ask Shift window sits this far above the bottom edge (over the
   button) and is this wide and tall; the styles use the same numbers. */
const FLOAT_BOTTOM = 80
const FLOAT_W = 546
const FLOAT_H = 480

/* The Shift app shell: the nav stays put, the page scrolls in its own column,
   and Ask Shift pushes in beside it from a floating button. Every screen sits
   inside this, so the nav, the panel and the highlighting behave the same. */
export function ShiftFrame({ active, script = dashboardAsk, children }: { active: string; script?: AskScript; children: ReactNode }) {
  /* Closed, a floating window above the button, or docked as a side panel. The
     last way it was open is how the button opens it next. */
  const [mode, setMode] = useState<AskMode>('closed')
  const [preferred, setPreferred] = useState<'float' | 'docked'>('float')
  const [exiting, setExiting] = useState(false)
  const askOpen = mode !== 'closed'
  const [askWidth, setAskWidth] = useState(420)
  const [dragging, setDragging] = useState(false)
  const [lit, setLit] = useState<{ ids: string[]; scroll: boolean }>({ ids: [], scroll: false })
  const main = useRef<HTMLDivElement>(null)

  /* Closing clears the highlight. A floating window fades out first. */
  const closeAsk = () => {
    if (mode === 'float') {
      setExiting(true)
      window.setTimeout(() => setExiting(false), 200)
    }
    setLit({ ids: [], scroll: false })
    setMode('closed')
  }
  const toggleAsk = () => (askOpen ? closeAsk() : setMode(preferred))
  const dock = () => {
    const next = mode === 'docked' ? 'float' : 'docked'
    setMode(next)
    setPreferred(next)
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
    /* A floating window covers the middle of the bottom edge: a widget under it
       is brought above it instead. */
    const winH = Math.min(FLOAT_H, height - 110)
    const winTop = height - FLOAT_BOTTOM - winH
    const mid = m.offsetWidth / 2
    const under = mode === 'float' && (r.left - box.left) / k < mid + FLOAT_W / 2 && (r.right - box.left) / k > mid - FLOAT_W / 2
    const limit = under ? winTop - 8 : height - 90
    if (top >= 8 && bottom <= limit) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const to = under ? m.scrollTop + top - 16 : m.scrollTop + top - Math.max(16, (height - (bottom - top)) / 2 - 30)
    m.scrollTo({ top: to, behavior: reduce ? 'auto' : 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lit])
  return (
    <>
      <Nav active={active} />
      <div
        className="s-body"
        data-dragging={dragging}
        data-ask={mode === 'docked'}
        style={{ '--s-ask-w': `${askWidth}px` } as React.CSSProperties}
        onKeyDown={(e) => e.key === 'Escape' && askOpen && closeAsk()}>
        <div className="s-main-wrap">
          <div ref={main} className="s-main" data-lenis-prevent>
            <HighlightContext value={lit.ids}>{children}</HighlightContext>
          </div>
          <AskFab open={askOpen} hidden={mode === 'docked'} onToggle={toggleAsk} />
        </div>
        <AskShift mode={mode} exiting={exiting} onDock={dock} script={script} onClose={closeAsk} width={askWidth} onWidth={setAskWidth} onDragging={setDragging} onHighlight={(ids, scroll) => setLit({ ids, scroll })} />
      </div>
    </>
  )
}
