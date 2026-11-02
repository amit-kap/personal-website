import { Fragment, useEffect, useRef, useState } from 'react'
import { answerFor, answers, askGroups, type Answer } from '../fixtures/ask'
import { AgentGlyph, Building, ClipboardCheck, Close, Menu, Radar, ShieldAlert } from '../icons'
import { Composer } from './Composer'
import { Menu as Popover } from './Menu'
import { VendorLogo } from './VendorLogo'

const groupIcon = { vendors: Building, exposures: ShieldAlert, threats: Radar, assessments: ClipboardCheck } as const

type Message = { id: number; role: 'user'; text: string } | { id: number; role: 'agent'; answer: Answer }

type Token = { kind: 'word'; text: string } | { kind: 'ref'; label: string; id: string; after: string }

/* Splits answer text into words and [[label|widget-id]] links. Punctuation right
   after a link stays attached to it. */
function tokenize(text: string): Token[] {
  return text
    .split(/(\[\[[^\]|]+\|[^\]]+\]\][.,;:)]*)/)
    .flatMap((chunk): Token[] => {
      const m = chunk.match(/^\[\[([^\]|]+)\|([^\]]+)\]\]([.,;:)]*)$/)
      if (m) return [{ kind: 'ref', label: m[1], id: m[2], after: m[3] }]
      return chunk
        .split(/\s+/)
        .filter(Boolean)
        .map((w) => ({ kind: 'word', text: w }))
    })
}

/* Reveals the answer word by word after a short "thinking" beat. Links to
   dashboard widgets highlight them on hover or focus. When the answer starts,
   it points at its widgets. */
function AgentMessage({
  answer,
  onProgress,
  onReveal,
  onPoint,
  onRelease,
}: {
  answer: Answer
  onProgress: () => void
  onReveal: (ids: string[]) => void
  onPoint: (id: string) => void
  onRelease: () => void
}) {
  const tokens = tokenize(answer.text)
  const [shown, setShown] = useState(0)
  const [thinking, setThinking] = useState(true)
  const total = tokens.length

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let cleanup = () => {}
    const start = window.setTimeout(() => {
      setThinking(false)
      onReveal(answer.widgets)
      if (reduce) return setShown(total)
      let i = 0
      const tick = window.setInterval(() => {
        i += 1
        setShown(i)
        if (i >= total) window.clearInterval(tick)
      }, 32)
      cleanup = () => window.clearInterval(tick)
    }, reduce ? 0 : 650)
    return () => {
      window.clearTimeout(start)
      cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total])

  useEffect(onProgress, [shown, thinking, onProgress])

  const done = shown >= total
  return (
    <div className="s-msg s-msg-agent">
      <div className="s-msg-who">
        <AgentGlyph size={14} />
        Shift
      </div>
      {thinking ? (
        <span className="s-dots" aria-label="Thinking">
          <i />
          <i />
          <i />
        </span>
      ) : (
        <p>
          {tokens.slice(0, shown).map((t, i) => (
            <Fragment key={i}>
              {i > 0 && ' '}
              {t.kind === 'word' ? (
                t.text
              ) : (
                <>
                  <button
                    type="button"
                    className="s-ref"
                    onMouseEnter={() => onPoint(t.id)}
                    onMouseLeave={onRelease}
                    onFocus={() => onPoint(t.id)}
                    onBlur={onRelease}
                    onClick={() => onPoint(t.id)}
                  >
                    {t.label}
                  </button>
                  {t.after}
                </>
              )}
            </Fragment>
          ))}
        </p>
      )}
      {done && answer.items && (
        <ul className="s-answer-items">
          {answer.items.map((it) => (
            <li key={it.vendor}>
              <VendorLogo name={it.vendor} size={24} />
              <div className="s-answer-text">
                <b>{it.vendor}</b>
                <span>{it.note}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* The Ask Shift panel: suggested questions until the first message, then the
   conversation. Always mounted so it can slide; inert while closed. */
export function AskShift({
  open,
  width,
  onWidth,
  onDragging,
  onHighlight,
  onClose,
}: {
  open: boolean
  width: number
  onWidth: (w: number) => void
  onDragging: (dragging: boolean) => void
  onHighlight: (ids: string[], scroll: boolean) => void
  onClose: () => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const panel = useRef<HTMLElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const nextId = useRef(1)
  const latest = useRef<string[]>([])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => panel.current?.querySelector<HTMLTextAreaElement>('.s-compose-field')?.focus({ preventScroll: true }), 340)
    return () => window.clearTimeout(t)
  }, [open])

  const title = messages.find((m) => m.role === 'user')?.text

  const newSession = () => {
    latest.current = []
    onHighlight([], false)
    setMessages([])
  }

  /* Closing the panel ends the session, once it has slid out of sight. */
  useEffect(() => {
    if (open) return
    const t = window.setTimeout(() => {
      latest.current = []
      setMessages([])
    }, 360)
    return () => window.clearTimeout(t)
  }, [open])

  const toBottom = () => {
    const el = scroller.current
    if (el) el.scrollTop = el.scrollHeight
  }

  const ask = (text: string, key = answerFor(text)) => {
    const t = text.trim()
    if (!t) return
    const id = nextId.current
    nextId.current += 2
    setMessages((m) => [...m, { id, role: 'user', text: t }, { id: id + 1, role: 'agent', answer: answers[key] }])
  }

  /* Dragging the left edge sets the width from the pointer; the body's right
     edge is the anchor. Arrow keys nudge it. */
  const bounds = () => {
    const body = panel.current?.parentElement?.getBoundingClientRect().width ?? 1000
    return { min: 300, max: Math.max(300, Math.min(640, body * 0.6)) }
  }
  const clamp = (w: number) => {
    const { min, max } = bounds()
    return Math.round(Math.min(max, Math.max(min, w)))
  }
  const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    const handle = e.currentTarget
    handle.setPointerCapture(e.pointerId)
    const right = panel.current!.parentElement!.getBoundingClientRect().right
    onDragging(true)
    const move = (ev: PointerEvent) => onWidth(clamp(right - ev.clientX))
    const end = () => {
      onDragging(false)
      handle.removeEventListener('pointermove', move)
      handle.removeEventListener('pointerup', end)
      handle.removeEventListener('pointercancel', end)
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', end)
    handle.addEventListener('pointercancel', end)
  }
  const nudge = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 48 : 16
    if (e.key === 'ArrowLeft') onWidth(clamp(width + step))
    else if (e.key === 'ArrowRight') onWidth(clamp(width - step))
    else return
    e.preventDefault()
  }

  return (
    <aside ref={panel} id="s-ask" className="s-ask" data-open={open} aria-label="Ask Shift" inert={!open}>
      <div
        className="s-ask-resize"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize Ask Shift"
        aria-valuenow={width}
        aria-valuemin={300}
        tabIndex={0}
        onPointerDown={startDrag}
        onKeyDown={nudge}
        onDoubleClick={() => onWidth(360)}
      />
      <div className="s-ask-inner">
        <div className="s-ask-top">
          <span className="s-ask-title">{title ?? 'New session'}</span>
          <div className="s-ask-actions">
          <Popover
            below
            label="Session"
            trigger={({ open, toggle }) => (
              <button type="button" className="s-tool s-icon-only" aria-haspopup="menu" aria-expanded={open} aria-label="Menu" onClick={toggle}>
                <Menu size={16} />
              </button>
            )}
          >
            {(close) => (
              <button
                type="button"
                role="menuitem"
                className="s-menu-item"
                onClick={() => {
                  newSession()
                  close()
                }}
              >
                New session
              </button>
            )}
          </Popover>
          <button type="button" className="s-tool s-icon-only" aria-label="Close Ask Shift" onClick={onClose}>
            <Close size={16} />
          </button>
          </div>
        </div>

        <div ref={scroller} className="s-ask-body" data-lenis-prevent>
          {messages.length === 0 ? (
            <div className="s-sections">
              {askGroups.map((g) => {
                const Icon = groupIcon[g.id]
                return (
                  <section key={g.id} className="s-section">
                    <h4>
                      <Icon size={13} />
                      {g.label}
                    </h4>
                    <div className="s-pills">
                      {g.questions.map((q) => (
                        <button key={q.q} type="button" className="s-pill" onClick={() => ask(q.q, q.answer)}>
                          {q.q}
                        </button>
                      ))}
                    </div>
                  </section>
                )
              })}
            </div>
          ) : (
            <div className="s-thread">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="s-msg s-msg-user">
                    {m.text}
                  </div>
                ) : (
                  <AgentMessage
                    key={m.id}
                    answer={m.answer}
                    onProgress={toBottom}
                    onReveal={(ids) => {
                      latest.current = ids
                      onHighlight(ids, true)
                    }}
                    onPoint={(id) => onHighlight([id], true)}
                    onRelease={() => onHighlight(latest.current, false)}
                  />
                ),
              )}
            </div>
          )}
        </div>

        <Composer onSend={(t) => ask(t)} />
      </div>
    </aside>
  )
}
