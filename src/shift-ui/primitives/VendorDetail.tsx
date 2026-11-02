import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { gradeBands, gradeColor, type VendorDetail as Detail } from '../fixtures/vendorDetail'
import type { Grade } from '../fixtures/vendors'
import { AgentGlyph, ChevronDown, ChevronRight, ChevronUp, Close, ExternalLink, Info, Kebab, Mail, Phone, User } from '../icons'
import { VendorLogo } from './VendorLogo'

/* The vendor card: a large panel from the right over a dimmed page, with the
   vendor's tabs, the Overview, and a rail of facts. Closes on Escape, the
   close button or the dimmed page. */
export function VendorDetail({ detail, root, onClose }: { detail: Detail; root: HTMLElement; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null)
  useEffect(() => {
    panel.current?.focus({ preventScroll: true })
  }, [])

  return createPortal(
    <div className="s-vd-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panel}
        className="s-vd"
        role="dialog"
        aria-modal="true"
        aria-label={`${detail.name} vendor card`}
        tabIndex={-1}
        onKeyDown={(e) => e.key === 'Escape' && (e.stopPropagation(), onClose())}
      >
        <header className="s-vd-head">
          <div className="s-vd-crumb">
            <span>Vendors / Vendor Card</span>
            <span className="s-vd-actions">
              <button type="button" className="s-icon-btn" aria-label="More">
                <Kebab size={14} />
              </button>
              <button type="button" className="s-icon-btn" aria-label="Close" onClick={onClose}>
                <Close size={16} />
              </button>
            </span>
          </div>
          <h2 className="s-vd-title">
            <span className="s-grade" data-grade={detail.grade}>
              {detail.grade}
            </span>
            <VendorLogo name={detail.name} size={20} />
            {detail.name}
          </h2>
        </header>

        <div className="s-vd-scroll" data-lenis-prevent>
          {/* Only Overview exists in this prototype; the other tabs just react to hover. */}
          <div className="s-vd-tabs" aria-label="Vendor sections">
            {detail.tabs.map((t, i) => (
              <span key={t.label} className="s-vd-tab" aria-current={i === 0 ? 'page' : undefined}>
                {t.label}
              </span>
            ))}
          </div>

          <div className="s-vd-cols">
            <div className="s-vd-main">
              <ScoreCard detail={detail} />
              <HistoryCard detail={detail} />
              <AiCard detail={detail} />
            </div>
            <Rail detail={detail} />
          </div>
        </div>
      </div>
    </div>,
    root,
  )
}

function Card({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="s-card s-vd-card">
      <header className="s-vd-card-head">
        <h3>{title}</h3>
      </header>
      {note && (
        <div className="s-vd-tip">
          <div className="s-chip">
            <AgentGlyph size={16} />
            <span className="s-chip-text">{note}</span>
          </div>
        </div>
      )}
      {children}
    </section>
  )
}

function Legend() {
  return (
    <div className="s-vd-legend">
      {gradeBands.map((b) => (
        <span key={b.grade}>
          <b style={{ color: b.color }}>{b.grade}</b> {b.range}
        </span>
      ))}
    </div>
  )
}

function ScoreCard({ detail }: { detail: Detail }) {
  const size = 150
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const arc = (detail.score.value / 100) * c
  return (
    <Card title="Security Score" note={detail.score.note}>
      <div className="s-vd-score">
        <div className="s-vd-ring">
          <div className="s-vd-dial" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }} aria-hidden="true">
              <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e9e9ec" strokeWidth={stroke} />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={gradeColor[detail.grade]}
                strokeWidth={stroke}
                strokeDasharray={`${arc} ${c - arc}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="s-vd-dial-center">
              <span className="s-vd-letter" style={{ background: `${gradeColor[detail.grade]}33`, color: gradeColor[detail.grade] }}>
                {detail.grade}
              </span>
              <span className="s-vd-num">
                <b>{detail.score.value}</b> / 100
              </span>
              <span className="s-vd-risk">{detail.score.risk}</span>
            </div>
          </div>
          <Legend />
        </div>
        <ul className="s-vd-cats">
          {detail.score.categories.map((cat) => (
            <li key={cat.label}>
              <button type="button">
                <span className="s-grade" data-grade={cat.grade}>
                  {cat.grade}
                </span>
                <span>{cat.label}</span>
                <ChevronRight size={12} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

const LEVEL = 37.5
const TOP = 4
const levelOf = (g: Grade) => TOP + (g === 'F' ? 4 : 'ABCD'.indexOf(g)) * LEVEL

function HistoryCard({ detail }: { detail: Detail }) {
  const { steps, months } = detail.history
  const bottom = 186
  /* Steps of the same grade are one block, so a translucent fill never
     overlaps itself and leaves a visible seam. */
  const runs = steps.reduce<{ grade: Grade; from: number; to: number }[]>((acc, g, i) => {
    const last = acc[acc.length - 1]
    if (last && last.grade === g) last.to = i + 1
    else acc.push({ grade: g, from: i, to: i + 1 })
    return acc
  }, [])
  return (
    <Card title="Score History" note={detail.history.note}>
      <div className="s-vd-hist">
        <div className="s-vd-hist-plot">
          <div className="s-vd-hist-y" aria-hidden="true">
            {(['A', 'B', 'C', 'D', 'F'] as Grade[]).map((g) => (
              <span key={g} style={{ top: levelOf(g) - 6, color: gradeColor[g] }}>
                {g}
              </span>
            ))}
          </div>
          <svg viewBox={`0 0 ${steps.length} 190`} preserveAspectRatio="none" role="img" aria-label="Score history">
 
            <defs>
              {gradeBands.map((b) => (
                <linearGradient key={b.grade} id={`s-vd-fill-${b.grade}`} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor={b.color} stopOpacity="0.25" />
                  <stop offset="1" stopColor={b.color} stopOpacity="0" />
                </linearGradient>
              ))}
            </defs>
            {(['A', 'B', 'C', 'D', 'F'] as Grade[]).map((g) => (
              <line key={g} x1="0" x2={steps.length} y1={levelOf(g)} y2={levelOf(g)} stroke="#ececef" vectorEffect="non-scaling-stroke" />
            ))}
            <line x1="0" x2={steps.length} y1={bottom} y2={bottom} stroke="#d4d4d8" vectorEffect="non-scaling-stroke" />
            {runs.map((r) => (
              <rect key={r.from} x={r.from} width={r.to - r.from} y={levelOf(r.grade)} height={bottom - levelOf(r.grade)} fill={`url(#s-vd-fill-${r.grade})`} shapeRendering="crispEdges" />
            ))}
            {steps.map((g, i) => (
              <g key={i}>
                <line x1={i} x2={i + 1} y1={levelOf(g)} y2={levelOf(g)} stroke={gradeColor[g]} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
          </svg>
        </div>
        <div className="s-vd-hist-x">
          {months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        <Legend />
      </div>
    </Card>
  )
}

function AiCard({ detail }: { detail: Detail }) {
  const { exposure, rows } = detail.ai
  return (
    <Card title="AI Exposure">
      <div className="s-vd-ai">
        <div className="s-vd-ai-row">
          <div>
            <small>EXPOSURE</small>
            <span className="s-badge" data-tone={exposure.tone}>
              {exposure.label}
            </span>
          </div>
          {rows[0].map((f) => (
            <div key={f.label}>
              <small>{f.label.toUpperCase()}</small>
              <span className="s-vd-ai-value" data-num={/^\d+$/.test(f.value)}>
                {f.label === 'Classification' && <AgentGlyph size={13} />}
                {f.value}
              </span>
            </div>
          ))}
        </div>
        <div className="s-vd-ai-row">
          {rows[1].map((f) => (
            <div key={f.label}>
              <small>{f.label.toUpperCase()}</small>
              <span className="s-vd-ai-value" data-num={/^\d+$/.test(f.value)}>
                {f.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function Section({ title, action, open: startOpen = false, children }: { title: string; action?: string; open?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <section className="s-vd-sec">
      <div className="s-vd-sec-head">
        <h3>{title}</h3>
        {action && <button type="button">{action}</button>}
        <button type="button" aria-label={open ? `Collapse ${title}` : `Expand ${title}`} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>
      {open && <div className="s-vd-sec-body">{children}</div>}
    </section>
  )
}

function Field({ label, info, children }: { label: string; info?: boolean; children: React.ReactNode }) {
  return (
    <div className="s-vd-field">
      <span className="s-vd-label">
        {label}
        {info && <Info size={12} />}
      </span>
      <span className="s-vd-value">{children}</span>
    </div>
  )
}

function Rail({ detail }: { detail: Detail }) {
  const [more, setMore] = useState(false)
  const { about, management, access, contact } = detail
  return (
    <aside className="s-vd-rail">
      <Section title="About" open>
        <Field label="Industry">{about.industry}</Field>
        <Field label="Domain">
          {about.domain}
          <ExternalLink size={12} />
        </Field>
        <div className="s-vd-field">
          <span className="s-vd-label">Description</span>
          <p className="s-vd-desc" data-clamped={!more}>
            {about.description}
          </p>
          <button type="button" className="s-vd-more" onClick={() => setMore(!more)}>
            {more ? 'SHOW LESS' : 'SHOW MORE'}
          </button>
        </div>
      </Section>
      <Section title="Management Overview">
        {management.map((m) => (
          <Field key={m.label} label={m.label} info>
            {m.value}
          </Field>
        ))}
      </Section>
      <Section title="Access Scope">
        <Field label="Source/s">
          {access.sources.length ? (
            <span className="s-vd-sources">
              {access.sources.map((s) => (
                <span key={s.name}>
                  <VendorLogo name={s.logo} size={14} />
                  {s.name}
                </span>
              ))}
            </span>
          ) : (
            <span className="s-dim">None detected</span>
          )}
        </Field>
        <Field label="Detected Access" info>
          {access.detected.length ? (
            <span className="s-vd-tags">
              {access.detected.map((t) => (
                <span key={t.label} className="s-badge" data-tone={t.tone}>
                  {t.label}
                </span>
              ))}
            </span>
          ) : (
            <span className="s-dim">None detected</span>
          )}
        </Field>
        <Field label="Approved Access" info>
          {access.approved.length ? (
            <span className="s-vd-tags">
              {access.approved.map((t) => (
                <span key={t} className="s-badge" data-tone="orange">
                  {t}
                </span>
              ))}
            </span>
          ) : (
            <span className="s-dim">None approved</span>
          )}
        </Field>
      </Section>
      <Section title="Contacts" action="Edit">
        <div className="s-vd-field">
          <span className="s-vd-label s-vd-caps">{contact.role}</span>
          <span className="s-vd-contact">
            <User size={14} />
            {contact.name}
          </span>
          <span className="s-vd-contact">
            <Mail size={14} />
            {contact.email}
          </span>
          <span className="s-vd-contact">
            <Phone size={14} />
            {contact.phone}
          </span>
        </div>
      </Section>
    </aside>
  )
}
