/* Element overrides for rendering case-study markdown (react-markdown):
   headings, lists and quotes in the site's type, and images routed through
   the content image map; wide product screenshots break out of the text
   column and enlarge on click, without a window bar. */
import { Children, isValidElement } from 'react'
import type { ContentImage } from '@/lib/content'
import SkeletonImage from '@/components/SkeletonImage'
import { ZoomableWindow } from '@/components/work/WindowCard'

/* Children without whitespace-only strings, so a paragraph holding just
   images (plus the newlines between them) counts as image-only. */
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

/* Markdown may percent-encode filenames (spaces as %20); the image map is
   keyed by the decoded source filename. */
function imageLookupKey(src: string) {
  try {
    return decodeURIComponent(src)
  } catch {
    return src
  }
}

export const markdownComponents = (images: Record<string, ContentImage>) => ({
  // H1 is the article title, rendered in the title block above; suppressed here.
  h1: () => null,
  // The md pattern is `### Heading` followed by `---`: the h3 is the section
  // head, the hr below it draws the hairline.
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-9 font-heading text-heading font-medium text-foreground">{children}</h2>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="mt-9 font-heading text-heading font-medium text-foreground">{children}</h2>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="mt-6 font-heading text-title font-medium text-foreground">{children}</h3>
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
    <li className="grid grid-cols-[18px_minmax(0,1fr)] text-title leading-relaxed text-copy before:content-['–'] before:text-muted-foreground">
      <span className="col-start-2">{children}</span>
    </li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="prose-quote my-2.5 [&>p]:m-0 [&>p]:font-heading [&>p]:text-stmt [&>p]:leading-normal [&>p]:text-foreground">
      {children}
    </blockquote>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,
  a: ({ children, href }: { children?: React.ReactNode; href?: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline hover:underline-offset-4">
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
    // Product-UI screenshots break out wider than the text column and enlarge
    // on click; small assets (logos, crops) stay plain.
    const isProductUI = typeof width === 'number' && width >= 1200
    if (isProductUI) {
      return (
        <figure className="my-3.5 lg:-mx-[90px]">
          <ZoomableWindow src={resolved?.src ?? ''} alt={alt ?? ''} chrome={false}>
            <SkeletonImage
              src={resolved?.src ?? ''}
              alt={alt ?? ''}
              width={width}
              height={height}
              loading="lazy"
              wrapperClassName="w-full min-h-45"
              className="block w-full"
            />
          </ZoomableWindow>
          {alt ? <figcaption className="mt-2.5 text-center text-caption text-muted-foreground">{alt}</figcaption> : null}
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
          wrapperClassName="w-full overflow-hidden rounded-lg border border-border min-h-30"
          className="block w-full"
        />
        {alt ? <figcaption className="mt-2.5 text-center text-caption text-muted-foreground">{alt}</figcaption> : null}
      </figure>
    )
  },
})
