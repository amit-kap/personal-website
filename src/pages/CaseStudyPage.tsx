import { Children, isValidElement } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  getCaseStudyBySlug,
  getWorkBySlug,
  type ContentImage,
} from '@/lib/content'
import Reveal from '@/components/Reveal'
import RollingText from '@/components/RollingText'
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
  // H1 is the article title, rendered in the title block above; suppressed here.
  h1: () => null,
  // The md pattern is `### Heading` followed by `---`: the h3 is the section
  // head, the hr below it draws the hairline.
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-9 font-heading text-[24px] font-medium leading-tight tracking-[-0.015em] text-foreground">{children}</h2>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-9 font-heading text-[24px] font-medium leading-tight tracking-[-0.015em] text-foreground">{children}</h2>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-6 font-heading text-[18px] font-medium text-foreground">{children}</h3>
  ),
  hr: () => <hr className="border-border" />,
  p: ({ children }: { children?: React.ReactNode }) => (
    isImageOnlyParagraph(children)
      ? <>{children}</>
      : isImageRowParagraph(children)
        ? <div className="my-2 grid grid-cols-1 items-start gap-3 sm:grid-cols-3 sm:gap-4">{children}</div>
        : <p>{children}</p>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="flex flex-col gap-2.5">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="flex flex-col gap-2.5">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="grid grid-cols-[18px_minmax(0,1fr)] text-[17px] leading-[1.7] text-copy before:content-['–'] before:text-muted-foreground">
      <span className="col-start-2">{children}</span>
    </li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="prose-quote my-2.5 [&>p]:m-0 [&>p]:font-heading [&>p]:text-[20px] [&>p]:leading-[1.5] [&>p]:text-foreground">
      {children}
    </blockquote>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline hover:underline-offset-[3px]">
      {children}
    </a>
  ),
  img: ({ src, alt }: { src?: string; alt?: string }) => {
    const resolved = src && !src.startsWith('http') && !src.startsWith('/')
      ? images[imageLookupKey(src)] ?? images[src]
      : src
        ? { src, width: undefined, height: undefined }
        : undefined
    const width = 'width' in (resolved ?? {}) ? resolved?.width : undefined
    const height = 'height' in (resolved ?? {}) ? resolved?.height : undefined
    // Product-UI screenshots get browser-window chrome and break out wider
    // than the text column; small assets (logos, crops) stay plain.
    const isProductUI = typeof width === 'number' && width >= 1200
    if (isProductUI) {
      return (
        <figure className="my-3.5 lg:-mx-[90px]">
          <div className="window">
            <div className="winbar">
              <span className="windot windot-r" />
              <span className="windot windot-y" />
              <span className="windot windot-g" />
            </div>
            <SkeletonImage
              src={resolved?.src ?? ''}
              alt={alt ?? ''}
              width={width}
              height={height}
              loading="lazy"
              wrapperClassName="w-full min-h-[180px]"
              className="block w-full"
            />
          </div>
          {alt ? <figcaption className="mt-2.5 text-center text-[13px] text-muted-foreground">{alt}</figcaption> : null}
        </figure>
      )
    }
    return (
      <figure className="my-2">
        <SkeletonImage
          src={resolved?.src ?? ''}
          alt={alt ?? ''}
          width={width}
          height={height}
          loading="lazy"
          wrapperClassName="w-full overflow-hidden rounded-lg border border-border min-h-[120px]"
          className="block w-full"
        />
        {alt ? <figcaption className="mt-2.5 text-center text-[13px] text-muted-foreground">{alt}</figcaption> : null}
      </figure>
    )
  },
})

function ArrowBackIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M12 4 L4 12 M10.5 12 H4 V5.5" />
    </svg>
  )
}

export default function CaseStudyPage() {
  const { slug } = useParams<{ slug: string }>()
  const caseStudy = slug ? getCaseStudyBySlug(slug) : undefined

  if (!caseStudy) {
    return (
      <main className="inner-col py-24">
        <p className="text-meta text-muted-foreground">Article not found.</p>
      </main>
    )
  }

  const company = getWorkBySlug(caseStudy.workSlug)?.company ?? 'Security'
  const meta = caseStudy.featured ? `${company}  ·  Featured` : company

  return (
    <main>
      {/* Title block */}
      <section className="relative">
        <div className="inner-col flex flex-col items-center gap-[18px] pb-12 pt-16 text-center">
          <Reveal as="p" className="meta-line" delay={0.08}>{meta}</Reveal>
          <Reveal as="h1" className="max-w-[820px] font-heading text-feature font-medium tracking-[-0.02em]" delay={0.16}>
            {caseStudy.title}
          </Reveal>
          {caseStudy.excerpt && (
            <Reveal as="p" className="max-w-[640px] text-[19px] font-light leading-normal text-muted-foreground" delay={0.24}>
              {caseStudy.excerpt}
            </Reveal>
          )}
        </div>
      </section>

      {/* Cover */}
      {caseStudy.coverImage && (
        <section className="relative">
          <div className="inner-col pb-14">
            <Reveal>
              <div className="overflow-hidden rounded-lg border border-border">
                <SkeletonImage
                  src={caseStudy.coverImage.src}
                  alt={`${caseStudy.title} cover`}
                  width={caseStudy.coverImage.width}
                  height={caseStudy.coverImage.height}
                  loading="eager"
                  wrapperClassName="aspect-video w-full"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Body */}
      <section className="relative border-t border-border">
        <div className="inner-col pb-16 pt-14">
          <article className="prose-col flex flex-col gap-[22px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents(caseStudy.bodyImages)}>
              {caseStudy.body}
            </ReactMarkdown>
          </article>
        </div>
      </section>

      {/* Back to Blog */}
      <section className="relative border-t border-border">
        <div className="inner-col flex justify-center pb-16 pt-14">
          <Link to="/blog" className="pill-cta roll-host px-[30px] py-3.5 text-[15px]">
            <RollingText text="Back to Blog" />
            <ArrowBackIcon />
          </Link>
        </div>
      </section>
    </main>
  )
}
