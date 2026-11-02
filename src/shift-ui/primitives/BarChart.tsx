import { ratingTrend, type Severity } from '../fixtures/dashboard'
import { useWidth } from '../useWidth'

const color: Record<Severity, string> = {
  critical: 'var(--s-critical)',
  high: 'var(--s-high)',
  elevated: 'var(--s-elevated)',
  moderate: 'var(--s-moderate)',
  low: 'var(--s-low)',
}

const BASE = 138
const UNIT = 16.5
const LEFT = 14

/* Vendor rating trend: last period (grey) beside the current one. Fills its
   container; bars and labels re-space with the width. */
export function BarChart() {
  const [ref, w] = useWidth<HTMLDivElement>()
  const slot = (w - LEFT) / ratingTrend.length
  const bar = Math.max(14, Math.min(40, slot / 3.4))
  return (
    <div ref={ref} className="s-chart" style={{ height: 156 }}>
      {w > 0 && (
        <svg width={w} height={156} role="img" aria-label="Vendor rating trend">
          {[0, 2, 4, 6, 8].map((v) => (
            <g key={v}>
              <line x1={LEFT} x2={w} y1={BASE - v * UNIT} y2={BASE - v * UNIT} stroke="var(--s-line-soft)" strokeDasharray={v === 0 ? undefined : '2 3'} />
              <text className="s-axis" x={3} y={BASE - v * UNIT + 3}>
                {v}
              </text>
            </g>
          ))}
          {ratingTrend.map((d, i) => {
            const c = LEFT + (i + 0.5) * slot
            const single = d.prev === 0
            const nowX = single ? c - bar / 2 : c
            return (
              <g key={d.label}>
                {!single && <rect className="s-bar" x={c - bar} y={BASE - d.prev * UNIT} width={bar} height={d.prev * UNIT} fill="var(--s-prev)" />}
                <rect className="s-bar" x={nowX} y={BASE - d.now * UNIT} width={bar} height={d.now * UNIT} fill={color[d.severity]} />
                <text className="s-axis" x={c} y={151} textAnchor="middle" style={{ fill: color[d.severity] }}>
                  {d.label}
                </text>
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}
