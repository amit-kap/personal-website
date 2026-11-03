import { useEffect, useRef, type ReactNode } from 'react'
import { AgentGlyph, CubeLoader, ExternalLink, Eye, FileText, Gavel, Inbox, Info, PaperPlane, User } from '../icons'
import { resultTone, statusLabel, type ActiveAssessment } from '../fixtures/assessmentCenter'
import { closedThread, threadFor, type Block, type EventKind, type ThreadItem } from '../fixtures/assessmentThreads'
import { vendors } from '../fixtures/vendors'
import { Composer } from './Composer'
import { VendorLogo } from './VendorLogo'

/* Middle column: the selected assessment's channel. A header with progress, the
   scrolling thread, and the composer. The thread is a stub for
   now: it opens with the assessment starting. */
export function AssessmentChat({
  assessment,
  result,
  panelOpen,
  onTogglePanel,
  artifactsOpen,
  onToggleArtifacts,
}: {
  assessment: ActiveAssessment
  /* Set for a finished assessment: the thread is a read-only record. */
  result?: string
  panelOpen: boolean
  onTogglePanel: () => void
  artifactsOpen: boolean
  onToggleArtifacts: () => void
}) {
  const row = vendors.find((v) => v.name === assessment.vendor)
  const pct = assessment.total ? Math.round((assessment.answered / assessment.total) * 100) : 0
  const items = result ? closedThread(assessment.vendor, result) : threadFor(assessment)
  const open = assessment.total - assessment.answered
  /* The next step, not a repeat of the list's tag. */
  const status = assessment.status === 'review' ? (open > 0 ? `${open} open · decision pending` : 'Decision pending') : statusLabel[assessment.status]
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
          {result ? (
            <span className="s-ac-status" data-status="closed" data-result={resultTone(result)}>
              {result}
            </span>
          ) : (
            <>
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
                {status}
              </span>
            </>
          )}
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
            <ThreadEntry key={i} item={item} />
          ))}
        </div>
      </div>

      <div className="s-ac-foot">
        {result ? <p className="s-ac-closed">This assessment is closed.</p> : <Composer onSend={() => {}} placeholder={`Message the agent about ${assessment.vendor}`} />}
      </div>
    </section>
  )
}

/* **bold** in a block's text. */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/\*\*([^*]+)\*\*/).map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part))}
    </>
  )
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="s-ac-rich">
      {blocks.map((b, i) =>
        'p' in b ? (
          <p key={i}>
            <Rich text={b.p} />
          </p>
        ) : 'ul' in b ? (
          <ul key={i}>
            {b.ul.map((li) => (
              <li key={li}>
                <Rich text={li} />
              </li>
            ))}
          </ul>
        ) : (
          <ul key={i} className="s-ac-sources">
            {b.sources.map((src) => (
              <li key={src.site}>
                <button type="button" className="s-ac-source">
                  <ExternalLink size={12} />
                  <span>{src.title}</span>
                  <small>{src.site}</small>
                </button>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  )
}

const eventIcon: Record<EventKind, typeof PaperPlane> = { sent: PaperPlane, reply: Inbox, review: User }

/* Every entry speaks the same way: an icon in the gutter, a title line with the
   time, then the body. The agent's body is formatted text; an event's is its
   detail. Only your own messages are bubbles. */
function Entry({ icon, tone, title, time, children }: { icon: ReactNode; tone: string; title: string; time: string; children: ReactNode }) {
  return (
    <div className="s-ac-entry">
      <span className="s-ac-entry-icon" data-tone={tone}>
        {icon}
      </span>
      <div className="s-ac-entry-main">
        <div className="s-ac-entry-head">
          <b>{title}</b>
          <span>{time}</span>
        </div>
        {children}
      </div>
    </div>
  )
}

function ThreadEntry({ item }: { item: ThreadItem }) {
  if (item.kind === 'day') {
    return (
      <div className="s-ac-day">
        <span>{item.note ? `${item.label} · ${item.note}` : item.label}</span>
      </div>
    )
  }
  if (item.kind === 'user') {
    return (
      <div className="s-ac-user">
        <div className="s-msg s-msg-user">{item.text}</div>
        <span className="s-msg-time">{item.time}</span>
      </div>
    )
  }
  if (item.kind === 'working') {
    return (
      <Entry icon={<AgentGlyph size={14} />} tone="agent" title="Shift agent" time="">
        <p className="s-ac-working">
          <CubeLoader />
          Working on it
        </p>
      </Entry>
    )
  }
  if (item.kind === 'agent') {
    const body = (
      <>
        <Blocks blocks={item.blocks} />
        {item.actions && (
          <div className="s-ac-actions">
            {item.actions.map((a) => (
              <button key={a.label} type="button" className={{ primary: 's-dark', ghost: 's-ghost', text: 's-ac-dismiss' }[a.look]}>
                {a.icon === 'eye' && <Eye size={14} />}
                {a.icon === 'gavel' && <Gavel size={14} />}
                {a.label}
              </button>
            ))}
          </div>
        )}
      </>
    )
    return (
      <Entry icon={<AgentGlyph size={14} />} tone="agent" title="Shift agent" time={item.time}>
        {item.decision ? (
          <div className="s-ac-decision">
            <small>Decision needed</small>
            {body}
          </div>
        ) : (
          body
        )}
      </Entry>
    )
  }
  const Icon = eventIcon[item.event]
  return (
    <Entry icon={<Icon size={14} />} tone={item.event} title={item.title} time={item.time}>
      <div className="s-ac-event-detail">
        <span>{item.detail}</span>
        {item.link && (
          <button type="button" className="s-ac-link">
            {item.link}
          </button>
        )}
      </div>
    </Entry>
  )
}
