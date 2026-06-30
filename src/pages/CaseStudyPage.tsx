import { Children, isValidElement } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  getCaseStudyBySlug,
  getAdjacentCaseStudies,
  type ContentImage,
} from '@/lib/content'
import SkeletonImage from '@/components/SkeletonImage'

function meaningfulChildren(children: React.ReactNode) {
  return Children
    .toArray(children)
    .filter(child => typeof child !== 'string' || child.trim().length > 0)
}

function isMarkdownImage(child: React.ReactNode) {
  return isValidElement<{ node?: { tagName?: string } }>(child) && child.props.node?.tagName === 'img'
}

function isImageOnlyParagraph(children: React.ReactNode) {
  const childArray = meaningfulChildren(children)

  return childArray.length === 1 && isMarkdownImage(childArray[0])
}

function isImageRowParagraph(children: React.ReactNode) {
  const childArray = meaningfulChildren(children)

  return childArray.length > 1 && childArray.every(isMarkdownImage)
}

function imageLookupKey(src: string) {
  try {
    return decodeURIComponent(src)
  } catch {
    return src
  }
}

const markdownComponents = (images: Record<string, ContentImage>) => ({
  // H1 is the case-study title, rendered above the markdown body; suppressed here.
  h1: () => null,
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-[24px] sm:text-[28px] font-medium mt-16 mb-3 leading-tight">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-[20px] font-medium mt-14 mb-3 leading-tight">{children}</h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="text-[16px] font-medium mt-10 mb-2">{children}</h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    isImageOnlyParagraph(children)
      ? <>{children}</>
      : isImageRowParagraph(children)
        ? <div className="case-study-image-row my-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start">{children}</div>
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
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-black underline decoration-[1.5px] underline-offset-4 decoration-black/55 transition-colors hover:bg-black/[0.04] hover:decoration-black">
      {children}
    </a>
  ),
  img: ({ src, alt }: { src?: string; alt?: string }) => {
    const resolved = src && !src.startsWith('http') && !src.startsWith('/')
      ? images[imageLookupKey(src)] ?? images[src]
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

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const caseStudy = slug ? getCaseStudyBySlug(slug) : undefined
  const { prev, next } = slug ? getAdjacentCaseStudies(slug) : {}

  if (!caseStudy) {
    return (
      <div className="relative z-10 min-h-screen bg-background">
        <div className="max-w-xl mx-auto px-5 sm:px-8 pt-24 pb-24">
          <p className="text-[14px] text-black/40">Case study not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-10 min-h-screen bg-background">
      <main className="flex-1 w-full">
        <article className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 pt-10 sm:pt-14 pb-20 animate-fade-up">
          <div className="max-w-3xl mx-auto">
            {/* Hero image, contained */}
            {caseStudy.coverImage && (
              <div className="rounded-[6px] overflow-hidden border border-black/[0.05] mb-10 sm:mb-12">
                <SkeletonImage
                  src={caseStudy.coverImage.src}
                  alt={caseStudy.title}
                  width={caseStudy.coverImage.width}
                  height={caseStudy.coverImage.height}
                  loading="eager"
                  wrapperClassName="aspect-[16/9] w-full"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Back */}
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-[13px] font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <span aria-hidden="true">←</span> Back
            </Link>

            {/* Title — unified with the home titles */}
            <h1
              className="font-heading font-normal leading-[1.06] tracking-[-0.02em] text-foreground mb-5"
              style={{ fontSize: 'clamp(30px, 5.5vw, 68px)' }}
            >
              {caseStudy.title}
            </h1>

            {/* Excerpt */}
            {caseStudy.excerpt && (
              <p className="text-[17px] sm:text-[19px] leading-[1.5] text-black/55 mb-12">
                {caseStudy.excerpt}
              </p>
            )}

            {/* Body */}
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents(caseStudy.bodyImages)}>
              {caseStudy.body}
            </ReactMarkdown>

            {/* Prev / Next case study */}
            {(prev || next) && (
              <nav className="mt-20 pt-10 border-t border-black/10 flex justify-between items-start gap-6">
                <div className="flex-1 min-w-0">
                  {prev && (
                    <Link
                      to={`/case-studies/${prev.slug}`}
                      className="group inline-flex flex-col items-start gap-1.5"
                    >
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-black/35">
                        ← Previous
                      </span>
                      <span className="text-[15px] font-medium text-black/70 group-hover:text-black transition-colors leading-snug">
                        {prev.title}
                      </span>
                    </Link>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex justify-end">
                  {next && (
                    <Link
                      to={`/case-studies/${next.slug}`}
                      className="group inline-flex flex-col items-end gap-1.5 text-right"
                    >
                      <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-black/35">
                        Next →
                      </span>
                      <span className="text-[15px] font-medium text-black/70 group-hover:text-black transition-colors leading-snug">
                        {next.title}
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
  )
}
