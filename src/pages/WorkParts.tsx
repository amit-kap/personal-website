import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getCaseStudyBySlug, type ContentImage } from '@/lib/content'
import { tuneOn, type Shown } from './useViewer'
import { logoFor } from '@/lib/workLogos'

/* Shared parts of the work pages (Shift, Veriti): the corner mark, the byline, the tabs under the product, the screens
   bento, the full-screen viewer and the case study preview. Styles live in home01.css. */

const base = import.meta.env.BASE_URL

/** The AK mark fixed in the top left corner: back to home, with a ring that fills as the page scrolls. */
export function CornerMark() {
  const corner = useRef<HTMLAnchorElement>(null)
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      corner.current?.style.setProperty('--read', String(max > 0 ? Math.min(1, window.scrollY / max) : 0))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])
  return (
    <Link className="h01-corner" to="/" aria-label="Back to home" ref={corner}>
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <circle className="h01-ring-track" cx="32" cy="32" r="30" />
        <circle className="h01-ring" cx="32" cy="32" r="30" />
      </svg>
      <img src={`${base}home01/ak-logo.svg`} alt="" width={36} height={20} />
      <ArrowLeft className="h01-corner-arrow" size={20} strokeWidth={2} aria-hidden />
    </Link>
  )
}

/** Company · role · years, one row under the title. */
export function Byline({ company, role, years }: { company: string; role: string; years: string }) {
  return (
    <p className="h01-byline">
      <span className="h01-name">{company}</span>
      <span className="h01-role">·</span>
      <span className="h01-role">{role}</span>
      <span className="h01-role">·</span>
      <span className="h01-role">{years}</span>
    </p>
  )
}

export type Tab = { name: string; desc: string }

/** Tabs under the product: each names a screen and the decision behind it; picking one switches the product above. */
export function WorkTabs({ tabs, active, onPick, label }: { tabs: Tab[]; active: string; onPick: (name: string) => void; label: string }) {
  return (
    <ul className="h01-tabs" aria-label={label}>
      {tabs.map((t) => (
        <li key={t.name}>
          <button
            type="button"
            className="h01-tab"
            aria-pressed={active === t.name}
            onClick={() => {
              onPick(t.name)
              const app = document.querySelector('.h01-app')
              if (app && app.getBoundingClientRect().top < 0) app.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
          >
            <span className="h01-name">{t.name}</span>
            <span className="h01-desc">{t.desc}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/** One bento tile. Every tile has a placement x/y/z that ?tune writes into this file: an image zooms into a focus point
    (x/y in % of the image, zoom z); a looping video (`video` and its `poster`, paths under public/) does the same
    (default 50, 50, 1); a design tile is the company's mark (src/content/experience/<brand>/icon.svg), in white, on its
    brand colour (`original` keeps the mark's own colours), where x/y place the mark in % of the tile and z scales it. */
export type Tile = (
  | { file: string; alt: string; x: number; y: number; z: number }
  | { video: string; poster: string; alt: string; x?: number; y?: number; z?: number }
  | { brand: string; color: string; alt: string; original?: boolean; x?: number; y?: number; z?: number }
) & { size?: TileSize }

/** Tile sizes on the six-column bento: large is four columns by two rows, small two by one, wide three by one. */
export type TileSize = 'lg' | 'sm' | 'wide'

type Focus = { x: number; y: number; z: number }
type Kind = 'file' | 'video' | 'brand'
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))
const round = (n: number) => Math.round(n * 10) / 10
const kindOf = (t: Tile): Kind => ('file' in t ? 'file' : 'video' in t ? 'video' : 'brand')
const keyOf = (t: Tile) => ('file' in t ? t.file : 'video' in t ? t.video : t.brand)
const focusOfTile = (t: Tile): Focus => ({ x: t.x ?? 50, y: t.y ?? 50, z: t.z ?? 1 })

/** The Screens bento: every tile opens full screen when clicked (the design tiles don't).
    Add ?tune to the page's address (dev server only) to tune every tile: drag a tile to move it, scroll over it to
    zoom, press Set on the tile and its values are written into the page's source. */
export function Bento({ tiles, images, onOpen }: { tiles: Tile[]; images: Record<string, ContentImage>; onOpen: (s: Shown) => void }) {
  const tune = tuneOn()
  const [edits, setEdits] = useState<Record<string, Focus>>({})
  const [active, setActive] = useState<string | null>(null)
  const [saved, setSaved] = useState<Record<string, string>>({})
  const drag = useRef<{ key: string; kind: Kind; px: number; py: number; w: number; h: number; start: Focus } | null>(null)

  const focusOf = (t: Tile): Focus => edits[keyOf(t)] ?? focusOfTile(t)
  const set = (kind: Kind, key: string, f: Focus) =>
    setEdits((e) => ({ ...e, [key]: { x: clamp(round(f.x), 0, 100), y: clamp(round(f.y), 0, 100), z: kind === 'brand' ? clamp(round(f.z * 100) / 100, 0.3, 3) : clamp(round(f.z), 1, 12) } }))

  // The wheel needs a non-passive listener to stop the page scrolling while a tile is zoomed.
  const list = useRef<HTMLUListElement>(null)
  const latest = useRef({ tiles, edits })
  useEffect(() => {
    latest.current = { tiles, edits }
  })
  useEffect(() => {
    const el = list.current
    if (!tune || !el) return
    const onWheel = (ev: WheelEvent) => {
      const li = (ev.target as HTMLElement).closest<HTMLElement>('li[data-key]')
      if (!li) return
      ev.preventDefault()
      const key = li.dataset.key!
      const t = latest.current.tiles.find((x) => keyOf(x) === key)
      if (!t) return
      const f = latest.current.edits[key] ?? focusOfTile(t)
      setActive(key)
      set(kindOf(t), key, { ...f, z: f.z * (ev.deltaY < 0 ? 1.06 : 1 / 1.06) })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [tune])

  const onDown = (e: React.PointerEvent, t: Tile) => {
    if (!tune) return
    const r = (e.currentTarget as HTMLElement).closest('li')!.getBoundingClientRect()
    drag.current = { key: keyOf(t), kind: kindOf(t), px: e.clientX, py: e.clientY, w: r.width, h: r.height, start: focusOf(t) }
    setActive(keyOf(t))
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const dx = ((e.clientX - d.px) / d.w) * 100
    const dy = ((e.clientY - d.py) / d.h) * 100
    // A design tile's mark follows the pointer. A screenshot or video shows more of the side you drag towards, so its focus point moves the other way.
    if (d.kind === 'brand') set(d.kind, d.key, { ...d.start, x: d.start.x + dx, y: d.start.y + dy })
    else set(d.kind, d.key, { ...d.start, x: d.start.x - dx / d.start.z, y: d.start.y - dy / d.start.z })
  }
  const onUp = () => {
    drag.current = null
  }

  // Set writes the tile's x, y and z into its page's source (dev server only); the tile then shows Saved.
  const setTile = async (t: Tile) => {
    const key = keyOf(t)
    const page = window.location.pathname.split('/').filter(Boolean).pop() ?? ''
    setSaved((m) => ({ ...m, [key]: 'Saving…' }))
    try {
      const r = await fetch('/__tile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ page, kind: kindOf(t), key, ...focusOf(t) }) })
      setSaved((m) => ({ ...m, [key]: r.ok ? 'Saved' : 'Failed' }))
    } catch {
      setSaved((m) => ({ ...m, [key]: 'Failed' }))
    }
  }

  const handlers = (t: Tile) => ({ onPointerDown: (e: React.PointerEvent) => onDown(e, t), onPointerMove: onMove, onPointerUp: onUp, onPointerCancel: onUp })
  const vars = (f: Focus) => ({ '--x': `${f.x}%`, '--y': `${f.y}%`, '--z': f.z }) as CSSProperties

  return (
    <section className="h01-group">
      <div className="h01-label">Screens</div>
      <ul className="h01-bento" ref={list} data-tune={tune || undefined}>
        {tiles.map((t) => {
          const size = `is-${t.size ?? 'sm'}`
          const key = keyOf(t)
          const f = focusOf(t)
          const tuneProps = { 'data-key': tune ? key : undefined, 'data-active': tune && active === key ? '' : undefined }
          const readout = tune && (
            <span className="h01-tune-read">
              x {f.x} · y {f.y} · z {f.z}
              <button type="button" onClick={() => setTile(t)}>
                {saved[key] ?? 'Set'}
              </button>
            </span>
          )
          if ('brand' in t) {
            const logo = logoFor(t.brand)
            const mark = { ...vars(f) }
            return (
              <li key={`brand-${t.brand}`} className={`${size} h01-bento-brand`} style={{ background: t.color }} role="img" aria-label={t.alt} {...tuneProps} {...(tune ? handlers(t) : {})}>
                {logo && (t.original ? <img src={logo} alt="" data-no-loader style={mark} draggable={false} /> : <span style={{ ...mark, '--logo': `url("${logo}")` } as CSSProperties} />)}
                {readout}
              </li>
            )
          }
          if ('video' in t)
            return (
              <li key={t.video} className={size} {...tuneProps}>
                <button type="button" aria-label={`${t.alt}, play full screen`} onClick={() => onOpen({ src: `${base}${t.video}`, alt: t.alt, video: true })} {...handlers(t)}>
                  <video src={`${base}${t.video}`} poster={`${base}${t.poster}`} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" style={vars(f)} />
                </button>
                {readout}
              </li>
            )
          const img = images[t.file]
          return img ? (
            <li key={t.file} className={size} {...tuneProps}>
              <button
                type="button"
                aria-label={`${t.alt}, open full screen`}
                onClick={(e) => {
                  if (tune) {
                    e.preventDefault()
                    setActive(t.file)
                  } else onOpen({ src: img.src, alt: t.alt })
                }}
                {...handlers(t)}
              >
                <img src={img.src} width={img.width} height={img.height} alt="" loading="lazy" draggable={false} style={vars(f)} />
              </button>
              {readout}
            </li>
          ) : null
        })}
      </ul>
    </section>
  )
}

/** The case study preview: its title, its opening paragraph (the first plain-text block of the markdown) and Read more. */
export function StoryPreview({ slug }: { slug: string }) {
  const story = getCaseStudyBySlug(slug)
  if (!story) return null
  const lead = story.body.split(/\n\s*\n/).map((b) => b.trim()).find((b) => b && !/^(#|```|---|!|>|\||-)/.test(b)) ?? ''
  return (
    <section className="h01-group">
      <div className="h01-label">Case study</div>
      <Link className="h01-story" to={`/case-studies/${story.slug}`}>
        <span className="h01-name">{story.title}</span>
        <span className="h01-desc">{lead.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*_]/g, '')}</span>
        <span className="h01-readmore">
          Read more <ArrowRight size={16} strokeWidth={2} aria-hidden />
        </span>
      </Link>
    </section>
  )
}
