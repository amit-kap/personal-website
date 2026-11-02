import { useMemo, useState } from 'react'
import { vendors, type Grade, type VendorRow } from '../fixtures/vendors'
import { useHighlighted } from '../highlight'
import { ArrowDown, ChevronDown, ChevronLeft, ChevronRight, ChevronsUpDown, Columns, Plus, Search, ShiftMark } from '../icons'
import { slugify } from '../slug'
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

function Row({ v }: { v: VendorRow }) {
  const id = `vendor-${slugify(v.name)}`
  const lit = useHighlighted(id)
  return (
    <div className="s-trow" role="row" data-widget={id} data-highlight={lit}>
      <span className="s-tcell s-tcell-grade">
        <span className="s-grade" data-grade={v.grade}>
          {v.grade}
        </span>
      </span>
      <span className="s-tcell s-vendor">
        <VendorLogo name={v.name} size={16} />
        <span className="s-tcell-text">{v.name}</span>
      </span>
      <span className="s-tcell">
        <span className="s-tcell-text">{v.industry}</span>
      </span>
      <span className="s-tcell s-ids">
        {v.identity.length ? v.identity.map((s) => <VendorLogo key={s} name={s} size={16} />) : dash}
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
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'grade', dir: 1 })

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return vendors
      .filter((v) => !q || v.name.toLowerCase().includes(q))
      .slice()
      .sort((a, b) => compare[sort.key](a, b) * sort.dir)
  }, [query, sort])

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
          <span className="s-rowcount">{rows.length} {rows.length === 1 ? 'row' : 'rows'}</span>
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
            <Row key={v.name} v={v} />
          ))}
          {rows.length === 0 && <div className="s-empty">No vendors match “{query}”.</div>}
        </div>
      </div>

      <div className="s-pager">
        <span className="s-pager-left">
          Results Per Page
          <span className="s-select">
            20
            <ChevronDown size={12} />
          </span>
        </span>
        <span className="s-pager-right">
          <span className="s-pager-btn" data-disabled="true">
            <ChevronLeft size={12} />
            Prev
          </span>
          <span className="s-page-num">1</span>
          <span className="s-pager-btn" data-disabled="true">
            Next
            <ChevronRight size={12} />
          </span>
        </span>
      </div>
    </>
  )
}
