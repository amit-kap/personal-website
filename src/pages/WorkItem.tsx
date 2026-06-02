import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  getWorkBySlug,
  getAdjacentWorks,
} from '@/lib/content'
import SkeletonImage from '@/components/SkeletonImage'

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

  const gallery = work?.galleryImages ?? []

  const closeLightbox = () => {
    setClosing(true)
    setTimeout(() => {
      setLightboxIndex(null)
      setClosing(false)
    }, 200)
  }

  useEffect(() => {
    if (lightboxIndex === null || gallery.length === 0) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowRight') setLightboxIndex(i => ((i ?? 0) + 1) % gallery.length)
      else if (e.key === 'ArrowLeft') setLightboxIndex(i => ((i ?? 0) - 1 + gallery.length) % gallery.length)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, gallery.length])

  if (!work) {
    return (
      <div className="relative z-10 min-h-screen bg-white">
        <div className="max-w-xl mx-auto px-5 sm:px-8 pt-24 pb-24">
          <p className="text-[14px] text-black/40">Work not found.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative z-10 min-h-screen bg-white">
        <main className="flex-1 pt-14 w-full">
          <article className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 pt-14 sm:pt-20 pb-20 animate-fade-up">
            <div className="max-w-3xl mx-auto">
              {/* Hero image, contained */}
              {work.heroImage && (
                <div className="rounded-[6px] overflow-hidden border border-black/[0.05] mb-10 sm:mb-12">
                  <SkeletonImage
                    src={work.heroImage.src}
                    alt={work.company}
                    width={work.heroImage.width}
                    height={work.heroImage.height}
                    loading="eager"
                    wrapperClassName="aspect-[16/9] w-full"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-[30px] sm:text-[38px] md:text-[46px] leading-[1.05] tracking-[-0.02em] font-medium text-black mb-2">
                {work.productTitle}
              </h1>
              <p className="text-[14px] font-medium text-black/55 mb-1">{work.company}</p>
              <p className="text-[12px] text-black/40 font-mono mb-10 sm:mb-12">
                {work.role}
                <span className="text-black/25 mx-2">·</span>
                {work.period}
              </p>

              {/* Work overview body */}
              {work.body && (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={bodyComponents}>
                  {work.body}
                </ReactMarkdown>
              )}

              {/* Image gallery */}
              {gallery.length > 0 && (
                <div className="mt-12 flex flex-col gap-5">
                  {gallery.map((image, i) => (
                    <SkeletonImage
                      key={image.src}
                      src={image.src}
                      alt={`${work.company} — ${i + 1}`}
                      width={image.width}
                      height={image.height}
                      loading="lazy"
                      onClick={() => setLightboxIndex(i)}
                      wrapperClassName="w-full block cursor-pointer rounded-[6px] border border-black/[0.05] min-h-[180px]"
                      className="w-full block"
                    />
                  ))}
                </div>
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
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => ((i ?? 0) - 1 + gallery.length) % gallery.length) }}
            aria-label="Previous"
          >
            ‹
          </button>
          <img
            key={lightboxIndex}
            src={gallery[lightboxIndex].src}
            alt={`${work.company} — ${lightboxIndex + 1}`}
            className={`max-w-[90vw] max-h-[90vh] object-contain ${closing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 text-white/40 hover:text-white text-3xl leading-none transition-colors select-none px-2"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => ((i ?? 0) + 1) % gallery.length) }}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}
