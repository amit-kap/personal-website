import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getExperienceDetail } from '@/lib/content'

const components = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="font-heading text-5xl sm:text-6xl md:text-7xl font-normal italic leading-none tracking-tight mb-6">
      {children}
    </h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] mt-12 sm:mt-16 mb-5 pb-3 border-b border-black/20 text-black/60">
      {children}
    </h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-[15px] font-medium mb-0.5">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-[14px] leading-7 mb-4 text-black/60">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="mb-6 space-y-1">{children}</ul>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="text-[14px] leading-7 text-black/60 flex gap-3 items-baseline">
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-medium text-black/80">{children}</strong>
  ),
}

export default function ExperienceItem() {
  const { slug } = useParams<{ slug: string }>()
  const exp = getExperienceDetail(slug ?? '')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (lightboxIndex === null || !exp) return
    const total = exp.images.length
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      else if (e.key === 'ArrowRight') setLightboxIndex(i => ((i ?? 0) + 1) % total)
      else if (e.key === 'ArrowLeft') setLightboxIndex(i => ((i ?? 0) - 1 + total) % total)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxIndex, exp?.images.length])

  if (!exp) {
    return (
      <div className="max-w-2xl mx-auto px-8 pt-24 pb-24">
        <Link to="/" className="text-[11px] uppercase tracking-[0.18em] text-black/35 hover:text-black transition-colors duration-300">
          ←
        </Link>
        <p className="text-[14px] text-black/50 mt-8">Experience item not found.</p>
      </div>
    )
  }

  return (
    <>
      <article className="max-w-2xl mx-auto px-6 sm:px-8 pt-14 sm:pt-20 md:pt-24 pb-16 sm:pb-24 animate-fade-up">
        <Link
          to="/"
          className="text-[11px] uppercase tracking-[0.18em] text-black/35 hover:text-black transition-colors duration-300"
        >
          ← Back
        </Link>

        <div className="mt-10 sm:mt-16">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
            {exp.content}
          </ReactMarkdown>
        </div>

        {exp.images.length > 0 && (
          <div className="flex flex-col gap-6 mt-8">
            {exp.images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={`Image ${i + 1}`}
                className="w-full block cursor-pointer"
                onClick={() => setLightboxIndex(i)}
              />
            ))}
          </div>
        )}
      </article>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-5 text-white/50 hover:text-white text-3xl leading-none transition-colors"
            onClick={() => setLightboxIndex(null)}
            aria-label="Close"
          >
            ×
          </button>

          <button
            className="absolute left-4 text-white/50 hover:text-white text-3xl leading-none transition-colors select-none px-2"
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => ((i ?? 0) - 1 + exp.images.length) % exp.images.length) }}
            aria-label="Previous"
          >
            ‹
          </button>

          <img
            src={exp.images[lightboxIndex]}
            alt={`Image ${lightboxIndex + 1}`}
            className="w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <button
            className="absolute right-4 text-white/50 hover:text-white text-3xl leading-none transition-colors select-none px-2"
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
