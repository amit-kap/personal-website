import { Children, isValidElement } from 'react'
import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  getCaseStudyBySlug,
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
    <h2 className="text-title-sm font-medium mt-16 mb-3 leading-tight">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-lead font-medium mt-14 mb-3 leading-tight">{children}</h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="text-body font-medium mt-10 mb-2">{children}</h4>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    isImageOnlyParagraph(children)
      ? <>{children}</>
      : isImageRowParagraph(children)
        ? <div className="case-study-image-row my-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-start">{children}</div>
      : <p className="text-body leading-8 mb-5 text-foreground/75">{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-disc pl-5 mb-5 space-y-1 text-body leading-8 text-foreground/75">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal pl-5 mb-5 space-y-1 text-body leading-8 text-foreground/75">{children}</ol>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="my-8 rounded-r-[10px] border-l-[3px] border-[#8aa9a1] bg-[#8aa9a1]/[0.08] py-5 pl-5 pr-6 text-foreground/80 italic [&>p]:mb-0">
      {children}
    </blockquote>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-medium text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline decoration-[1.5px] underline-offset-4 decoration-foreground/55 transition-colors hover:bg-foreground/[0.04] hover:decoration-foreground">
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
          wrapperClassName="w-full rounded-[6px] border border-foreground/[0.05] min-h-[180px]"
          className="w-full block"
        />
        {alt ? (
          <figcaption className="text-caption font-mono uppercase tracking-[0.15em] text-foreground/40 mt-3 text-center">
            {alt}
          </figcaption>
        ) : null}
      </figure>
    )
  },
  hr: () => <hr className="mt-1 mb-8 border-foreground/10" />,
})

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const caseStudy = slug ? getCaseStudyBySlug(slug) : undefined

  if (!caseStudy) {
    return (
      <div className="relative z-10 min-h-screen bg-background">
        <div className="max-w-xl mx-auto px-5 sm:px-8 pt-24 pb-24">
          <p className="text-meta text-foreground/40">Case study not found.</p>
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
              <div className="rounded-[6px] overflow-hidden border border-foreground/[0.05] mb-10 sm:mb-12">
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

            {/* Article masthead */}
            <h1
              className="font-heading text-feature font-bold leading-[0.94] tracking-[-0.07em] text-foreground mb-6"
            >
              {caseStudy.title}
            </h1>

            {/* Excerpt */}
            {caseStudy.excerpt && (
              <p className="text-lead leading-[1.5] text-foreground/55 mb-12">
                {caseStudy.excerpt}
              </p>
            )}

            {/* Body */}
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents(caseStudy.bodyImages)}>
              {caseStudy.body}
            </ReactMarkdown>

          </div>
        </article>
      </main>
    </div>
  )
}
