import { riskDistribution } from '../fixtures/vendors'
import { useWidth } from '../useWidth'

const LEFT = 22
const PITCH = 14
const TOP = 6
const MAX = 8

/* Vendors per rating, as horizontal bars. Fills its container. */
export function RiskBars() {
  const [ref, w] = useWidth<HTMLDivElement>()
  const plot = Math.max(0, w - LEFT - 10)
  const x = (v: number) => LEFT + (v / MAX) * plot
  const bottom = TOP + riskDistribution.length * PITCH + 4
  return (
    <div ref={ref} className="s-chart s-chart-flat" style={{ height: bottom + 20 }}>
      {w > 0 && (
        <svg width={w} height={bottom + 20} role="img" aria-label="Risk distribution">
          {[0, 2, 4, 6, 8].map((v) => (
            <g key={v}>
              {v > 0 && <line x1={x(v)} x2={x(v)} y1={TOP - 4} y2={bottom} stroke="var(--s-line-soft)" strokeDasharray="2 3" />}
              <text className="s-axis" x={x(v)} y={bottom + 13} textAnchor="middle">
                {v}
              </text>
            </g>
          ))}
          {riskDistribution.map((d, i) => (
            <g key={d.grade}>
              <text className="s-axis s-axis-strong" x={2} y={TOP + i * PITCH + 7} style={{ fill: d.color }}>
                {d.grade}
              </text>
              <rect className="s-bar" x={x(0)} y={TOP + i * PITCH} width={Math.max(0, x(d.value) - x(0))} height={7} rx={3.5} fill={d.color} />
            </g>
          ))}
          <line x1={x(0)} x2={x(MAX)} y1={bottom} y2={bottom} stroke="var(--s-ink-2)" />
        </svg>
      )}
    </div>
  )
}
