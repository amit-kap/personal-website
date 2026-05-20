import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getWritingDetail } from '@/lib/content'
import { getPostMeta } from '@/content/posts'

const components = (images: Record<string, string>) => ({
  // h1 is intentionally suppressed — the title is already shown in the sticky meta column
  h1: () => null,
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className="text-[22px] font-medium mt-16 mb-3 leading-tight">{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-[20px] font-medium mt-14 mb-3 leading-tight">{children}</h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="text-[16px] font-medium mt-10 mb-2">{children}</h4>
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
      <figure className="my-8 prose-figure">
        <img src={resolved} alt={alt ?? ''} className="w-full rounded-[6px] border border-black/[0.05]" loading="lazy" />
        <figcaption className="text-[12px] font-mono uppercase tracking-[0.15em] text-black/40 mt-3 text-center">
          {alt ? ` — ${alt}` : null}
        </figcaption>
      </figure>
    )
  },
  hr: () => <hr className="mt-1 mb-8 border-black/10" />,
})

function getCover(images: Record<string, string>): string | undefined {
  const key = Object.keys(images).find(k => /^cover[-_.]/i.test(k))
  return key ? images[key] : undefined
}

export default function WritingPost() {
  const { slug } = useParams<{ slug: string }>()
  const meta = slug ? getPostMeta(slug) : undefined
  const detail = slug ? getWritingDetail(slug) : undefined
  const cover = detail ? getCover(detail.images) : undefined

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
      <article className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 pb-20 animate-fade-up" style={{ paddingTop: '5.75rem' }}>
        <div className="grid md:grid-cols-12 gap-10 md:gap-16">
          <div className="md:col-span-5 order-1">
            <div className="md:sticky relative overflow-hidden rounded-[6px] border border-black/[0.05]" style={{ top: '5.75rem' }}>
              {cover && (
                <>
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${cover})` }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 25%, rgba(255,255,255,0) 35%, rgba(255,255,255,0.85) 65%, #fff 80%)',
                    }}
                  />
                </>
              )}
              <div className={`relative p-8 flex flex-col ${cover ? 'text-white' : ''}`} style={{ minHeight: 'calc(100vh - 5.75rem)' }}>
                <Link
                  to="/writing"
                  className={`inline-block self-start text-[11px] font-mono uppercase tracking-[0.2em] transition-colors duration-200 mb-10 ${
                    cover ? 'text-white/60 hover:text-white' : 'text-black/30 hover:text-black'
                  }`}
                >
                  ← Writing
                </Link>
                <div>
                  <h1 className="text-[24px] sm:text-[30px] font-medium tracking-tight leading-tight mb-2">
                    {meta.title}
                  </h1>
                  {meta.subtitle && (
                    <p className={`text-[15px] leading-snug mb-3 ${cover ? 'text-white/80' : 'text-black/55'}`}>
                      {meta.subtitle}
                    </p>
                  )}
                  <p className={`text-[12px] font-mono ${cover ? 'text-white/60' : 'text-black/35'}`}>
                    {meta.date} · {meta.readMin} min read
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 order-2 prose-figures">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components(detail.images)}>
              {detail.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>
    </div>
  )
}
