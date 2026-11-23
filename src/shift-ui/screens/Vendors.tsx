import { useState } from 'react'
import { vendorsAsk } from '../fixtures/ask'
import { aiExposure, unmanaged } from '../fixtures/vendors'
import { Check, MoreHorizontal } from '../icons'
import { ColumnChart } from '../primitives/ColumnChart'
import { Menu } from '../primitives/Menu'
import { Donut } from '../primitives/Donut'
import { RiskBars } from '../primitives/RiskBars'
import { CountPill, SummaryCard } from '../primitives/SummaryCard'
import { VendorsTable } from '../primitives/VendorsTable'
import { ShiftFrame } from './ShiftFrame'

/* The Shift Vendors page: four summary cards over a searchable, sortable
   table. Built from the same frame, tokens, charts and badges as the home
   dashboard. */
export function Vendors() {
  /* The page menu can hide the summary widgets, giving the table the room. */
  const [summary, setSummary] = useState(true)
  return (
    <ShiftFrame active="Inventory" script={vendorsAsk}>
      <div className="s-page s-page-fill">
        <div className="s-title-row">
          <h2 className="s-title s-head">Vendors</h2>
          <div className="s-meta">
            <Menu
              below
              label="Page options"
              trigger={({ open, toggle }) => (
                <button type="button" className="s-icon-btn" aria-label="More" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
                  <MoreHorizontal size={16} />
                </button>
              )}
            >
              {(close) => (
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={summary}
                  className="s-menu-item"
                  onClick={() => {
                    setSummary(!summary)
                    close()
                  }}
                >
                  Summary widgets
                  {summary && <Check size={13} />}
                </button>
              )}
            </Menu>
          </div>
        </div>

        <div className="s-sum-collapse" data-open={summary} inert={!summary}>
          <div className="s-sum-clip">
            <div className="s-sum-grid">
              <SummaryCard title="Unmanaged Vendors with Data Access">
                <Donut parts={unmanaged.parts} total={unmanaged.total} start={-90} />
                <div className="s-counts">
                  {unmanaged.parts.map((p) => (
                    <CountPill key={p.label} {...p} />
                  ))}
                </div>
              </SummaryCard>
              <SummaryCard title="Risk Distribution">
                <RiskBars />
              </SummaryCard>
              <SummaryCard title="AI Exposure">
                <Donut parts={aiExposure.parts} total={aiExposure.total} start={-50} />
                <div className="s-counts">
                  {aiExposure.pills.map((label) => {
                    const p = aiExposure.parts.find((x) => x.label === label)!
                    return <CountPill key={label} {...p} />
                  })}
                </div>
              </SummaryCard>
              <SummaryCard title="Identity Sources">
                <ColumnChart />
              </SummaryCard>
            </div>
          </div>
        </div>

        <VendorsTable />
      </div>
    </ShiftFrame>
  )
}
