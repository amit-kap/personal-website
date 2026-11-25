import { useEffect, useRef, useState, type CSSProperties } from 'react'
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
/* Reading size: "large" is the case study's own reading type, "small" the site's default text size like the other pages.
   The pick is remembered in this browser. */
type ReadSize = 'large' | 'small'
const SIZE_KEY = 'case-study-size'
function readSize(): ReadSize {
  try {
    return localStorage.getItem(SIZE_KEY) === 'small' ? 'small' : 'large'
  } catch {
    return 'large'
  }
}

export default function CaseStudy() {
  const { slug = '' } = useParams()
  const study = getCaseStudyBySlug(slug)
  const corner = useRef<HTMLAnchorElement>(null)
  const [size, setSize] = useState<ReadSize>(readSize)
  const pickSize = (next: ReadSize) => {
    try {
      localStorage.setItem(SIZE_KEY, next)
    } catch {
      /* not remembered, still applied */
    }
    setSize(next)
  }

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
          <ArrowLeft className="h01-corner-arrow" size={20} strokeWidth={1.5} aria-hidden />
        </Link>

        {/* Text size, fixed under the back mark: the case study's reading size or the site's default size. */}
        <div className="h01-switch h01-size" role="group" aria-label="Text size">
          <button type="button" className={size === 'small' ? 'on' : undefined} aria-pressed={size === 'small'} onClick={() => pickSize('small')} aria-label="Default text size" title="Default text size">
            <span aria-hidden="true">A</span>
          </button>
          <button type="button" className={size === 'large' ? 'on' : undefined} aria-pressed={size === 'large'} onClick={() => pickSize('large')} aria-label="Large text size" title="Large text size">
            <span aria-hidden="true">A</span>
          </button>
        </div>

        <article className="h01-article" data-size={size}>
          <h1 className="h01-title">{study.title}</h1>
          <p className="h01-sub">{sub}</p>
          <p className="h01-meta">
            {workName(study.workSlug)} · {minutes} min read
          </p>
          <div className="h01-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              hr: () => null,
              // ```summary and ```stats fences hold "label: text" lines and render as the summary box and the figures row.
              pre: ({ node, children }) => {
                const code = node?.children[0]
                const lang = code?.type === 'element' ? String((code.properties.className as string[] | undefined)?.[0] ?? '') : ''
                const text = code?.type === 'element' && code.children[0]?.type === 'text' ? code.children[0].value : ''
                const rows = text.split('\n').filter(Boolean).map((l) => {
                  const i = l.indexOf(':')
                  return [l.slice(0, i).trim(), l.slice(i + 1).trim()]
                })
                if (lang === 'language-summary')
                  return (
                    <dl className="h01-tldr">
                      {rows.map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                    </dl>
                  )
                if (lang === 'language-stats') {
                  const note = rows.find(([k]) => k === 'note')?.[1]
                  return (
                    <figure className="h01-stats">
                      <div>
                        {rows
                          .filter(([k]) => k !== 'note')
                          .map(([k, v]) => (
                            <p key={k}>
                              <strong>{k}</strong>
                              <span>{v}</span>
                            </p>
                          ))}
                      </div>
                      {note ? <figcaption>{note}</figcaption> : null}
                    </figure>
                  )
                }
                return <pre>{children}</pre>
              },
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
          </div>
        </article>

        <SiteFooter />
      </main>
    </div>
  )
}
