import { Children, isValidElement } from 'react'
import { useParams } from 'react-router-dom'
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
      <main className="flex-1 pt-14 w-full">
        <article className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 pt-14 sm:pt-20 pb-20 animate-fade-up">
          <div className="max-w-3xl mx-auto">
            {/* Hero image, contained — aligns with the article text */}
            {heroImage && (
              <div className="rounded-[6px] overflow-hidden border border-black/[0.05] mb-10 sm:mb-12">
                <SkeletonImage
                  src={heroImage.src}
                  alt={heroTitle}
                  width={heroImage.width}
                  height={heroImage.height}
                  loading="eager"
                  wrapperClassName="aspect-[16/9] w-full"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-[30px] sm:text-[38px] md:text-[46px] leading-[1.05] tracking-[-0.02em] font-medium text-black mb-4">
              {heroTitle}
            </h1>

            {/* Excerpt */}
            {heroExcerpt && (
              <p className="text-[17px] sm:text-[19px] leading-[1.5] text-black/55 mb-12">
                {heroExcerpt}
              </p>
            )}

            {/* Body */}
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
