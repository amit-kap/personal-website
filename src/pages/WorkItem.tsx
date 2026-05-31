import { Children, isValidElement } from 'react'
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
  // H1 is the case-study title, shown in the hero; suppressed in the body.
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

  if (!work) {
    return (
      <div className="relative z-10 min-h-screen bg-white">
        <div className="max-w-xl mx-auto px-5 sm:px-8 pt-24 pb-24">
          <p className="text-[14px] text-black/40">Work not found.</p>
        </div>
      </div>
    )
  }

  const heroImage = caseStudy?.coverImage ?? work.heroImage
  const heroTitle = caseStudy?.title ?? work.company
  const heroExcerpt = caseStudy?.excerpt
  const bodyContent = caseStudy?.body ?? work.body
  const bodyImagesMap = caseStudy?.bodyImages ?? work.bodyImages

  return (
    <div className="relative z-10 min-h-screen bg-white">
      <main className="pt-14 w-full">
        {/* Full-bleed hero — same shape as the Home hero */}
        <section className="relative -mt-14 animate-fade-up">
          <div className="relative w-full h-[88vh] min-h-[560px] max-h-[860px] overflow-hidden bg-black">
            {heroImage && (
              <SkeletonImage
                src={heroImage.src}
                alt={heroTitle}
                width={heroImage.width}
                height={heroImage.height}
                loading="eager"
                wrapperClassName="absolute inset-0 w-full h-full"
                className="w-full h-full object-cover"
              />
            )}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.10) 14%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.30) 48%, rgba(0,0,0,0.70) 78%, rgba(0,0,0,0.88) 100%)',
              }}
            />
          </div>

          {/* Title overlay at the bottom of the image */}
          <div className="absolute bottom-0 left-0 right-0 pb-12 sm:pb-16 px-5 sm:px-8 pointer-events-none">
            <div className="2xl:mx-auto 2xl:max-w-[1440px]">
              <h1 className="text-[36px] sm:text-[52px] md:text-[68px] leading-[1.02] tracking-[-0.025em] font-medium text-white max-w-3xl">
                {heroTitle}
              </h1>
              {heroExcerpt && (
                <p className="mt-4 sm:mt-5 text-[16px] sm:text-[19px] leading-[1.45] text-white/85 max-w-2xl">
                  {heroExcerpt}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Body — case study text + its own inline images */}
        <article
          id="case-study"
          className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 pt-16 sm:pt-20 pb-20 animate-fade-up scroll-mt-20"
        >
          <div className="max-w-3xl mx-auto">
            <Link
              to="/"
              className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-black/30 hover:text-black transition-colors duration-200 mb-10"
            >
              ← Back
            </Link>
            <p className="text-[13px] text-black/45 mb-12">
              <span className="font-medium text-black/75">{work.role}</span>
              <span className="mx-1.5">·</span>
              <span>{work.company}</span>
              <span className="mx-1.5">·</span>
              <span className="font-mono">{work.period}</span>
            </p>

            {bodyContent && (
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents(bodyImagesMap)}>
                {bodyContent}
              </ReactMarkdown>
            )}
          </div>
        </article>
      </main>
    </div>
  )
}
