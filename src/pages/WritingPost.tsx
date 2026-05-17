import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getWritingDetail } from '@/lib/content'
import { getPostMeta } from '@/content/writing/posts'

const components = (images: Record<string, string>) => ({
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-[24px] sm:text-[30px] font-medium tracking-tight leading-tight mb-6">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-[18px] font-medium mt-12 mb-3">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-[15px] font-medium mt-8 mb-2">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-[16px] leading-8 mb-5 text-black/75">{children}</p>
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
    // Resolve filename-only refs (e.g. "01.jpg") via the images map
    const resolved = src && !src.startsWith('http') && !src.startsWith('/')
      ? images[src] ?? src
      : src
    return (
      <img src={resolved} alt={alt ?? ''} className="w-full rounded-[6px] my-8" loading="lazy" />
    )
  },
  hr: () => <hr className="my-12 border-black/10" />,
})

export default function WritingPost() {
  const { slug } = useParams<{ slug: string }>()
  const meta = slug ? getPostMeta(slug) : undefined
  const detail = slug ? getWritingDetail(slug) : undefined

  if (!meta || !detail) {
    return (
      <div className="relative z-10 min-h-screen bg-white">
        <div className="px-5 sm:px-8 pt-24 pb-24">
          <p className="text-[14px] text-black/40">Post not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-10 min-h-screen bg-white">
      <article className="px-5 sm:px-8 pb-20 animate-fade-up" style={{ paddingTop: '5.75rem' }}>
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5 order-1">
            <div className="md:sticky" style={{ top: '5.75rem' }}>
              <Link
                to="/writing"
                className="inline-block text-[11px] font-mono uppercase tracking-[0.2em] text-black/30 hover:text-black transition-colors duration-200 mb-10"
              >
                ← Writing
              </Link>
              <h1 className="text-[24px] sm:text-[30px] font-medium tracking-tight leading-tight mb-2">
                {meta.title}
              </h1>
              <p className="text-[12px] font-mono text-black/35">
                {meta.date} · {meta.readMin} min read
              </p>
            </div>
          </div>

          <div className="md:col-span-7 order-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components(detail.images)}>
              {detail.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  )
}
