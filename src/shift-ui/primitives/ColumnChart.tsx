import { identitySources } from '../fixtures/vendors'
import { useWidth } from '../useWidth'

const LEFT = 22
const TOP = 6
const HEIGHT = 74
const MAX = 8

/* Vendors per identity source, as columns. Fills its container. */
export function ColumnChart() {
  const [ref, w] = useWidth<HTMLDivElement>()
  const plot = Math.max(0, w - LEFT - 6)
  const slot = plot / identitySources.length
  const bar = Math.min(38, slot * 0.55)
  const y = (v: number) => TOP + HEIGHT - (v / MAX) * HEIGHT
  return (
    <div ref={ref} className="s-chart s-chart-flat" style={{ height: TOP + HEIGHT + 22 }}>
      {w > 0 && (
        <svg width={w} height={TOP + HEIGHT + 22} role="img" aria-label="Identity sources">
          {[0, 4, 8].map((v) => (
            <g key={v}>
              <line x1={LEFT} x2={w} y1={y(v)} y2={y(v)} stroke={v === 0 ? 'var(--s-ink-2)' : 'var(--s-line-soft)'} strokeDasharray={v === 0 ? undefined : '2 3'} />
              <text className="s-axis" x={2} y={y(v) + 3}>
                {v}
              </text>
            </g>
          ))}
          {identitySources.map((d, i) => (
            <g key={d.label}>
              <rect className="s-bar" x={LEFT + i * slot + (slot - bar) / 2} y={y(d.value)} width={bar} height={TOP + HEIGHT - y(d.value)} fill="#4c7fec" />
              <text className="s-axis" x={LEFT + (i + 0.5) * slot} y={TOP + HEIGHT + 15} textAnchor="middle">
                {d.label}
              </text>
            </g>
          ))}
        </svg>
      )}
    </div>
  )
}
