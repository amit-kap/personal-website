import { treemap, type TreemapTile } from '../fixtures/dashboard'

const fill: Record<TreemapTile['severity'], string> = {
  critical: 'var(--s-critical)',
  high: 'var(--s-high)',
  elevated: 'var(--s-elevated)',
}

export function Treemap() {
  return (
    <div className="s-treemap">
      {treemap.map((t) => (
        <div
          key={t.name}
          className="s-tm"
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
