import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ContentImage } from '@/lib/content'
import Reveal from '@/components/Reveal'
import { RevealButton } from '@amit-kap/glaze/components/reveal-button'
import Lightbox from '@/components/work/Lightbox'
import ProductVideo from '@/components/work/ProductVideo'
import { revealPill } from '@/components/pillButton'

export function ArrowIcon() {
  return (
    <svg className="size-3.5" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M4 12 L12 4 M5.5 4 H12 V10.5" />
    </svg>
  )
}

/* Page title block: meta line, title, intro paragraph. */
export function TitleBlock({ meta, title, intro }: { meta: string; title: string; intro: string }) {
  return (
    <div className="relative">
      <div className="inner-col flex flex-col gap-5 pb-10 pt-16">
        <Reveal as="p" className="meta-line" delay={0.05}>{meta}</Reveal>
        <Reveal as="h1" className="max-w-[880px] font-heading text-feature font-medium" delay={0.12}>
          {title}
        </Reveal>
        <Reveal as="p" className="body-copy max-w-[720px]" delay={0.2}>{intro}</Reveal>
      </div>
    </div>
  )
}

/* The hero product media, whole, in the home page's Featured frame.
   Pass `video` for a looping walkthrough; `image` then serves as its poster. */
export function HeroBackdrop({ image, video, alt }: { image?: ContentImage; video?: string; alt: string }) {
  return (
    <div className="relative">
      <div className="inner-col pb-16">
        <Reveal>
          <div className="media-frame">
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
    <section className="relative">
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
    <section className="relative">
      <Reveal className="inner-col grid gap-y-8 py-12 sm:grid-cols-3 sm:gap-y-0">
        {jobs.map((job, i) => (
          <div
            key={job.title}
            className={`flex flex-col gap-2 py-1 sm:px-8 ${i === 0 ? 'sm:pl-0' : 'sm:border-l sm:border-border'} ${i === jobs.length - 1 ? 'sm:pr-0' : ''}`}
          >
            <p className="eyebrow">The Job / 0{i + 1}</p>
            <h3 className="font-heading text-title font-medium">{job.title}</h3>
            <p className="text-meta leading-normal text-copy">{job.copy}</p>
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
      {open && <Lightbox src={src} alt={alt} chrome onClose={() => setOpen(false)} />}
    </>
  )
}

/* A product screenshot, shown whole, in browser-window chrome. */
export function WindowCard({ image, alt }: { image?: ContentImage; alt: string }) {
  if (!image) return null
  return (
    <ZoomableWindow src={image.src} alt={alt}>
      <img src={image.src} alt={alt} width={image.width} height={image.height} loading="lazy" className="block h-auto w-full" />
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

/* A 2×2 grid of surfaces: each screenshot, in window chrome, over its
   label, title and caption. 60px between items, as in the home problem grid. */
export function SurfacesMosaic({ heading, items }: { heading: string; items: SurfaceItem[] }) {
  return (
    <section className="relative">
      <div className="inner-col flex flex-col gap-9 pb-16 pt-14">
        <div className="flex flex-col items-center gap-2 text-center">
          <Reveal as="p" className="eyebrow">The Surfaces</Reveal>
          <Reveal as="h2" className="font-heading text-section font-medium" delay={0.08}>
            {heading}
          </Reveal>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-15">
          {items.map((item) => (
            <Reveal key={item.title} className="flex flex-col gap-4">
              <WindowCard image={item.image} alt={item.alt} />
              <div className="flex flex-col gap-1.5">
                <p className="eyebrow">{item.eyebrow}</p>
                <h3 className="font-heading text-stmt font-medium leading-tight">{item.title}</h3>
                <p className="text-meta leading-normal text-copy">{item.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/* The 22px arrows of the reveal buttons, as on the home page's Featured. */
function RevealArrow({ back = false }: { back?: boolean }) {
  return (
    <svg className="size-5.5" viewBox="0 0 33 33" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {back ? (
        <>
          <path d="M26.125 16.5H6.875" />
          <path d="M16.5 6.875 6.875 16.5l9.625 9.625" />
        </>
      ) : (
        <>
          <path d="M6.875 16.5h19.25" />
          <path d="M16.5 6.875l9.625 9.625-9.625 9.625" />
        </>
      )}
    </svg>
  )
}

/* Lucide "book-open" at 22px for the related-writing link. */
function ReadIcon() {
  return (
    <svg className="size-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </svg>
  )
}

/* Related-writing link: an orange reveal button with a read icon. */
export function ReadLink({ to, label, className = 'self-start' }: { to: string; label: string; className?: string }) {
  return (
    <RevealButton render={<Link to={to} />} nativeButton={false} role="link" label={label} iconSide="end" className={`${revealPill} ${className}`}>
      <ReadIcon />
    </RevealButton>
  )
}

/* The page's closing buttons, in a centred row 40px apart like the footer's:
   back to the home page, then (optionally) the related writing. */
export function BackToHome({ read }: { read?: { to: string; label: string } }) {
  return (
    <section className="relative">
      <div className="inner-col flex items-center justify-center gap-10 pb-18 pt-16">
        <RevealButton render={<Link to="/" />} nativeButton={false} role="link" label="Back to home" className={revealPill}>
          <RevealArrow back />
        </RevealButton>
        {read && <ReadLink to={read.to} label={read.label} className="" />}
      </div>
    </section>
  )
}
