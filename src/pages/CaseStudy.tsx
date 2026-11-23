import { useEffect, useRef, type CSSProperties } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './home01.css'
import SiteFooter from './SiteFooter'
import { getCaseStudyBySlug } from '@/lib/content'

const base = import.meta.env.BASE_URL

const WORKS: Record<string, string> = { shift: 'Shift', veriti: 'Veriti', checkpoint: 'Check Point' }
const workName = (slug: string) => WORKS[slug] ?? slug

/* A case study in the home page's single column: the AK mark in the corner as the way back, the title, then the story from
   src/content/writing/<slug>/index.md. The markdown's first H1 is the page title and the H3 under it the subtitle;
   its --- rules are dropped, and images come from the folder next to the markdown. */
export default function CaseStudy() {
  const { slug = '' } = useParams()
  const study = getCaseStudyBySlug(slug)
  const corner = useRef<HTMLAnchorElement>(null)

  // The ring around the mark fills as the page scrolls.
  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      corner.current?.style.setProperty('--read', String(max > 0 ? Math.min(1, window.scrollY / max) : 0))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [slug])

  if (!study) return <Navigate to="/" replace />

  const sub = study.body.match(/^###\s+(.+)$/m)?.[1] ?? ''
  const minutes = Math.max(1, Math.round(study.body.split(/\s+/).length / 220))
  const body = study.body.replace(/^#\s+.+$/m, '').replace(/^###\s+.+$/m, '')

  return (
    <div className="h01 h01-center h01-case">
      <main className="h01-col">
        {/* The AK mark is fixed in the top left corner and takes the visitor back home; the ring around it shows how far down the page they are. */}
        <Link className="h01-corner" to="/" aria-label="Back to home" ref={corner}>
          <svg viewBox="0 0 64 64" aria-hidden="true">
            <circle className="h01-ring-track" cx="32" cy="32" r="30" />
            <circle className="h01-ring" cx="32" cy="32" r="30" />
          </svg>
          <img src={`${base}home01/ak-logo.svg`} alt="" width={36} height={20} />
          <ArrowLeft className="h01-corner-arrow" size={20} strokeWidth={2} aria-hidden />
        </Link>

        <article className="h01-article">
          <h1 className="h01-title">{study.title}</h1>
          <p className="h01-sub">{sub}</p>
          <p className="h01-meta">
            {workName(study.workSlug)} · {minutes} min read
          </p>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              hr: () => null,
              // A paragraph that holds only images is a figure, or a row of figures; anything else is a normal paragraph.
              p: ({ node, children }) => {
                const kids = (node?.children ?? []).filter((c) => !(c.type === 'text' && !c.value.trim()))
                const onlyImages = kids.length > 0 && kids.every((c) => c.type === 'element' && c.tagName === 'img')
                return onlyImages ? <div className={kids.length > 1 ? 'h01-figrow' : 'h01-figs'}>{children}</div> : <p>{children}</p>
              },
              img: ({ src = '', alt }) => {
                const image = study.bodyImages[decodeURIComponent(src)]
                if (!image) return null
                return (
                  <figure style={{ '--ar': image.width / image.height } as CSSProperties}>
                    <img src={image.src} width={image.width} height={image.height} alt={alt} loading="lazy" />
                    {alt ? <figcaption>{alt}</figcaption> : null}
                  </figure>
                )
              },
              a: ({ href = '', children }) => (
                <a href={href} target="_blank" rel="noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {body}
          </ReactMarkdown>
        </article>

        <SiteFooter />
      </main>
    </div>
  )
}
