import { Children, isValidElement, useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  getWorkBySlug,
  getCaseStudyForWork,
  type ContentImage,
} from '@/lib/content'
import SkeletonImage from '@/components/SkeletonImage'

function isImageOnlyParagraph(children: React.ReactNode) {
  const childArray = Children
    .toArray(children)
    .filter(child => typeof child !== 'string' || child.trim().length > 0)

  if (childArray.length !== 1 || !isValidElement<{ node?: { tagName?: string } }>(childArray[0])) {
    return false
  }
  return childArray[0].props.node?.tagName === 'img'
}

const markdownComponents = (images: Record<string, ContentImage>) => ({
  // H1 from the case-study body is preserved and styled as the section title.
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-[24px] sm:text-[30px] font-medium tracking-tight leading-tight mt-2 mb-6">
      {children}
    </h2>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-[22px] font-medium mt-16 mb-3 leading-tight">{children}</h3>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="text-[20px] font-medium mt-14 mb-3 leading-tight">{children}</h4>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h5 className="text-[16px] font-medium mt-10 mb-2">{children}</h5>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    isImageOnlyParagraph(children)
      ? <>{children}</>
      : <p className="text-[16px] leading-8 mb-5 text-black/75">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-5 mb-5 space-y-1 text-[16px] leading-8 text-black/75">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-5 mb-5 space-y-1 text-[16px] leading-8 text-black/75">{children}</ol>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-black/15 pl-5 my-6 text-black/55 italic">{children}</blockquote>
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
  img: ({ src, alt }: { src?: string; alt?: string }) => {
    const resolved = src && !src.startsWith('http') && !src.startsWith('/')
      ? images[src]
      : src
        ? { src, width: undefined, height: undefined }
        : undefined
    return (
      <figure className="my-8">
        <SkeletonImage
          src={resolved?.src ?? ''}
          alt={alt ?? ''}
          width={'width' in (resolved ?? {}) ? resolved?.width : undefined}
          height={'height' in (resolved ?? {}) ? resolved?.height : undefined}
          loading="lazy"
          wrapperClassName="w-full rounded-[6px] border border-black/[0.05] min-h-[180px]"
          className="w-full block"
        />
        {alt ? (
          <figcaption className="text-[12px] font-mono uppercase tracking-[0.15em] text-black/40 mt-3 text-center">
            {alt}
          </figcaption>
        ) : null}
      </figure>
    )
  },
  hr: () => <hr className="mt-1 mb-8 border-black/10" />,
})

export default function WorkItem() {
  const { slug } = useParams<{ slug: string }>()
  const work = slug ? getWorkBySlug(slug) : undefined
  const caseStudy = slug ? getCaseStudyForWork(slug) : undefined

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
        <article className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 pb-20 animate-fade-up" style={{ paddingTop: '5.75rem' }}>
          <div className="max-w-3xl mx-auto">
            <Link
              to="/"
              className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-black/30 hover:text-black transition-colors duration-200 mb-10"
            >
              ← Back
            </Link>

            {work.heroImage && (
              <div className="rounded-[6px] overflow-hidden border border-black/[0.05] mb-10">
                <SkeletonImage
                  src={work.heroImage.src}
                  alt={work.company}
                  width={work.heroImage.width}
                  height={work.heroImage.height}
                  loading="eager"
                  wrapperClassName="w-full"
                  className="w-full block"
                />
              </div>
            )}

            <h1 className="text-[28px] sm:text-[34px] font-medium tracking-tight leading-tight mb-2">
              {work.company}
            </h1>
            <p className="text-[13px] text-black/45 mb-10">
              <span className="font-medium text-black/75">{work.role}</span>
              <span className="mx-1.5">·</span>
              <span className="font-mono">{work.period}</span>
            </p>

            {work.body && (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents(work.bodyImages)}>
                {work.body}
              </ReactMarkdown>
            )}
          </div>

          {/* Gallery — full container width for impact */}
          {gallery.length > 0 && (
            <div className="mt-12 flex flex-col gap-5 max-w-3xl mx-auto">
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

          {/* Case study section (conditional) */}
          {caseStudy && (
            <section id="case-study" className="mt-20 pt-12 border-t border-black/10 max-w-3xl mx-auto scroll-mt-20">
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-black/40 mb-2">
                Case Study
              </p>
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents(caseStudy.bodyImages)}>
                {caseStudy.body}
              </ReactMarkdown>
            </section>
          )}
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
