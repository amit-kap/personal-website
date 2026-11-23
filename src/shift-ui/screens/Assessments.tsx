import { useEffect, useRef, useState } from 'react'
import { Nav } from '../primitives/Nav'
import { ArtifactsPanel } from '../primitives/ArtifactsPanel'
import { AssessmentChat } from '../primitives/AssessmentChat'
import { AssessmentList } from '../primitives/AssessmentList'
import { ResizeHandle } from '../primitives/ResizeHandle'
import { VendorInfoPanel } from '../primitives/VendorInfoPanel'
import { activeAssessments, resolvedAssessments, type ActiveAssessment } from '../fixtures/assessmentCenter'

const LIST = { initial: 300, min: 220 }
const PANEL = { initial: 340, min: 260 }
const CHAT_MIN = 380
/* Under this width the side panels float over the conversation instead of
   sharing the row (the container query in the stylesheet uses the same). */
const NARROW = 980

/* The Assessment Center: a harness of three columns. Every active assessment
   is an open session on the left, the selected one's conversation with the
   agent is in the middle, and side panels open on the right. Both side columns
   resize. There is no Ask Shift here; the channel is the agent. */
export function Assessments() {
  const [selected, setSelected] = useState(activeAssessments[0].vendor)
  const [panel, setPanel] = useState(true)
  const [listW, setListW] = useState(LIST.initial)
  const [panelW, setPanelW] = useState(PANEL.initial)
  const [docs, setDocs] = useState(false)
  const [docsW, setDocsW] = useState(PANEL.initial)
  const [dragging, setDragging] = useState(false)
  const frame = useRef<HTMLDivElement>(null)
  const [fw, setFw] = useState(1200)
  const narrow = fw <= NARROW
  const active = activeAssessments.find((a) => a.vendor === selected)
  const resolved = active ? undefined : resolvedAssessments.find((r) => r.vendor === selected)
  const current: ActiveAssessment = active ?? (resolved ? { vendor: resolved.vendor, status: 'review', meta: resolved.when, answered: 0, total: 0 } : activeAssessments[0])

  useEffect(() => {
    const el = frame.current
    if (!el) return
    const watch = new ResizeObserver(() => setFw(el.offsetWidth))
    watch.observe(el)
    setFw(el.offsetWidth)
    return () => watch.disconnect()
  }, [])

  /* No column may squeeze the conversation below CHAT_MIN; floating panels take
     no room. */
  const taken = (w: number, on: boolean) => (on && !narrow ? w : 0)
  const room = (others: number) => fw - others - CHAT_MIN
  const clampList = (w: number) => Math.max(LIST.min, Math.min(w, Math.max(LIST.min, room(taken(panelW, panel) + taken(docsW, docs)))))
  const clampPanel = (w: number) => Math.max(PANEL.min, Math.min(w, Math.max(PANEL.min, room(listW + taken(docsW, docs)))))
  const clampDocs = (w: number) => Math.max(PANEL.min, Math.min(w, Math.max(PANEL.min, room(listW + taken(panelW, panel)))))

  /* What is drawn is always fitted, whatever the window or the open panels did
     to the stored widths. */
  const list = clampList(listW)
  const info = clampPanel(panelW)
  const files = clampDocs(docsW)

  /* Floating panels stack in one place, so opening one closes the other. */
  const togglePanel = () => {
    setPanel(!panel)
    if (narrow && !panel) setDocs(false)
  }
  const toggleDocs = () => {
    setDocs(!docs)
    if (narrow && !docs) setPanel(false)
  }

  return (
    <>
      <Nav active="Assessments" />
      <div ref={frame} className="s-ac" data-dragging={dragging}>
        <AssessmentList selected={selected} onSelect={setSelected} width={list}>
          <ResizeHandle edge="right" width={list} initial={LIST.initial} clamp={clampList} onWidth={setListW} onDragging={setDragging} label="Resize assessments" />
        </AssessmentList>
        <AssessmentChat key={current.vendor} assessment={current} result={resolved?.result} panelOpen={panel} onTogglePanel={togglePanel} artifactsOpen={docs} onToggleArtifacts={toggleDocs} />
        <VendorInfoPanel vendor={current.vendor} open={panel} width={info} onClose={() => setPanel(false)}>
          <ResizeHandle edge="left" width={info} initial={PANEL.initial} clamp={clampPanel} onWidth={setPanelW} onDragging={setDragging} label="Resize vendor information" />
        </VendorInfoPanel>
        <ArtifactsPanel vendor={current.vendor} open={docs} width={files} onClose={() => setDocs(false)}>
          <ResizeHandle edge="left" width={files} initial={PANEL.initial} clamp={clampDocs} onWidth={setDocsW} onDragging={setDragging} label="Resize artifacts" />
        </ArtifactsPanel>
      </div>
    </>
  )
}
