import { useEffect, useRef, useState } from 'react'
import { HighlightContext } from '../highlight'
import { assessments, assessmentTiles, findings, findingTiles, inventoryTiles } from '../fixtures/dashboard'
import { Kebab, Refresh } from '../icons'
import { AskFab } from '../primitives/AskFab'
import { AskShift } from '../primitives/AskShift'
import { AssessmentRow } from '../primitives/AssessmentRow'
import { AreaChart } from '../primitives/AreaChart'
import { BarChart } from '../primitives/BarChart'
import { CalendarWidget } from '../primitives/CalendarWidget'
import { FindingRow } from '../primitives/FindingRow'
import { Nav } from '../primitives/Nav'
import { ChartLegend } from '../primitives/ChartLegend'
import { Panel } from '../primitives/Panel'
import { StatTile } from '../primitives/StatTile'
import { Treemap } from '../primitives/Treemap'

/* The Shift home dashboard. The nav stays put; the widgets scroll in their own
   column, and Ask Shift pushes in beside them from a floating button. */
export function Dashboard() {
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
    const box = m.getBoundingClientRect()
    const r = el.getBoundingClientRect()
    if (r.top >= box.top + 8 && r.bottom <= box.bottom - 90) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    m.scrollTo({ top: m.scrollTop + (r.top - box.top) - Math.max(16, (box.height - r.height) / 2 - 30), behavior: reduce ? 'auto' : 'smooth' })
  }, [lit])
  return (
    <>
      <Nav active="Home" />
      <div
        className="s-body"
        data-dragging={dragging}
        data-ask={askOpen}
        style={{ '--s-ask-w': `${askWidth}px` } as React.CSSProperties}
        onKeyDown={(e) => e.key === 'Escape' && askOpen && toggleAsk()}>
        <div className="s-main-wrap">
          <div ref={main} className="s-main" data-lenis-prevent>
            <HighlightContext value={lit.ids}>
            <div className="s-page">
              <div className="s-title-row">
                <h2 className="s-title s-head">Home</h2>
                <div className="s-meta">
                  <button type="button" className="s-icon-btn s-refresh">
                    <Refresh size={12} />6 hours ago
                  </button>
                  <button type="button" className="s-icon-btn" aria-label="More">
                    <Kebab size={14} />
                  </button>
                </div>
              </div>

              <div className="s-group-label">Inventory</div>
              <div className="s-tiles">
                {inventoryTiles.map((t) => (
                  <StatTile key={t.label} {...t} />
                ))}
              </div>
              <div className="s-panels">
                <Panel title="Data Access" insight="8 access categories detected across 19 vendors — 13 with critical-tier access">
                  <Treemap />
                </Panel>
                <Panel
                  title="Vendor Rating Trend"
                  action={
                    <ChartLegend
                      items={[
                        { label: 'Previous', swatch: 'var(--s-prev)' },
                        { label: 'Current', swatch: 'linear-gradient(90deg, var(--s-critical), var(--s-elevated), var(--s-low))' },
                      ]}
                    />
                  }
                  insight="5 low-risk vendors vs 3 critical-risk vendors in current portfolio">
                  <BarChart />
                </Panel>
              </div>

              <div className="s-group-label">Findings</div>
              <div className="s-tiles">
                {findingTiles.map((t) => (
                  <StatTile key={t.label} {...t} />
                ))}
              </div>
              <div className="s-panels">
                <Panel title="Recent Findings" action={<button type="button" className="s-link">View all</button>} insight="5 critical findings — review immediately">
                  <div className="s-rows">
                    {findings.map((f) => (
                      <FindingRow key={f.vendor} {...f} />
                    ))}
                  </div>
                </Panel>
                <Panel
                  title="Threat Detection"
                  action={
                    <ChartLegend
                      items={[
                        { label: 'New vendors', swatch: '#e7a64c' },
                        { label: 'Other', swatch: '#8a8f9c' },
                      ]}
                    />
                  }
                  insight="Alert volume up 2x over the last 8 weeks — spike driven by new shadow vendor detections">
                  <AreaChart />
                </Panel>
              </div>

              <div className="s-group-label">Assessments</div>
              <div className="s-tiles">
                {assessmentTiles.map((t) => (
                  <StatTile key={t.label} {...t} />
                ))}
              </div>
              <div className="s-panels">
                <Panel title="Active Assessments" action={<button type="button" className="s-link">View all</button>} insight="1 vendor reply needs your review">
                  <div className="s-rows">
                    {assessments.slice(0, 5).map((a) => (
                      <AssessmentRow key={a.vendor} {...a} />
                    ))}
                  </div>
                </Panel>
                <Panel title="Upcoming Assessments" insight="5 assessments start or fall due in June">
                  <CalendarWidget />
                </Panel>
              </div>
            </div>
            </HighlightContext>
          </div>
          <AskFab open={askOpen} onToggle={toggleAsk} />
        </div>
        <AskShift open={askOpen} onClose={toggleAsk} width={askWidth} onWidth={setAskWidth} onDragging={setDragging} onHighlight={(ids, scroll) => setLit({ ids, scroll })} />
      </div>
    </>
  )
}
