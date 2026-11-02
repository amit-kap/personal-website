import { ArrowDown, ArrowUp } from '../icons'
import { useHighlighted } from '../highlight'
import { slugify } from '../slug'
import type { StatTileData } from '../fixtures/dashboard'

export function StatTile({ value, trend, label, sub, delta, tone }: StatTileData) {
  const id = `tile-${slugify(label)}`
  const lit = useHighlighted(id)
  const Arrow = trend === 'up' ? ArrowUp : ArrowDown
  return (
    <div className="s-card s-tile" data-widget={id} data-highlight={lit}>
      <div className="s-tile-num s-head">
        {value}
        <span className="s-delta" data-tone={tone} data-tip={delta} aria-label={delta} tabIndex={0}>
          <Arrow size={20} />
        </span>
      </div>
      <div className="s-tile-label">{label}</div>
      <div className="s-tile-sub">{sub}</div>
    </div>
  )
}
