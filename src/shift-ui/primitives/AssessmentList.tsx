import { useState, type ReactNode } from 'react'
import { Check, ChevronDown, Search } from '../icons'
import {
  activeAssessments,
  compareHistory,
  filters,
  historySorts,
  RESOLVED_COUNT,
  resolvedAssessments,
  statusLabel,
  statusRank,
  type AssessmentStatus,
  type HistorySort,
} from '../fixtures/assessmentCenter'
import { Menu } from './Menu'
import { VendorLogo } from './VendorLogo'

/* A small dropdown: the button shows the current choice, the menu has a check
   beside it. */
function Picker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { id: T; label: string }[]
  onChange: (id: T) => void
}) {
  return (
    <Menu
      below
      label={label}
      trigger={({ open, toggle }) => (
        <button type="button" className="s-ghost s-ac-filter-btn" aria-haspopup="menu" aria-expanded={open} aria-label={`${label}: ${options.find((o) => o.id === value)?.label}`} onClick={toggle}>
          {options.find((o) => o.id === value)?.label}
          <ChevronDown size={12} />
        </button>
      )}
    >
      {(close) =>
        options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="menuitemradio"
            aria-checked={o.id === value}
            className="s-menu-item"
            onClick={() => {
              onChange(o.id)
              close()
            }}
          >
            {o.label}
            {o.id === value && <Check size={13} />}
          </button>
        ))
      }
    </Menu>
  )
}

/* Left column: Active sessions or the History of finished ones. Active can be
   filtered by who the work is waiting on and is ordered with what needs you
   first. */
export function AssessmentList({
  selected,
  onSelect,
  width,
  children,
}: {
  selected: string
  onSelect: (vendor: string) => void
  width: number
  children?: ReactNode
}) {
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [filter, setFilter] = useState<'all' | AssessmentStatus>('all')
  const [sort, setSort] = useState<HistorySort>('newest')
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const matches = (vendor: string) => !q || vendor.toLowerCase().includes(q)
  const past = resolvedAssessments.filter((r) => matches(r.vendor)).sort(compareHistory[sort])
  const rows = activeAssessments
    .filter((a) => matches(a.vendor) && (filter === 'all' || a.status === filter))
    .sort((a, b) => statusRank[a.status] - statusRank[b.status])

  return (
    <aside className="s-ac-list" aria-label="Assessments" style={{ width }}>
      <div className="s-ac-tabs" role="tablist" aria-label="Assessments">
        <button type="button" role="tab" aria-selected={tab === 'active'} onClick={() => setTab('active')}>
          Active
          <span className="s-ac-count">{activeAssessments.length}</span>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'history'} onClick={() => setTab('history')}>
          History
          <span className="s-ac-count">{RESOLVED_COUNT}</span>
        </button>
      </div>

      <div className="s-ac-filter">
        <label className="s-search">
          <Search size={14} />
          <input type="search" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search assessments" />
        </label>
        {tab === 'active' ? (
          <Picker label="Filter assessments" value={filter} options={filters} onChange={setFilter} />
        ) : (
          <Picker label="Sort history" value={sort} options={historySorts} onChange={setSort} />
        )}
      </div>

      <div className="s-ac-scroll" role="tabpanel" data-lenis-prevent>
        {tab === 'active' ? (
          <ul className="s-ac-items">
            {rows.map((a) => (
              <li key={a.vendor}>
                <button type="button" className="s-ac-item" data-selected={selected === a.vendor} aria-current={selected === a.vendor ? 'true' : undefined} onClick={() => onSelect(a.vendor)}>
                  <VendorLogo name={a.vendor} size={28} />
                  <span className="s-ac-item-main">
                    <b>{a.vendor}</b>
                    <span className="s-ac-tag" data-status={a.status}>
                      {statusLabel[a.status]}
                    </span>
                  </span>
                  <span className="s-ac-item-meta" data-live={a.meta === 'Just now'}>
                    {a.meta}
                  </span>
                </button>
              </li>
            ))}
            {rows.length === 0 && <li className="s-empty">Nothing here.</li>}
          </ul>
        ) : (
          <ul className="s-ac-items">
            {past.map((r) => (
              <li key={r.vendor}>
                <div className="s-ac-item" data-resolved>
                  <VendorLogo name={r.vendor} size={28} />
                  <span className="s-ac-item-main">
                    <b>{r.vendor}</b>
                    <span className="s-ac-result" data-result={r.result.split(' ')[0]}>
                      {r.result}
                    </span>
                  </span>
                  <span className="s-ac-item-meta">{r.when}</span>
                </div>
              </li>
            ))}
            {past.length === 0 && <li className="s-empty">Nothing here.</li>}
          </ul>
        )}
      </div>
      {children}
    </aside>
  )
}
