import type { CSSProperties } from 'react'

/* A plain background of product screens: columns on one tilted plane, drifting up and down in a seamless loop.
   No hover, no clicks; it is decoration only, hidden from assistive tech. */

const base = import.meta.env.BASE_URL
const src = (file: string) => `${base}home01/wall/${file}-tile.webp`

type Screen = { file: string; product: 'shift' | 'veriti' | 'checkpoint' | 'onyxia' }
const SCREENS: Screen[] = [
  { file: 'shift-01-shift-dashboard', product: 'shift' },
  { file: 'veriti-02', product: 'veriti' },
  { file: 'checkpoint-05-dashboard', product: 'checkpoint' },
  { file: 'shift-05-threat-center', product: 'shift' },
  { file: 'onyxia-01-SSM-1', product: 'onyxia' },
  { file: 'veriti-03', product: 'veriti' },
  { file: 'shift-04-vendor-access-graph', product: 'shift' },
  { file: 'checkpoint-01-details', product: 'checkpoint' },
  { file: 'veriti-04', product: 'veriti' },
  { file: 'shift-02-inventory-vendors-page', product: 'shift' },
  { file: 'onyxia-03-frameworks', product: 'onyxia' },
  { file: 'checkpoint-04-timeline', product: 'checkpoint' },
  { file: 'veriti-05', product: 'veriti' },
  { file: 'shift-07-assessment-flow-1', product: 'shift' },
  { file: 'onyxia-04-insights', product: 'onyxia' },
  { file: 'checkpoint-03-summary', product: 'checkpoint' },
  { file: 'veriti-06', product: 'veriti' },
  { file: 'shift-06-integrations-grid', product: 'shift' },
  { file: 'onyxia-05-p-hub', product: 'onyxia' },
  { file: 'checkpoint-06-mainPage', product: 'checkpoint' },
  { file: 'veriti-07', product: 'veriti' },
  { file: 'onyxia-06-report-1', product: 'onyxia' },
]

/* Each column drifts at about 7px a second, a little different per column so they never line up,
   alternating up and down. */
const DURATIONS = ['510s', '480s', '570s', '450s', '540s']

/* The middle column is mainly Shift with two Veriti screens (a Veriti after every three Shift);
   everything else is dealt round-robin into the other columns. */
const columnsOf = (n: number) => {
  const shift = SCREENS.filter((s) => s.product === 'shift')
  const veriti = SCREENS.filter((s) => s.product === 'veriti').slice(0, 2)
  const middle = shift.flatMap((s, k) => (k % 3 === 2 && veriti[(k - 2) / 3] ? [s, veriti[(k - 2) / 3]] : [s]))
  const rest = SCREENS.filter((s) => !middle.includes(s))
  const mid = Math.floor(n / 2)
  const sides = Array.from({ length: n - 1 }, (_, c) => rest.filter((_, i) => i % (n - 1) === c))
  return [...sides.slice(0, mid), middle, ...sides.slice(mid)]
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
