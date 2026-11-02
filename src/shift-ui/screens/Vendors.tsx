import { vendorsAsk } from '../fixtures/ask'
import { aiExposure, unmanaged } from '../fixtures/vendors'
import { Kebab } from '../icons'
import { ColumnChart } from '../primitives/ColumnChart'
import { Donut } from '../primitives/Donut'
import { RiskBars } from '../primitives/RiskBars'
import { CountPill, SummaryCard } from '../primitives/SummaryCard'
import { VendorsTable } from '../primitives/VendorsTable'
import { ShiftFrame } from './ShiftFrame'

/* The Shift Vendors page: four summary cards over a searchable, sortable
   table. Built from the same frame, tokens, charts and badges as the home
   dashboard. */
export function Vendors() {
  return (
    <ShiftFrame active="Inventory" script={vendorsAsk}>
      <div className="s-page">
        <div className="s-title-row">
          <h2 className="s-title s-head">Vendors</h2>
          <div className="s-meta">
            <button type="button" className="s-icon-btn" aria-label="More">
              <Kebab size={14} />
            </button>
          </div>
        </div>

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

        <VendorsTable />
      </div>
    </ShiftFrame>
  )
}
