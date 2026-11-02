import { ArrowDown, ArrowUp } from '../icons'
import type { StatTileData } from '../fixtures/dashboard'

export function StatTile({ value, trend, label, sub }: StatTileData) {
  const Arrow = trend === 'up' ? ArrowUp : ArrowDown
  return (
    <div className="s-card s-tile">
      <div className="s-tile-num s-head">
        {value}
        <Arrow size={20} style={{ color: 'var(--s-muted)' }} />
      </div>
      <div className="s-tile-label">{label}</div>
      <div className="s-tile-sub">{sub}</div>
    </div>
  )
}
