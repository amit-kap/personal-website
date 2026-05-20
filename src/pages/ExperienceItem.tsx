import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getExperienceBySlug } from '@/lib/content'

const components = {
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-[10px] font-mono uppercase tracking-[0.25em] mt-12 mb-5 pb-3 border-b border-black/10 text-black/35">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-[14px] font-medium mb-0.5">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-[14px] leading-7 mb-4 text-black/55">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-6 space-y-1">{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-[14px] leading-7 text-black/55">
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-medium text-black/75">{children}</strong>
  ),
}

export default function ExperienceItem() {
  const { slug } = useParams<{ slug: string }>()
  const exp = getExperienceBySlug(slug ?? '')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [closing, setClosing] = useState(false)

  const closeLightbox = () => {
    setClosing(true)
    setTimeout(() => {
      setLightboxIndex(null)
      setClosing(false)
    }, 200)
  }

  useEffect(() => {
    if (lightboxIndex === null || !exp) return
    const total = exp.images.length
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowRight') setLightboxIndex(i => ((i ?? 0) + 1) % total)
      else if (e.key === 'ArrowLeft') setLightboxIndex(i => ((i ?? 0) - 1 + total) % total)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, exp?.images.length])

  if (!exp) {
    return (
      <div className="relative z-10 min-h-screen bg-white">
        <div className="max-w-xl mx-auto px-5 sm:px-8 pt-24 pb-24">
          <p className="text-[14px] text-black/40">Experience item not found.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative z-10 min-h-screen bg-white">
        <article className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 pb-20 animate-fade-up" style={{ paddingTop: '5.75rem' }}>
          <div className="grid md:grid-cols-12 gap-10 md:gap-16">
            <div className={`${exp.images.length > 0 ? 'md:col-span-5' : 'md:col-span-12'} order-1`}>
              <div className={exp.images.length > 0 ? 'md:sticky' : ''} style={exp.images.length > 0 ? { top: '5.75rem' } : undefined}>
                <Link
                  to="/"
                  className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-black/30 hover:text-black transition-colors duration-200 mb-10"
                >
                  ← Back
                </Link>
                <h1 className="text-[24px] sm:text-[30px] font-medium tracking-tight leading-tight mb-2">
                  {exp.role}
                </h1>
                <p className="text-[13px] text-black/45 mb-8">
                  <span className="font-medium text-black/75">{exp.company}</span>
                  <span className="mx-1.5">·</span>
                  <span className="font-mono">{exp.period}</span>
                </p>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                  {exp.body}
                </ReactMarkdown>
              </div>
            </div>

            {exp.images.length > 0 ? (
              <div className="md:col-span-7 order-2 flex flex-col gap-5">
                {exp.images.map((src, i) => (
                  <img
                    key={src}
                    src={src}
                    alt={`Image ${i + 1}`}
                    className="w-full block cursor-pointer rounded-[6px] border border-black/[0.05]"
                    loading={i === 0 ? 'eager' : 'lazy'}
                    onClick={() => setLightboxIndex(i)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </article>
      </div>

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
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => ((i ?? 0) - 1 + exp.images.length) % exp.images.length) }}
            aria-label="Previous"
          >
            ‹
          </button>
          <img
            key={lightboxIndex}
            src={exp.images[lightboxIndex]}
            alt={`Image ${lightboxIndex + 1}`}
            className={`max-w-[90vw] max-h-[90vh] object-contain ${closing ? 'animate-zoom-out' : 'animate-zoom-in'}`}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute right-4 text-white/40 hover:text-white text-3xl leading-none transition-colors select-none px-2"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => ((i ?? 0) + 1) % exp.images.length) }}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}
