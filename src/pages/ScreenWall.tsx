import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'

/* A tilted wall of product screens that drifts up and down, after herdr.dev's hero.
   Every tile opens a lightbox that steps through all the screens. */

const base = import.meta.env.BASE_URL
const src = (file: string, tile = false) => `${base}home01/wall/${file}${tile ? '-tile' : ''}.webp`

type Product = { name: string; href?: string }
const SHIFT: Product = { name: 'Shift', href: '/work/shift' }
const VERITI: Product = { name: 'Veriti', href: '/work/veriti' }
const CHECKPOINT: Product = { name: 'Check Point', href: '/work/checkpoint' }
const ONYXIA: Product = { name: 'Onyxia' }

type Screen = { file: string; label: string; product: Product }
const SCREENS: Screen[] = [
  { file: 'shift-01-shift-dashboard', label: 'Dashboard', product: SHIFT },
  { file: 'veriti-02', label: 'Overview', product: VERITI },
  { file: 'checkpoint-05-dashboard', label: 'Dashboard', product: CHECKPOINT },
  { file: 'shift-05-threat-center', label: 'Threat center', product: SHIFT },
  { file: 'onyxia-01-SSM-1', label: 'Security program', product: ONYXIA },
  { file: 'veriti-03', label: 'Posture', product: VERITI },
  { file: 'shift-04-vendor-access-graph', label: 'Vendor access graph', product: SHIFT },
  { file: 'checkpoint-01-details', label: 'Details', product: CHECKPOINT },
  { file: 'veriti-04', label: 'Insights', product: VERITI },
  { file: 'shift-02-inventory-vendors-page', label: 'Vendor inventory', product: SHIFT },
  { file: 'onyxia-03-frameworks', label: 'Frameworks', product: ONYXIA },
  { file: 'checkpoint-04-timeline', label: 'Timeline', product: CHECKPOINT },
  { file: 'veriti-05', label: 'Indicators', product: VERITI },
  { file: 'shift-07-assessment-flow-1', label: 'Assessment flow', product: SHIFT },
  { file: 'onyxia-04-insights', label: 'Insights', product: ONYXIA },
  { file: 'checkpoint-03-summary', label: 'Summary', product: CHECKPOINT },
  { file: 'veriti-06', label: 'Am I protected?', product: VERITI },
  { file: 'shift-06-integrations-grid', label: 'Integrations', product: SHIFT },
  { file: 'onyxia-05-p-hub', label: 'Program hub', product: ONYXIA },
  { file: 'checkpoint-06-mainPage', label: 'Main page', product: CHECKPOINT },
  { file: 'veriti-07', label: 'Settings', product: VERITI },
  { file: 'onyxia-06-report-1', label: 'Report', product: ONYXIA },
]

/* Each column drifts at about 7px a second, a little different per column so they never line up,
   alternating up and down. */
const DURATIONS = ['510s', '480s', '570s', '450s', '540s']

/* The middle column is mainly Shift with two Veriti screens (a Veriti after every three Shift);
   everything else is dealt round-robin into the other columns. */
const columnsOf = (n: number) => {
  const all = SCREENS.map((s, i) => ({ ...s, i }))
  const shift = all.filter((s) => s.product === SHIFT)
  const veriti = all.filter((s) => s.product === VERITI).slice(0, 2)
  const middle = shift.flatMap((s, k) => (k % 3 === 2 && veriti[(k - 2) / 3] ? [s, veriti[(k - 2) / 3]] : [s]))
  const rest = all.filter((s) => !middle.includes(s))
  const mid = Math.floor(n / 2)
  const sides = Array.from({ length: n - 1 }, (_, c) => rest.filter((_, i) => i % (n - 1) === c))
  return [...sides.slice(0, mid), middle, ...sides.slice(mid)]
}

/* The next or previous screen, wrapping round at either end. */
const move = (i: number | null, d: number) => (i === null ? i : (i + d + SCREENS.length) % SCREENS.length)

export default function ScreenWall({ columns = 3 }: { columns?: number }) {
  const COLUMNS = columnsOf(columns)
  const [open, setOpen] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)

  const show = (i: number) => {
    setOpen(i)
    dialog.current?.showModal()
  }
  const step = (d: number) => setOpen((i) => move(i, d))

  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setOpen((i) => move(i, 1))
      if (e.key === 'ArrowLeft') setOpen((i) => move(i, -1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const current = open === null ? null : SCREENS[open]

  return (
    <>
      <div className="wall-wrap">
        <div className="wall">
          {COLUMNS.map((col, c) => (
            <div key={c} className={`wall-col${c % 2 ? ' down' : ''}`} style={{ '--d': DURATIONS[c] } as CSSProperties}>
              {/* Each column is its list four times: the two halves are identical, so moving it by half loops without
                  a seam, and half is still taller than the view, so no gap shows. Copies are hidden from assistive tech. */}
              {[0, 1, 2, 3].map((copy) =>
                col.map((s) => (
                  <button
                    key={`${copy}-${s.file}`}
                    className="wall-tile"
                    onClick={() => show(s.i)}
                    aria-label={copy ? undefined : `View ${s.product.name}: ${s.label}`}
                    aria-hidden={copy ? true : undefined}
                    tabIndex={copy ? -1 : 0}
                  >
                    <img src={src(s.file, true)} alt="" width={720} height={450} loading="lazy" decoding="async" />
                  </button>
                )),
              )}
            </div>
          ))}
        </div>
        <div className="wall-shade" aria-hidden="true" />
      </div>

      <dialog
        ref={dialog}
        className="lightbox"
        onClose={() => {
          setOpen(null)
          // The dialog hands focus back to the tile that opened it, which would leave it ringed, in colour and its
          // column paused. Drop that focus and any text selection so the page comes back with nothing selected.
          ;(document.activeElement as HTMLElement | null)?.blur()
          window.getSelection()?.removeAllRanges()
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close()
        }}
        aria-label={current ? `${current.product.name}: ${current.label}` : 'Screen'}
      >
        <button className="lb-close" onClick={() => dialog.current?.close()}>
          Close · Esc
        </button>
        <button className="lb-arrow prev" onClick={() => step(-1)} aria-label="Previous screen">
          ←
        </button>
        <button className="lb-arrow next" onClick={() => step(1)} aria-label="Next screen">
          →
        </button>
        {current && (
          <figure>
            <img src={src(current.file)} alt={`${current.product.name}: ${current.label}`} />
            <figcaption>
              <b>{current.product.name}</b>
              <span>{current.label}</span>
              <span className="lb-grow" />
              <span className="lb-count">
                {open! + 1} / {SCREENS.length}
              </span>
              {current.product.href && (
                <Link to={current.product.href} onClick={() => dialog.current?.close()}>
                  See the work →
                </Link>
              )}
            </figcaption>
          </figure>
        )}
      </dialog>
    </>
  )
}
