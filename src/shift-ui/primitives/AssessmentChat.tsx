import { AgentGlyph, PanelRight } from '../icons'
import { statusLabel, type ActiveAssessment } from '../fixtures/assessmentCenter'
import { vendors } from '../fixtures/vendors'
import { Composer } from './Composer'
import { VendorLogo } from './VendorLogo'

/* Middle column: the selected assessment's channel. A header with progress, the
   scrolling thread, and the composer. The thread is a stub for
   now: it opens with the assessment starting. */
export function AssessmentChat({
  assessment,
  panelOpen,
  onTogglePanel,
}: {
  assessment: ActiveAssessment
  panelOpen: boolean
  onTogglePanel: () => void
}) {
  const row = vendors.find((v) => v.name === assessment.vendor)
  const pct = Math.round((assessment.answered / assessment.total) * 100)
  return (
    <section className="s-ac-chat" aria-label={`${assessment.vendor} assessment`}>
      <header className="s-ac-head">
        {row && (
          <span className="s-grade" data-grade={row.grade}>
            {row.grade}
          </span>
        )}
        <VendorLogo name={assessment.vendor} size={20} />
        <h2 className="s-ac-title">{assessment.vendor}</h2>
        <span className="s-ac-progress" title={`${assessment.answered} of ${assessment.total} questions answered`}>
          <span className="s-progress-track">
            <span className="s-progress-fill" style={{ width: `${pct}%` }} />
          </span>
          <span className="s-progress-label">
            {assessment.answered} of {assessment.total} ({pct}%)
          </span>
        </span>
        <span className="s-ac-status" data-status={assessment.status}>
          {statusLabel[assessment.status]}
        </span>
        <button
          type="button"
          className="s-icon-btn"
          aria-label={panelOpen ? 'Hide vendor information' : 'Show vendor information'}
          aria-pressed={panelOpen}
          onClick={onTogglePanel}
        >
          <PanelRight size={16} />
        </button>
      </header>

      <div className="s-ac-thread" data-lenis-prevent>
        <div className="s-ac-thread-inner">
          <div className="s-ac-day">Today</div>
          <div className="s-msg s-msg-agent">
            <div className="s-msg-who">
              <AgentGlyph size={14} />
              Shift agent
            </div>
            <p>
              Assessment started. Framework: Shift Standard. Depth: Comprehensive. {assessment.total} questions to cover.
            </p>
          </div>
        </div>
      </div>

      <div className="s-ac-foot">
        <Composer onSend={() => {}} placeholder={`Message the agent about ${assessment.vendor}`} />
      </div>
    </section>
  )
}
