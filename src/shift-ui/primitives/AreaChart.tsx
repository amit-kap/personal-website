import { threatSeries } from '../fixtures/dashboard'
import { useWidth } from '../useWidth'

const X0 = 20
const BASE = 133
const UNIT = 130 / 24

/* Threat detection: alert volume over four weeks, two series. Fills its
   container. */
export function AreaChart() {
  const [ref, W] = useWidth<HTMLDivElement>()
  const xs = [0, 1, 2, 3].map((i) => X0 + (i * (W - X0)) / 3)
  const line = (values: number[]) =>
    values.map((v, i) => `${i ? 'L' : 'M'}${xs[i].toFixed(1)} ${(BASE - v * UNIT).toFixed(1)}`).join(' ')
  const a = line(threatSeries.newVendors)
  const b = line(threatSeries.other)
  const anchors = ['start', 'middle', 'middle', 'end'] as const
  return (
    <div ref={ref} className="s-chart" style={{ height: 156 }}>
      {W > 0 && (
        <svg width={W} height={156} role="img" aria-label="Threat detection">
          <defs>
            <linearGradient id="s-area-a" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#f5b45a" stopOpacity="0.35" />
              <stop offset="1" stopColor="#f5b45a" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="s-area-b" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#8a8f9c" stopOpacity="0.16" />
              <stop offset="1" stopColor="#7c5cd6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {threatSeries.ticks.map((v) => (
            <g key={v}>
              <line x1={X0 - 6} x2={W} y1={BASE - v * UNIT} y2={BASE - v * UNIT} stroke="var(--s-line-soft)" />
              <text className="s-axis" x={3} y={BASE - v * UNIT - 3}>
                {v}
              </text>
            </g>
          ))}
          <path d={`${a} L${xs[3]} ${BASE} L${xs[0]} ${BASE}Z`} fill="url(#s-area-a)" />
          <path d={`${b} L${xs[3]} ${BASE} L${xs[0]} ${BASE}Z`} fill="url(#s-area-b)" />
          <path d={a} fill="none" stroke="#e7a64c" strokeWidth="1.2" />
          <path d={b} fill="none" stroke="#8a8f9c" strokeWidth="1.2" />
          {threatSeries.xLabels.map((l, i) => (
            <text key={l} className="s-axis" x={i === 3 ? W - 7 : xs[i]} y={146} textAnchor={anchors[i]}>
              {l}
            </text>
          ))}
        </svg>
      )}
    </div>
  )
}
