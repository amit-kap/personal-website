import { useEffect, useRef } from 'react'
import { AgentGlyph, CubeLoader, Eye, FileText, Gavel, Inbox, Info, MessageSquare, PaperPlane, Paperclip, User } from '../icons'
import { statusLabel, type ActiveAssessment } from '../fixtures/assessmentCenter'
import { threadFor, type EventKind, type ThreadItem } from '../fixtures/assessmentThreads'
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
  artifactsOpen,
  onToggleArtifacts,
}: {
  assessment: ActiveAssessment
  panelOpen: boolean
  onTogglePanel: () => void
  artifactsOpen: boolean
  onToggleArtifacts: () => void
}) {
  const row = vendors.find((v) => v.name === assessment.vendor)
  const pct = Math.round((assessment.answered / assessment.total) * 100)
  const items = threadFor(assessment)
  const thread = useRef<HTMLDivElement>(null)

  /* Open at the latest message, where the agent is waiting on you. */
  useEffect(() => {
    const el = thread.current
    if (el) el.scrollTop = el.scrollHeight
  }, [])
  return (
    <section className="s-ac-chat" aria-label={`${assessment.vendor} assessment`}>
      <header className="s-ac-head">
        <div className="s-ac-who">
          {row && (
            <span className="s-grade" data-grade={row.grade}>
              {row.grade}
            </span>
          )}
          <VendorLogo name={assessment.vendor} size={20} />
          <h2 className="s-ac-title">{assessment.vendor}</h2>
        </div>
        <div className="s-ac-mid">
          <span className="s-ac-progress" title={`${assessment.answered} of ${assessment.total} questions answered`}>
            <span className="s-progress-track">
              <span className="s-progress-fill" style={{ width: `${pct}%` }} />
            </span>
            <span className="s-progress-label">
              {assessment.answered} of {assessment.total} ({pct}%)
            </span>
          </span>
          <span className="s-ac-status" data-status={assessment.status}>
            {assessment.status === 'agent' && <CubeLoader />}
            {statusLabel[assessment.status]}
          </span>
        </div>
        <div className="s-ac-end">
          <button
            type="button"
            className="s-icon-btn"
            aria-label={artifactsOpen ? 'Hide artifacts' : 'Show artifacts'}
            aria-pressed={artifactsOpen}
            onClick={onToggleArtifacts}
          >
            <FileText size={16} />
          </button>
          <button
            type="button"
            className="s-icon-btn"
            aria-label={panelOpen ? 'Hide vendor information' : 'Show vendor information'}
            aria-pressed={panelOpen}
            onClick={onTogglePanel}
          >
            <Info size={16} />
          </button>
        </div>
      </header>

      <div ref={thread} className="s-ac-thread" data-lenis-prevent>
        <div className="s-ac-thread-inner">
          {items.map((item, i) => (
            <ThreadEntry key={i} item={item} connected={item.kind === 'event' && items[i + 1]?.kind === 'event'} />
          ))}
        </div>
      </div>

      <div className="s-ac-foot">
        <Composer onSend={() => {}} placeholder={`Message the agent about ${assessment.vendor}`} />
      </div>
    </section>
  )
}

const eventIcon: Record<EventKind, typeof PaperPlane> = { sent: PaperPlane, reply: Inbox, review: User }

function ThreadEntry({ item, connected }: { item: ThreadItem; connected: boolean }) {
  if (item.kind === 'day') {
    return (
      <div className="s-ac-day">
        <span>{item.note ? `${item.label} · ${item.note}` : item.label}</span>
      </div>
    )
  }
  if (item.kind === 'agent') {
    return (
      <div className="s-msg s-msg-agent">
        <div className="s-msg-who">
          <AgentGlyph size={14} />
          Shift agent
          <span className="s-msg-time">{item.time}</span>
        </div>
        <p>{item.text}</p>
      </div>
    )
  }
  if (item.kind === 'event') {
    const Icon = eventIcon[item.event]
    return (
      <div className="s-ac-event" data-event={item.event} data-connected={connected}>
        <span className="s-ac-event-icon">
          <Icon size={14} />
        </span>
        <span className="s-ac-event-time">{item.time}</span>
        <div className="s-ac-event-body">
          <b>{item.title}</b>
          <span>{item.detail}</span>
          {item.link && (
            <button type="button" className="s-ac-link">
              {item.link}
            </button>
          )}
        </div>
      </div>
    )
  }
  return (
    <div className="s-ac-bubble">
      <div className="s-msg-who">
        <AgentGlyph size={14} />
        Shift agent
        <span className="s-msg-time">{item.time}</span>
      </div>
      <p className="s-ac-bubble-text">{item.text}</p>
      <p className="s-ac-bubble-reco">{item.recommendation}</p>
      <div className="s-ac-need">
        <small>USER ACTION REQUIRED</small>
        <h4>{item.title}</h4>
        <div className="s-ac-need-stats">
          {item.stats.map((st) => (
            <div key={st.label}>
              <span>
                {st.icon === 'answers' ? <MessageSquare size={16} /> : <Paperclip size={16} />}
                {st.value}
              </span>
              <em>{st.label}</em>
            </div>
          ))}
        </div>
      </div>
      <div className="s-ac-bubble-actions">
        <button type="button" className="s-dark">
          <Eye size={14} />
          {item.primary}
        </button>
        <button type="button" className="s-ghost">
          <Gavel size={14} />
          {item.secondary}
        </button>
        <button type="button" className="s-ac-dismiss">
          Dismiss
        </button>
      </div>
    </div>
  )
}
