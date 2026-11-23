/* A ring split into coloured parts, with the total in the middle. `start` is
   where the first part begins, in degrees clockwise from the top. */
export function Donut({
  parts,
  total,
  start = 0,
  size = 92,
}: {
  parts: { label: string; value: number; color: string }[]
  total: number
  start?: number
  size?: number
}) {
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const sum = parts.reduce((n, p) => n + p.value, 0) || 1
  const lens = parts.map((p) => (p.value / sum) * c)
  const starts = lens.map((_, i) => lens.slice(0, i).reduce((n, l) => n + l, 0))
  return (
    <div className="s-donut" style={{ width: size, height: size }} role="img" aria-label={`${total} total`}>
      <svg width={size} height={size} style={{ transform: `rotate(${start - 90}deg)` }}>
        {parts.map((p, i) =>
          p.value > 0 ? (
            <circle
              key={p.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth={stroke}
              strokeDasharray={`${lens[i]} ${c - lens[i]}`}
              strokeDashoffset={-starts[i]}
            />
          ) : null,
        )}
      </svg>
      <div className="s-donut-center">
        <b className="s-head">{total}</b>
        <span>TOTAL</span>
      </div>
    </div>
  )
}
