import { useMemo, useState } from 'react'
import { PAGE_SIZE, TOTAL_ROWS, vendors, type Grade, type VendorRow } from '../fixtures/vendors'
import { useHighlighted } from '../highlight'
import { ArrowDown, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Columns, Plus, Search, ShiftMark } from '../icons'
import { vendorDetails } from '../fixtures/vendorDetail'
import { slugify } from '../slug'
import { VendorDetail } from './VendorDetail'
import { VendorLogo } from './VendorLogo'

type SortKey = 'grade' | 'name' | 'industry' | 'ai' | 'governance' | 'procurement'

const gradeRank: Record<Grade, number> = { F: 0, D: 1, C: 2, B: 3, A: 4 }
const aiRank = { Critical: 0, High: 1, Medium: 2, Low: 3 } as const

const compare: Record<SortKey, (a: VendorRow, b: VendorRow) => number> = {
  grade: (a, b) => gradeRank[a.grade] - gradeRank[b.grade],
  name: (a, b) => a.name.localeCompare(b.name),
  industry: (a, b) => a.industry.localeCompare(b.industry),
  ai: (a, b) => (a.ai ? aiRank[a.ai] : 9) - (b.ai ? aiRank[b.ai] : 9),
  governance: (a, b) => (a.governance ?? '~').localeCompare(b.governance ?? '~'),
  procurement: (a, b) => (a.procurement ?? '~').localeCompare(b.procurement ?? '~'),
}

const columns: { key: SortKey | null; label: string }[] = [
  { key: 'grade', label: 'Rating' },
  { key: 'name', label: 'Vendor Name' },
  { key: 'industry', label: 'Industry' },
  { key: null, label: 'Identity Source' },
  { key: null, label: 'Detected Access' },
  { key: 'ai', label: 'AI Exposure' },
  { key: 'governance', label: 'Governance Status' },
  { key: 'procurement', label: 'Procurement Status' },
]

const dash = <span className="s-dim">-</span>

function Row({ v, onOpen }: { v: VendorRow; onOpen?: (anchor: HTMLElement) => void }) {
  const id = `vendor-${slugify(v.name)}`
  const lit = useHighlighted(id)
  return (
    <div
      className="s-trow"
      role="row"
      data-widget={id}
      data-highlight={lit}
      data-detail={!!onOpen}
      tabIndex={onOpen ? 0 : undefined}
      aria-haspopup={onOpen ? 'dialog' : undefined}
      onClick={onOpen && ((e) => onOpen(e.currentTarget))}
      onKeyDown={onOpen && ((e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen(e.currentTarget)))}
    >
      <span className="s-tcell s-tcell-grade">
        <span className="s-grade" data-grade={v.grade}>
          {v.grade}
        </span>
      </span>
      <span className="s-tcell s-vendor">
        <VendorLogo name={v.name} size={20} />
        <span className="s-tcell-text">{v.name}</span>
      </span>
      <span className="s-tcell">
        <span className="s-tcell-text">{v.industry}</span>
      </span>
      <span className="s-tcell s-ids">
        {v.identity.length ? v.identity.map((s) => <VendorLogo key={s} name={s} size={18} />) : dash}
      </span>
      <span className="s-tcell">
        {v.access ? (
          <>
            <span className="s-badge" data-tone={v.access.tone}>
              {v.access.label}
            </span>
            {v.access.more ? <span className="s-more">+{v.access.more}</span> : null}
          </>
        ) : (
          dash
        )}
      </span>
      <span className="s-tcell">
        {v.ai ? (
          <span className="s-badge" data-tone={{ Low: 'green', Medium: 'yellow', High: 'orange', Critical: 'red' }[v.ai]}>
            {v.ai}
          </span>
        ) : (
          dash
        )}
      </span>
      {[v.governance, v.procurement].map((s, i) => (
        <span key={i} className="s-tcell">
          {s ? (
            <>
              <ShiftMark size={16} />
              {s}
            </>
          ) : (
            dash
          )}
        </span>
      ))}
    </div>
  )
}

/* Search, the vendor table with sortable headers, and the paging footer. */
export function VendorsTable() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState<{ name: string; root: HTMLElement; from: HTMLElement } | null>(null)
  const closeDetail = () => {
    open?.from.focus({ preventScroll: true })
    setOpen(null)
  }
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'grade', dir: 1 })

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return vendors
      .filter((v) => !q || v.name.toLowerCase().includes(q))
      .slice()
      .sort((a, b) => compare[sort.key](a, b) * sort.dir)
  }, [query, sort])

  const pages = Math.ceil(TOTAL_ROWS / PAGE_SIZE)
  const count = query.trim() ? rows.length : TOTAL_ROWS
  /* Pages after the first are mock: the control moves, the rows stay. */
  const shown = [1, 2, 3, pages].filter((n, i, all) => all.indexOf(n) === i)

  const toggle = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }))

  return (
    <>
      <div className="s-toolbar">
        <label className="s-search">
          <Search size={14} />
          <input type="search" placeholder="Search..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search vendors" />
        </label>
        <button type="button" className="s-ghost">
          <Plus size={14} />
          Add Filter
        </button>
        <span className="s-toolbar-right">
          <button type="button" className="s-solid">
            <Plus size={14} />
            Add Vendor
          </button>
          <button type="button" className="s-icon-btn" aria-label="Columns">
            <Columns size={16} />
          </button>
          <span className="s-rowcount">{count} {count === 1 ? 'row' : 'rows'}</span>
        </span>
      </div>

      <div className="s-table-scroll">
        <div className="s-table" role="table" aria-label="Vendors">
          <div className="s-thead" role="row">
            {columns.map((c) => (
              <span key={c.label} className="s-th" role="columnheader">
                {c.key ? (
                  <button type="button" className="s-sort" onClick={() => toggle(c.key!)} data-active={sort.key === c.key}>
                    {c.label}
                    {c.key === 'grade' && sort.key === 'grade' ? (
                      <ArrowDown size={12} style={{ transform: sort.dir === 1 ? undefined : 'rotate(180deg)' }} />
                    ) : (
                      <ChevronsUpDown size={12} />
                    )}
                  </button>
                ) : (
                  c.label
                )}
              </span>
            ))}
          </div>
          {rows.map((v) => (
            <Row
              key={v.name}
              v={v}
              onOpen={vendorDetails[v.name] ? (from) => setOpen({ name: v.name, root: from.closest<HTMLElement>('.shift-ui')!, from }) : undefined}
            />
          ))}
          {rows.length === 0 && <div className="s-empty">No vendors match “{query}”.</div>}
        </div>
      </div>

      {open && <VendorDetail detail={vendorDetails[open.name]} root={open.root} onClose={closeDetail} />}

      <div className="s-pager">
        <span className="s-pager-left">
          Results Per Page
          <span className="s-select">
            20
            <ChevronDown size={12} />
          </span>
        </span>
        <span className="s-pager-right">
          <button type="button" className="s-pager-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft size={12} />
            Prev
          </button>
          {shown.map((n, i) => (
            <span key={n} className="s-pager-nums">
              {i > 0 && n - shown[i - 1] > 1 && <span className="s-dim">…</span>}
              <button type="button" className="s-page-num" data-active={n === page} aria-current={n === page ? 'page' : undefined} onClick={() => setPage(n)}>
                {n}
              </button>
            </span>
          ))}
          <button type="button" className="s-pager-btn" disabled={page === pages} onClick={() => setPage(page + 1)}>
            Next
            <ChevronRight size={12} />
          </button>
        </span>
      </div>
    </>
  )
}
