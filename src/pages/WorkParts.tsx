import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { getCaseStudyBySlug, type ContentImage } from '@/lib/content'
import type { Shown } from './useViewer'

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

/** One bento tile: an image file zoomed into a focus point (x/y in % of the image, zoom z), or a looping video
    (`video` and its `poster`, paths under public/) shown whole. */
export type Tile = { file: string; alt: string; x: number; y: number; z: number } | { video: string; poster: string; alt: string }

/** A muted looping video tile that opens full size when clicked. */
export function VideoTile({ src, poster, alt, onOpen }: { src: string; poster: string; alt: string; onOpen: (s: Shown) => void }) {
  return (
    <button type="button" aria-label={`${alt}, play full screen`} onClick={() => onOpen({ src, alt, video: true })}>
      <video src={src} poster={poster} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
    </button>
  )
}

/** The Screens bento: an optional lead tile (the film), then screenshot tiles; each opens full screen when clicked. */
export function Bento({ lead, tiles, images, onOpen }: { lead?: ReactNode; tiles: Tile[]; images: Record<string, ContentImage>; onOpen: (s: Shown) => void }) {
  return (
    <section className="h01-group">
      <div className="h01-label">Screens</div>
      <ul className="h01-bento">
        {lead && <li>{lead}</li>}
        {tiles.map((t) => {
          if ('video' in t)
            return (
              <li key={t.video}>
                <VideoTile src={`${base}${t.video}`} poster={`${base}${t.poster}`} alt={t.alt} onOpen={onOpen} />
              </li>
            )
          const img = images[t.file]
          return img ? (
            <li key={t.file}>
              <button type="button" aria-label={`${t.alt}, open full screen`} onClick={() => onOpen({ src: img.src, alt: t.alt })}>
                <img
                  src={img.src}
                  width={img.width}
                  height={img.height}
                  alt=""
                  loading="lazy"
                  style={{ '--x': `${t.x}%`, '--y': `${t.y}%`, '--z': t.z } as CSSProperties}
                />
              </button>
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
