import type { CSSProperties } from 'react'

/* A plain background of product screens: columns on one tilted plane, drifting up and down in a seamless loop.
   No hover, no clicks; it is decoration only, hidden from assistive tech. */

const base = import.meta.env.BASE_URL
const src = (file: string) => `${base}home01/wall/${file}-tile.webp`

type Screen = { file: string; product: 'shift' | 'veriti' | 'checkpoint' }
const SCREENS: Screen[] = [
  { file: 'shift-01-shift-dashboard', product: 'shift' },
  { file: 'veriti-02', product: 'veriti' },
  { file: 'checkpoint-05-dashboard', product: 'checkpoint' },
  { file: 'shift-05-threat-center', product: 'shift' },
  { file: 'veriti-03', product: 'veriti' },
  { file: 'shift-04-vendor-access-graph', product: 'shift' },
  { file: 'checkpoint-01-details', product: 'checkpoint' },
  { file: 'veriti-04', product: 'veriti' },
  { file: 'shift-02-inventory-vendors-page', product: 'shift' },
  { file: 'checkpoint-04-timeline', product: 'checkpoint' },
  { file: 'veriti-05', product: 'veriti' },
  { file: 'shift-07-assessment-flow-1', product: 'shift' },
  { file: 'checkpoint-03-summary', product: 'checkpoint' },
  { file: 'veriti-06', product: 'veriti' },
  { file: 'shift-06-integrations-grid', product: 'shift' },
  { file: 'checkpoint-06-mainPage', product: 'checkpoint' },
  { file: 'veriti-07', product: 'veriti' },
]

/* Each column drifts at about 7px a second, a little different per column so they never line up,
   alternating up and down. */
const DURATIONS = ['510s', '480s', '570s', '450s', '540s']

/* Shift and Veriti lead, on the side the text covers least. The right column is Shift and Veriti, alternating;
   the middle one has the other Shift screens, each followed by another product; the left column takes the rest.
   Everything outside Shift is first mixed product by product, so no product repeats down a column. */
const columnsOf = (n: number) => {
  const shift = SCREENS.filter((s) => s.product === 'shift')
  const others = SCREENS.filter((s) => s.product !== 'shift')
  const byProduct = ['veriti', 'checkpoint'].map((p) => others.filter((s) => s.product === p))
  const mixed = Array.from({ length: Math.max(...byProduct.map((g) => g.length)) }, (_, i) => byProduct.map((g) => g[i])).flat().filter(Boolean) as Screen[]
  const veriti = mixed.filter((s) => s.product === 'veriti').slice(0, Math.ceil(shift.length / 2))
  const right = shift.filter((_, i) => i % 2 === 0).flatMap((s, k) => [s, veriti[k]]).filter(Boolean)
  const rest = mixed.filter((s) => !veriti.includes(s))
  const middleShift = shift.filter((_, i) => i % 2 === 1)
  const middle = middleShift.flatMap((s, k) => [s, rest[k]]).filter(Boolean)
  const left = rest.slice(middleShift.length)
  const sides = Array.from({ length: n - 2 }, (_, c) => left.filter((_, i) => i % (n - 2) === c))
  return [...sides, middle, right]
}

export default function ScreenWall({ columns = 3 }: { columns?: number }) {
  return (
    <div className="wall-wrap" aria-hidden="true">
      <div className="wall">
        {columnsOf(columns).map((col, c) => (
          <div key={c} className={`wall-col${c % 2 ? ' down' : ''}`} style={{ '--d': DURATIONS[c] } as CSSProperties}>
            {/* Each column is its list four times: the two halves are identical, so moving it by half loops without
                a seam, and half is still taller than the view, so no gap shows. */}
            {[0, 1, 2, 3].map((copy) =>
              col.map((s) => (
                <div key={`${copy}-${s.file}`} className="wall-tile">
                  <img src={src(s.file)} alt="" width={720} height={450} loading="lazy" decoding="async" />
                </div>
              )),
            )}
          </div>
        ))}
      </div>
      <div className="wall-shade" />
    </div>
  )
}
