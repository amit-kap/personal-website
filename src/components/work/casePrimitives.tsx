import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ContentImage } from '@/lib/content'
import Reveal from '@/components/Reveal'
import RollingText from '@/components/RollingText'
import Lightbox from '@/components/work/Lightbox'
import ProductVideo from '@/components/work/ProductVideo'

export function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 12 L12 4 M5.5 4 H12 V10.5" />
    </svg>
  )
}

export function BackArrowIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 4 L4 12 M10.5 12 H4 V5.5" />
    </svg>
  )
}

/* Page title block: caps meta line, Geist title, intro paragraph. */
export function TitleBlock({ meta, title, intro }: { meta: string; title: string; intro: string }) {
  return (
    <div className="relative">
      <div className="inner-col flex flex-col gap-5 pb-10 pt-16">
        <Reveal as="p" className="meta-line" delay={0.05}>{meta}</Reveal>
        <Reveal as="h1" className="max-w-[880px] font-heading text-feature font-medium tracking-[-0.02em]" delay={0.12}>
          {title}
        </Reveal>
        <Reveal as="p" className="body-copy max-w-[720px]" delay={0.2}>{intro}</Reveal>
      </div>
    </div>
  )
}

/* Full-width gradient backdrop with the bottom-anchored product media.
   Pass `video` for a looping walkthrough; `image` then serves as its poster. */
export function HeroBackdrop({
  image,
  video,
  alt,
  gradient,
}: {
  image?: ContentImage
  video?: string
  alt: string
  gradient: [string, string, string]
}) {
  return (
    <div className="relative">
      <div className="inner-col pb-16">
        <Reveal>
          <div
            className="backdrop h-[clamp(240px,40vw,580px)]"
            style={{ '--g1': gradient[0], '--g2': gradient[1], '--g3': gradient[2] } as React.CSSProperties}
          >
            {video ? (
              <ProductVideo src={video} poster={image?.src} label={alt} />
            ) : (
              image && (
                <img src={image.src} alt={alt} width={image.width} height={image.height} className="backdrop-media" />
              )
            )}
          </div>
        </Reveal>
      </div>
    </div>
  )
}

/* Eyebrow + statement on the left, body content on the right. */
export function SplitSection({
  eyebrow,
  stmt,
  children,
}: {
  eyebrow: string
  stmt: string
  children: React.ReactNode
}) {
  return (
    <section className="relative border-t border-border">
      <Reveal className="inner-col grid gap-8 py-14 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14">
        <div className="flex flex-col gap-3.5">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="stmt">{stmt}</h2>
        </div>
        <div className="flex flex-col gap-4">{children}</div>
      </Reveal>
    </section>
  )
}

/* Three numbered columns divided by hairlines. */
export function JobGrid({ jobs }: { jobs: Array<{ title: string; copy: string }> }) {
  return (
    <section className="relative border-t border-border">
      <Reveal className="inner-col grid gap-y-8 py-12 sm:grid-cols-3 sm:gap-y-0">
        {jobs.map((job, i) => (
          <div
            key={job.title}
            className={`flex flex-col gap-2 py-1 sm:px-8 ${i === 0 ? 'sm:pl-0' : 'sm:border-l sm:border-border'} ${i === jobs.length - 1 ? 'sm:pr-0' : ''}`}
          >
            <p className="eyebrow">The Job / 0{i + 1}</p>
            <h3 className="font-heading text-[17px] font-medium">{job.title}</h3>
            <p className="text-[14.5px] leading-[1.55] text-copy">{job.copy}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

/* Browser-window chrome around a product screenshot. The UI in these is too
   small to read in place, so the whole thing lifts on hover and opens
   full-frame on click. Everything inside must be phrasing content because it lives
   in a <button>. */
export function ZoomableWindow({ src, alt, children }: { src: string; alt: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className="window-btn" onClick={() => setOpen(true)} aria-label={`Enlarge: ${alt}`}>
        <span className="window">
          <span className="winbar">
            <span className="windot windot-r" />
            <span className="windot windot-y" />
            <span className="windot windot-g" />
          </span>
          {children}
        </span>
      </button>
      {open && <Lightbox src={src} alt={alt} onClose={() => setOpen(false)} />}
    </>
  )
}

/* A product screenshot in browser-window chrome, as used by the case pages. */
export function WindowCard({ image, alt }: { image?: ContentImage; alt: string }) {
  if (!image) return null
  return (
    <ZoomableWindow src={image.src} alt={alt}>
      <img
        src={image.src}
        alt={alt}
        width={image.width}
        height={image.height}
        loading="lazy"
        className="block aspect-video w-full object-cover object-left-top"
      />
    </ZoomableWindow>
  )
}

export interface SurfaceItem {
  image?: ContentImage
  alt: string
  eyebrow: string
  title: string
  copy: React.ReactNode
}

/* Staggered 2×2 mosaic of window-chrome cards: left column, then a right
   column pushed down. Each card has an eyebrow, title, and caption below. */
export function SurfacesMosaic({ heading, items }: { heading: string; items: SurfaceItem[] }) {
  const columns = [items.slice(0, 2), items.slice(2, 4)]
  return (
    <section className="relative border-t border-border">
      <div className="inner-col flex flex-col gap-9 pb-16 pt-14">
        <div className="flex flex-col items-center gap-2 text-center">
          <Reveal as="p" className="eyebrow">The Surfaces</Reveal>
          <Reveal as="h2" className="font-heading text-section font-medium tracking-[-0.015em]" delay={0.08}>
            {heading}
          </Reveal>
        </div>
        <div className="flex flex-col gap-12 sm:flex-row sm:gap-6">
          {columns.map((column, c) => (
            <div key={c} className={`flex min-w-0 flex-1 flex-col gap-12 ${c === 1 ? 'sm:pt-[88px]' : ''}`}>
              {column.map((item) => (
                <Reveal key={item.title} className="flex flex-col gap-3.5">
                  <WindowCard image={item.image} alt={item.alt} />
                  <div className="flex flex-col gap-1.5">
                    <p className="eyebrow">{item.eyebrow}</p>
                    <h3 className="font-heading text-[20px] font-medium leading-tight tracking-[-0.01em]">{item.title}</h3>
                    <p className="text-[14.5px] leading-[1.55] text-copy">{item.copy}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* Related-writing link used inside Results sections. */
export function ReadLink({ to, label }: { to: string; label: string }) {
  return (
    <Link to={to} className="text-link roll-host self-start text-[14.5px]">
      <RollingText text={label} />
      <ArrowIcon />
    </Link>
  )
}

/* Centered orange pill back to the home page. */
export function BackToHome() {
  return (
    <section className="relative border-t border-border">
      <div className="inner-col flex justify-center pb-[72px] pt-16">
        <Link to="/" className="pill-cta roll-host px-[30px] py-3.5 text-[15px]">
          <RollingText text="Back to Home" />
          <BackArrowIcon />
        </Link>
      </div>
    </section>
  )
}
