import { useLayoutEffect, useRef, type CSSProperties } from 'react'

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

/* On load the tiles tip in on their X axis around their centre, as one diagonal wave from the top right corner to the
   bottom left. Each tile's delay follows where it sits on screen: how far it is from the top right corner, along the
   diagonal (its height and its distance from the right edge, each as a share of the view, added together). Tiles near
   each other start close together, so the wave flows across the columns instead of stepping from one to the next.
   Only the tiles in view take part; the rest flip at once, out of sight. It waits for the visible screenshots to
   decode (at most 200ms) so no tile flips in empty. */
const FLIP_START = 0 // ms before the first tile
const FLIP_SPREAD = 1000 // ms from the first tile to the last

function useFlipIn() {
  const wall = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = wall.current
    if (!el) return
    const view = el.parentElement!.getBoundingClientRect()
    const right = Math.min(view.right, view.left + 1024, window.innerWidth)
    // Measured flat: while held edge-on (90deg) a tile's box says nothing about where it sits.
    const all = [...el.querySelectorAll<HTMLElement>('.wall-tile')]
    all.forEach((t) => (t.style.animation = 'none'))
    const tiles = all.map((t) => ({ t, r: t.getBoundingClientRect() }))
    all.forEach((t) => (t.style.animation = ''))
    // In view, and not one of the far tiles that pass behind the wall's camera, whose projected box is huge.
    const seen = tiles.filter(({ r }) => r.width < window.innerWidth && r.bottom > 0 && r.top < window.innerHeight && r.right > view.left && r.left < right)
    // Measured on the part of each tile that shows, so the first tile to move is one you can see (the top right ones
    // are partly above the window and cut by the frame's right edge).
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
    const along = ({ r }: { r: DOMRect }) => {
      const x = (clamp(r.left, view.left, right) + clamp(r.right, view.left, right)) / 2
      const y = (clamp(r.top, 0, window.innerHeight) + clamp(r.bottom, 0, window.innerHeight)) / 2
      return y / window.innerHeight + (right - x) / (right - view.left)
    }
    const steps = seen.map(along)
    const first = Math.min(...steps)
    const range = Math.max(...steps) - first || 1
    seen.forEach(({ t }, i) => t.style.setProperty('--flip-delay', `${Math.round(FLIP_START + ((steps[i] - first) / range) * FLIP_SPREAD)}ms`))
    let done = false
    const run = () => {
      if (done) return
      done = true
      el.dataset.flip = 'run'
    }
    // The screenshots in view load now rather than lazily; the wave waits for them at most 200ms.
    const imgs = seen.map(({ t }) => t.querySelector('img')).filter((i): i is HTMLImageElement => !!i)
    imgs.forEach((i) => {
      i.loading = 'eager'
      i.fetchPriority = 'high'
    })
    const timer = setTimeout(run, 200)
    Promise.all(imgs.map((i) => i.decode().catch(() => {}))).then(run)
    return () => clearTimeout(timer)
  }, [])
  return wall
}

export default function ScreenWall({ columns = 3 }: { columns?: number }) {
  const wall = useFlipIn()
  return (
    <div className="wall-wrap" aria-hidden="true">
      <div className="wall" ref={wall}>
        {columnsOf(columns).map((col, c) => (
          <div key={c} className={`wall-col${c % 2 ? ' down' : ''}`} style={{ '--d': DURATIONS[c] } as CSSProperties}>
            {/* Each column is its list repeated an even number of times (at least four): the two halves are identical,
                so moving it by half loops without a seam. Short columns repeat more, so half always holds 8 or more
                tiles and stays taller than the view, so no gap shows. */}
            {Array.from({ length: 2 * Math.max(2, Math.ceil(8 / col.length)) }, (_, copy) =>
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
