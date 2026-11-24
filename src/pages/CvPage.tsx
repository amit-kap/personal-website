import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import './home01.css'
import SiteFooter from './SiteFooter'
import { getCV } from '@/lib/content'
import { CornerMark } from './WorkParts'

const base = import.meta.env.BASE_URL
const PDF = `${base}Amit Kaplinsky CV 10-2026.pdf`
/* Workplaces with a work page on the site link to it from the company name. */
const WORK_PAGES: Record<string, string> = { shift: '/work/shift', veriti: '/work/veriti', checkpoint: '/work/checkpoint' }

/* The CV, from src/content/cv.md, in the work pages' centered column with the home page's type: the name and contacts,
   then each role as a row of dates beside company, role and what I did. Companies with a work page link to it. The PDF in public/ is the download. */
export default function CvPage() {
  const cv = getCV()
  const { header } = cv
  const head = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)

  // The name row is pinned once it reaches its sticky offset; only then does it get its backing (see home01.css).
  useEffect(() => {
    const el = head.current
    if (!el) return
    const check = () => setStuck(el.getBoundingClientRect().top <= parseFloat(getComputedStyle(el).top) + 0.5 && window.scrollY > 0)
    check()
    window.addEventListener('scroll', check, { passive: true })
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('scroll', check)
      window.removeEventListener('resize', check)
    }
  }, [])

  return (
    <div className="h01 h01-center h01-case h01-work h01-cv">
      <main className="h01-col">
        <CornerMark />

        {/* The name, with the PDF download at the right end of the same row. */}
        <div className="h01-cv-head" ref={head} data-stuck={stuck}>
          <h1 className="h01-title">{header.name}</h1>
          <a className="h01-link h01-cv-pdf" href={PDF} download>
            <span>Download</span> <Download size={16} strokeWidth={2} aria-hidden />
          </a>
        </div>
        <p className="h01-byline">
          <span className="h01-role">{header.tagline}</span>
        </p>
        <div className="h01-cv-contacts">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p>{children}</p>,
              a: ({ href = '', children }) =>
                href.startsWith('/') ? <Link to={href}>{children}</Link> : <a href={href} target="_blank" rel="noreferrer">{children}</a>,
            }}
          >
            {header.contacts}
          </ReactMarkdown>
        </div>
        <p className="h01-text h01-intro">{header.intro}</p>

        <section className="h01-group">
          <div className="h01-label">Experience</div>
          <ol className="h01-cv-list">
            {cv.experience.map((e) => (
              <li key={e.slug} className="h01-cv-row">
                <span className="h01-cv-when">{e.period.replace(/ to /, ' – ')}</span>
                <div className="h01-cv-what">
                  {WORK_PAGES[e.slug] ? (
                    <Link className="h01-link h01-name" to={WORK_PAGES[e.slug]}>
                      <span>{e.company}</span> <ArrowRight aria-hidden />
                    </Link>
                  ) : (
                    <span className="h01-name">{e.company}</span>
                  )}
                  <span className="h01-desc">
                    {e.role}, {e.context}
                  </span>
                  <ul className="h01-cv-bullets">
                    {e.bullets.map((b) => (
                      <li key={b.slice(0, 24)}>{b}</li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {[
          { label: 'Certificates', items: cv.certificates },
          { label: 'Education', items: cv.education },
        ].map((g) => (
          <section className="h01-group" key={g.label}>
            <div className="h01-label">{g.label}</div>
            <ol className="h01-cv-list">
              {g.items.map((c) => (
                <li key={c.title} className="h01-cv-row">
                  <span className="h01-cv-when">{c.meta.replace(/^.*·\s*/, '').replace(/ to /, ' – ')}</span>
                  <div className="h01-cv-what">
                    <span className="h01-name">{c.title}</span>
                    <span className="h01-desc">{c.meta.replace(/\s*·.*$/, '')}</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <section className="h01-group">
          <div className="h01-label">Skills</div>
          <ol className="h01-cv-list">
            {cv.skills.map((s) => (
              <li key={s.category} className="h01-cv-row">
                <span className="h01-cv-when">{s.category}</span>
                <span className="h01-cv-what h01-desc">{s.items.join(', ')}</span>
              </li>
            ))}
          </ol>
        </section>

        <SiteFooter />
      </main>
    </div>
  )
}
