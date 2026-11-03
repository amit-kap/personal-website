/* Small key for a chart, shown in the panel header. */
export function ChartLegend({ items }: { items: { label: string; swatch: string }[] }) {
  return (
    <span className="s-legend">
      {items.map((i) => (
        <span key={i.label} className="s-legend-item">
          <i style={{ background: i.swatch }} />
          {i.label}
        </span>
      ))}
    </span>
  )
}
