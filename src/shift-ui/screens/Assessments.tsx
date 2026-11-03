import { useRef, useState } from 'react'
import { Nav } from '../primitives/Nav'
import { ArtifactsPanel } from '../primitives/ArtifactsPanel'
import { AssessmentChat } from '../primitives/AssessmentChat'
import { AssessmentList } from '../primitives/AssessmentList'
import { ResizeHandle } from '../primitives/ResizeHandle'
import { VendorInfoPanel } from '../primitives/VendorInfoPanel'
import { activeAssessments } from '../fixtures/assessmentCenter'

const LIST = { initial: 300, min: 220 }
const PANEL = { initial: 340, min: 260 }
const CHAT_MIN = 380

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
  const current = activeAssessments.find((a) => a.vendor === selected) ?? activeAssessments[0]

  /* Neither column may squeeze the conversation below CHAT_MIN. */
  const room = (other: number) => (frame.current?.offsetWidth ?? 1200) - other - CHAT_MIN
  const open = (on: boolean, w: number) => (on ? w : 0)
  const clampList = (w: number) => Math.max(LIST.min, Math.min(w, Math.max(LIST.min, room(open(panel, panelW) + open(docs, docsW)))))
  const clampPanel = (w: number) => Math.max(PANEL.min, Math.min(w, Math.max(PANEL.min, room(listW + open(docs, docsW)))))
  const clampDocs = (w: number) => Math.max(PANEL.min, Math.min(w, Math.max(PANEL.min, room(listW + open(panel, panelW)))))

  return (
    <>
      <Nav active="Assessments" />
      <div ref={frame} className="s-ac" data-dragging={dragging}>
        <AssessmentList selected={selected} onSelect={setSelected} width={listW}>
          <ResizeHandle edge="right" width={listW} initial={LIST.initial} clamp={clampList} onWidth={setListW} onDragging={setDragging} label="Resize assessments" />
        </AssessmentList>
        <AssessmentChat key={current.vendor} assessment={current} panelOpen={panel} onTogglePanel={() => setPanel(!panel)} artifactsOpen={docs} onToggleArtifacts={() => setDocs(!docs)} />
        <VendorInfoPanel vendor={current.vendor} open={panel} width={panelW} onClose={() => setPanel(false)}>
          <ResizeHandle edge="left" width={panelW} initial={PANEL.initial} clamp={clampPanel} onWidth={setPanelW} onDragging={setDragging} label="Resize vendor information" />
        </VendorInfoPanel>
        <ArtifactsPanel vendor={current.vendor} open={docs} width={docsW} onClose={() => setDocs(false)}>
          <ResizeHandle edge="left" width={docsW} initial={PANEL.initial} clamp={clampDocs} onWidth={setDocsW} onDragging={setDragging} label="Resize artifacts" />
        </ArtifactsPanel>
      </div>
    </>
  )
}
