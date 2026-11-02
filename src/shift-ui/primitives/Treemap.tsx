import { useWidth } from '../useWidth'
import { treemap, type TreemapTile } from '../fixtures/dashboard'

const fill: Record<TreemapTile['severity'], string> = {
  critical: 'var(--s-critical)',
  high: 'var(--s-high)',
  elevated: 'var(--s-elevated)',
}

/* Tiles narrower than this keep their label for hover. */
const MIN_LABEL = 70

export function Treemap() {
  const [ref, w] = useWidth<HTMLDivElement>()
  return (
    <div ref={ref} className="s-treemap">
      {treemap.map((t) => (
        <div
          key={t.name}
          className="s-tm"
          data-compact={w > 0 && (t.w / 696) * w < MIN_LABEL}
          data-label={`${t.name} · ${t.vendors} vendors (${t.pct}%)`}
          style={{
            left: `${(t.x / 696) * 100}%`,
            top: t.y,
            width: `${(t.w / 696) * 100}%`,
            height: t.h,
            background: fill[t.severity],
          }}
        >
          <b>{t.name}</b>
          <span>
            {t.vendors} vendors ({t.pct}%)
          </span>
        </div>
      ))}
    </div>
  )
}
