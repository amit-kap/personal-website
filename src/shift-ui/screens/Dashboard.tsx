import { assessments, assessmentTiles, findings, findingTiles, inventoryTiles } from '../fixtures/dashboard'
import { Kebab, Refresh } from '../icons'
import { AssessmentRow } from '../primitives/AssessmentRow'
import { AreaChart } from '../primitives/AreaChart'
import { BarChart } from '../primitives/BarChart'
import { CalendarWidget } from '../primitives/CalendarWidget'
import { FindingRow } from '../primitives/FindingRow'
import { Nav } from '../primitives/Nav'
import { Panel } from '../primitives/Panel'
import { StatTile } from '../primitives/StatTile'
import { Treemap } from '../primitives/Treemap'

/* The Shift home dashboard, without the Ask Shift panel. */
export function Dashboard() {
  return (
    <>
      <Nav active="Home" />
      <div className="s-page">
        <div className="s-title-row">
          <h2 className="s-title s-head">Home</h2>
          <div className="s-meta">
            <button type="button" className="s-icon-btn s-refresh">
              <Refresh size={12} />6 hours ago
            </button>
            <button type="button" className="s-icon-btn" aria-label="More">
              <Kebab size={14} />
            </button>
          </div>
        </div>

        <div className="s-group-label">Inventory</div>
        <div className="s-tiles">
          {inventoryTiles.map((t) => (
            <StatTile key={t.label} {...t} />
          ))}
        </div>
        <div className="s-panels">
          <Panel title="Data Access" insight="8 access categories detected across 19 vendors — 13 with critical-tier access">
            <Treemap />
          </Panel>
          <Panel title="Vendor Rating Trend" insight="5 low-risk vendors vs 3 critical-risk vendors in current portfolio">
            <BarChart />
          </Panel>
        </div>

        <div className="s-group-label" style={{ marginTop: 28 }}>
          Findings
        </div>
        <div className="s-tiles">
          {findingTiles.map((t) => (
            <StatTile key={t.label} {...t} />
          ))}
        </div>
        <div className="s-panels">
          <Panel title="Recent Findings" insight="5 critical findings — review immediately">
            <div className="s-rows">
              {findings.map((f) => (
                <FindingRow key={f.vendor} {...f} />
              ))}
            </div>
          </Panel>
          <Panel title="Threat Detection" insight="Alert volume up 2x over the last 8 weeks — spike driven by new shadow vendor detections">
            <AreaChart />
          </Panel>
        </div>

        <div className="s-group-label" style={{ marginTop: 28 }}>
          Assessments
        </div>
        <div className="s-tiles">
          {assessmentTiles.map((t) => (
            <StatTile key={t.label} {...t} />
          ))}
        </div>
        <div className="s-panels">
          <Panel title="Active Assessments" insight="1 vendor reply needs your review">
            <div className="s-rows">
              {assessments.map((a) => (
                <AssessmentRow key={a.vendor} {...a} />
              ))}
            </div>
          </Panel>
          <Panel title="Upcoming Assessments" insight="5 assessments start or fall due in June">
            <CalendarWidget />
          </Panel>
        </div>
        <div className="s-footline" />
      </div>
    </>
  )
}
