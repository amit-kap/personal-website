import { Link } from 'react-router-dom'
import { ArrowRight, Download } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import './home01.css'
import SiteFooter from './SiteFooter'
import { getCV } from '@/lib/content'
import { CornerMark } from './WorkParts'

const base = import.meta.env.BASE_URL
const PDF = `${base}Amit Kaplinsky CV 10-2026.pdf`

// Companies with their own work page; the others are plain text.
const WORK_PAGES = new Set(['shift', 'veriti', 'checkpoint'])

/* The CV, from src/content/cv.md, in the work pages' centered column with the home page's type: the name and contacts,
   then each role as a row of dates beside company, role and what I did. The PDF in public/ is the download. */
export default function CvPage() {
  const cv = getCV()
  const { header } = cv

  return (
    <div className="h01 h01-center h01-case h01-work h01-cv">
      <main className="h01-col">
        <CornerMark />

        <h1 className="h01-title">{header.name}</h1>
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
        <a className="h01-link h01-cv-pdf" href={PDF} download>
          <span>Download CV (PDF)</span> <Download size={16} strokeWidth={2} aria-hidden />
        </a>

        <section className="h01-group">
          <div className="h01-label">Experience</div>
          <ol className="h01-cv-list">
            {cv.experience.map((e) => (
              <li key={e.slug} className="h01-cv-row">
                <span className="h01-cv-when">{e.period.replace(/ to /, ' – ')}</span>
                <div className="h01-cv-what">
                  {WORK_PAGES.has(e.slug) ? (
                    <Link className="h01-link" to={`/work/${e.slug}`}>
                      <span>{e.company}</span> <ArrowRight size={16} strokeWidth={2} aria-hidden />
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
