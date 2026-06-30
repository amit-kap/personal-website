import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  getWorkBySlug,
  getAdjacentWorks,
} from '@/lib/content'

const bodyComponents = {
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-[16px] leading-8 mb-5 text-black/75">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-medium text-black">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-black underline underline-offset-2 decoration-black/30 hover:decoration-black">
      {children}
    </a>
  ),
}

export default function WorkItem() {
  const { slug } = useParams<{ slug: string }>()
  const work = slug ? getWorkBySlug(slug) : undefined
  const { prev, next } = slug ? getAdjacentWorks(slug) : {}

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [closing, setClosing] = useState(false)

  const images = work?.allImages ?? []

  const scrollerRef = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)
  const posRef = useRef(0)

  const closeLightbox = () => {
    setClosing(true)
    setTimeout(() => {
      setLightboxIndex(null)
      setClosing(false)
    }, 200)
  }

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null || images.length === 0) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowRight') setLightboxIndex(i => ((i ?? 0) + 1) % images.length)
      else if (e.key === 'ArrowLeft') setLightboxIndex(i => ((i ?? 0) - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, images.length])

  // Auto horizontal scroll (right → left), seamless via a duplicated set.
  // Pauses while the user interacts so manual scrolling stays smooth.
  useEffect(() => {
    const el = scrollerRef.current
    if (!el || images.length === 0) return
    let raf = 0
    const tick = () => {
      if (el && !pausedRef.current) {
        const marker = el.children[images.length] as HTMLElement | undefined
        const setWidth = marker?.offsetLeft ?? 0
        posRef.current += 0.5
        if (setWidth && posRef.current >= setWidth) posRef.current -= setWidth
        el.scrollLeft = posRef.current
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [images.length])

  if (!work) {
    return (
      <div className="relative z-10 min-h-screen bg-background">
        <div className="max-w-xl mx-auto px-5 sm:px-8 pt-24 pb-24">
          <p className="text-[14px] text-black/40">Work not found.</p>
        </div>
      </div>
    )
  }

  const pause = () => { pausedRef.current = true }
  const resume = () => {
    if (scrollerRef.current) posRef.current = scrollerRef.current.scrollLeft
    pausedRef.current = false
  }

  // Only scroll when there's more than one image; a single image is shown contained.
  const isStrip = images.length > 1

  return (
    <>
      <div className="relative z-10 min-h-screen bg-background">
        <main className="flex-1 w-full">
          {/* Full-bleed auto-scrolling image strip — click to open lightbox */}
          {isStrip && (
            <div
              ref={scrollerRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto h-[58vh] min-h-[340px] max-h-[560px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden animate-fade-up"
              onMouseEnter={pause}
              onMouseLeave={resume}
              onTouchStart={pause}
              onTouchEnd={resume}
            >
              {[...images, ...images].map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightboxIndex(i % images.length)}
                  aria-label={`${work.company} — open image ${(i % images.length) + 1}`}
                  className="group relative h-full flex-none cursor-pointer overflow-hidden bg-black/[0.04] first:ml-0"
                >
                  <img
                    src={img.src}
                    alt=""
                    width={img.width}
                    height={img.height}
                    loading={i < images.length ? 'eager' : 'lazy'}
                    draggable={false}
                    className="h-full w-auto object-cover transition-opacity duration-300 group-hover:opacity-90"
                    style={{ aspectRatio: img.width && img.height ? `${img.width} / ${img.height}` : undefined }}
                  />
                </button>
              ))}
            </div>
          )}

          <article className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 pt-3 sm:pt-4 pb-20 animate-fade-up">
            <div className="max-w-3xl mx-auto">
              {/* Single image — contained in the center column (no scroll) */}
              {images.length === 1 && (
                <button
                  type="button"
                  onClick={() => setLightboxIndex(0)}
                  aria-label={`${work.company} — open image`}
                  className="group block w-full cursor-pointer overflow-hidden rounded-[6px] border border-black/[0.05] mb-3 sm:mb-4"
                >
                  <img
                    src={images[0].src}
                    alt=""
                    width={images[0].width}
                    height={images[0].height}
                    loading="eager"
                    className="block w-full h-auto transition-opacity duration-300 group-hover:opacity-90"
                  />
                </button>
              )}

              {images.length > 0 && (
                <p className="text-[12px] font-mono text-black/35 mb-10 sm:mb-12">
                  {isStrip ? 'swipe to scroll · click to enlarge' : 'click to enlarge'}
                </p>
              )}

              {/* Back */}
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[13px] font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <span aria-hidden="true">←</span> Back
              </Link>

              {/* Title — unified with the home work titles */}
              <h1
                className="font-heading font-normal leading-[1.06] tracking-[-0.02em] text-foreground mb-5"
                style={{ fontSize: 'clamp(30px, 5.5vw, 68px)' }}
              >
                {work.productTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[clamp(16px,1.6vw,22px)] mb-10 sm:mb-12">
                {work.icon && (
                  <img src={work.icon} alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
                )}
                <span className="font-medium text-foreground">
                  {work.company} · {work.role}
                </span>
                <span className="text-muted-foreground">{work.period}</span>
              </div>

              {/* Work overview body */}
              {work.body && (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={bodyComponents}>
                  {work.body}
                </ReactMarkdown>
              )}

              {/* Prev / Next work */}
              {(prev || next) && (
                <nav className="mt-20 pt-10 border-t border-black/10 flex justify-between items-start gap-6">
                  <div className="flex-1 min-w-0">
                    {prev && (
                      <Link
                        to={`/work/${prev.slug}`}
                        className="group inline-flex flex-col items-start gap-1.5"
                      >
                        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-black/35">
                          ← Previous
                        </span>
                        <span className="text-[15px] font-medium text-black/70 group-hover:text-black transition-colors leading-snug">
                          {prev.company}
                        </span>
                      </Link>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 flex justify-end">
                    {next && (
                      <Link
                        to={`/work/${next.slug}`}
                        className="group inline-flex flex-col items-end gap-1.5 text-right"
                      >
                        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-black/35">
                          Next →
                        </span>
                        <span className="text-[15px] font-medium text-black/70 group-hover:text-black transition-colors leading-snug">
                          {next.company}
                        </span>
                      </Link>
                    )}
                  </div>
                </nav>
              )}
            </div>
          </article>
        </main>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className={`fixed inset-0 bg-black/85 z-50 flex items-center justify-center ${closing ? 'animate-fade-out' : 'animate-fade-in'}`}
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-5 text-white/40 hover:text-white text-3xl leading-none transition-colors"
            onClick={closeLightbox}
            aria-label="Close"
          >
            ×
          </button>
          <button
            className="absolute left-4 text-white/40 hover:text-white text-3xl leading-none transition-colors select-none px-2"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => ((i ?? 0) - 1 + images.length) % images.length) }}
            aria-label="Previous"
          >
            ‹
          </button>
          <img
            key={lightboxIndex}
            src={images[lightboxIndex].src}
            alt={`${work.company} — ${lightboxIndex + 1}`}
            className={`max-w-[90vw] max-h-[90vh] object-contain ${closing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 text-white/40 hover:text-white text-3xl leading-none transition-colors select-none px-2"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => ((i ?? 0) + 1) % images.length) }}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}
