import { useRef, useState, type ReactNode } from 'react'
import { CubeLoader, MoreHorizontal, Search } from '../icons'
import {
  activeAssessments,
  compareHistory,
  emptyFilter,
  filters,
  historySorts,
  RESOLVED_COUNT,
  resolvedAssessments,
  resultTone,
  statusLabel,
  statusRank,
  type AssessmentStatus,
  type HistorySort,
} from '../fixtures/assessmentCenter'
import { Menu } from './Menu'
import { Picker } from './Picker'
import { VendorLogo } from './VendorLogo'

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
  const [searching, setSearching] = useState(false)
  const field = useRef<HTMLInputElement>(null)
  const searchButton = useRef<HTMLButtonElement>(null)
  const toggleSearch = () => {
    if (searching) {
      setQuery('')
      searchButton.current?.focus({ preventScroll: true })
    } else window.setTimeout(() => field.current?.focus({ preventScroll: true }), 200)
    setSearching(!searching)
  }
  const q = query.trim().toLowerCase()
  const matches = (vendor: string) => !q || vendor.toLowerCase().includes(q)
  const past = resolvedAssessments.filter((r) => matches(r.vendor)).sort(compareHistory[sort])
  const rows = activeAssessments
    .filter((a) => matches(a.vendor) && (filter === 'all' || a.status === filter))
    .sort((a, b) => statusRank[a.status] - statusRank[b.status])

  return (
    <aside className="s-ac-list" aria-label="Assessments" style={{ width }}>
      <div className="s-ac-bar">
        <Picker
          label="View"
          value={tab}
          options={[
            { id: 'active', label: 'Active', count: activeAssessments.length },
            { id: 'history', label: 'History', count: RESOLVED_COUNT },
          ]}
          onChange={setTab}
        />
        {tab === 'active' ? (
          <Picker label="Filter assessments" value={filter} options={filters} onChange={setFilter} />
        ) : (
          <Picker label="Sort history" value={sort} options={historySorts} onChange={setSort} />
        )}
        <span className="s-ac-bar-end">
          <button ref={searchButton} type="button" className="s-ghost s-ac-more" aria-label="Search assessments" aria-expanded={searching} aria-controls="s-ac-search" onClick={toggleSearch}>
            <Search size={14} />
          </button>
          <Menu
            below
            label="Assessment actions"
            trigger={({ open, toggle }) => (
              <button type="button" className="s-ghost s-ac-more" aria-haspopup="menu" aria-expanded={open} aria-label="More actions" onClick={toggle}>
                <MoreHorizontal size={16} />
              </button>
            )}
          >
            {(close) =>
              ['Start assessment', 'Export list'].map((l) => (
                <button key={l} type="button" role="menuitem" className="s-menu-item" onClick={close}>
                  {l}
                </button>
              ))
            }
          </Menu>
        </span>
      </div>

      <div id="s-ac-search" className="s-ac-search" data-open={searching} inert={!searching}>
        <div className="s-ac-search-clip">
          <div className="s-ac-search-field">
            <label className="s-search">
              <Search size={14} />
              <input ref={field} type="search" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && (e.stopPropagation(), toggleSearch())} aria-label="Search assessments" />
            </label>
          </div>
        </div>
      </div>

      <div className="s-ac-scroll" data-lenis-prevent>
        {tab === 'active' ? (
          <ul className="s-ac-items">
            {rows.map((a) => (
              <li key={a.vendor}>
                <button type="button" className="s-ac-item" data-selected={selected === a.vendor} aria-current={selected === a.vendor ? 'true' : undefined} onClick={() => onSelect(a.vendor)}>
                  <VendorLogo name={a.vendor} size={28} />
                  <span className="s-ac-item-main">
                    <b>{a.vendor}</b>
                    <span className="s-ac-tag" data-status={a.status}>
                      {a.status === 'agent' && <CubeLoader />}
                      {statusLabel[a.status]}
                    </span>
                  </span>
                  <span className="s-ac-item-meta" data-live={a.meta === 'Just now'}>
                    {a.meta}
                  </span>
                </button>
              </li>
            ))}
            {rows.length === 0 && <li className="s-empty">{q ? `No match for “${query.trim()}”` : filter === 'all' ? 'No active assessments' : emptyFilter[filter]}</li>}
          </ul>
        ) : (
          <ul className="s-ac-items">
            {past.map((r) => (
              <li key={r.vendor}>
                <button type="button" className="s-ac-item" data-selected={selected === r.vendor} aria-current={selected === r.vendor ? 'true' : undefined} onClick={() => onSelect(r.vendor)}>
                  <VendorLogo name={r.vendor} size={28} />
                  <span className="s-ac-item-main">
                    <b>{r.vendor}</b>
                    <span className="s-ac-result" data-result={resultTone(r.result)}>
                      {r.result}
                    </span>
                  </span>
                  <span className="s-ac-item-meta">{r.when}</span>
                </button>
              </li>
            ))}
            {past.length === 0 && <li className="s-empty">{q ? `No match for “${query.trim()}”` : 'No finished assessments'}</li>}
          </ul>
        )}
      </div>
      {children}
    </aside>
  )
}
