import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getCV } from '@/lib/content'

const cv = getCV()

function ContactLine({ markdown }: { markdown: string }) {
  return (
    <div className="text-[11px] text-black/60 leading-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p>{children}</p>,
          a: ({ href, children }) => (
            <a href={href} className="underline underline-offset-2 hover:text-black">
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

export default function CV() {
  return (
    <>
      <style>{`
        @page { size: A4; margin: 0; }
        @media print {
          html, body { background: #fff !important; margin: 0 !important; }
          nav, footer, [data-print-hide] { display: none !important; }
          .app-content { margin-bottom: 0 !important; }
          .cv-experience { break-inside: avoid; }
        }
        @media screen {
          .cv-root { box-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06); }
        }
      `}</style>

      <div className="relative z-10 bg-background min-h-screen pt-20 pb-20 print:pt-0 print:pb-0 print:bg-white">
        <div
          className="cv-root mx-auto bg-white text-black"
          style={{ width: '210mm', minHeight: '297mm', padding: '14mm 12mm' }}
        >
          {/* Header */}
          <header className="mb-7">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-[26px] font-bold tracking-tight leading-tight">
                  {cv.header.name}
                </h1>
                <p className="text-[13px] text-black/70 mt-1">{cv.header.tagline}</p>
              </div>
              <button
                data-print-hide
                onClick={() => window.print()}
                className="shrink-0 text-[11px] font-mono uppercase tracking-[0.18em] text-black/60 hover:text-black border border-black/15 hover:border-black/40 rounded-full px-3.5 py-1.5 transition-colors"
              >
                Download PDF
              </button>
            </div>
            <div className="mt-3">
              <ContactLine markdown={cv.header.contacts} />
            </div>
          </header>

          {/* 2-column body */}
          <div className="grid grid-cols-12 gap-x-8 gap-y-6">
            {/* Left: Experience */}
            <section className="col-span-8">
              <h2 className="text-[10px] font-medium uppercase tracking-[0.28em] text-black/40 mb-5">
                Experience
              </h2>
              <div className="space-y-6">
                {cv.experience.map(({ slug, company, role, period, summary, hasImages }) => {
                  const CompanyName = (
                    <span className="font-semibold underline underline-offset-[3px] decoration-black/50">
                      {company}
                    </span>
                  )
                  return (
                    <article key={slug} className="cv-experience">
                      <h3 className="text-[13px] leading-snug">
                        {hasImages ? (
                          <Link to={`/work/${slug}`} className="hover:opacity-60 transition-opacity">
                            {CompanyName}
                          </Link>
                        ) : (
                          CompanyName
                        )}
                        <span className="text-black/40 mx-2 font-normal">|</span>
                        <span className="text-black/80">{role}</span>
                      </h3>
                      <p className="text-[10.5px] font-mono text-black/45 mt-0.5">{period}</p>
                      <p className="text-[11.5px] leading-[1.55] text-black/70 mt-2">{summary}</p>
                    </article>
                  )
                })}
              </div>
            </section>

            {/* Right: Certificates / Education / Skills */}
            <aside className="col-span-4 space-y-6">
              {cv.certificates.length > 0 && (
                <section>
                  <h2 className="text-[10px] font-medium uppercase tracking-[0.28em] text-black/40 mb-5">
                    Certificates
                  </h2>
                  <div className="space-y-4">
                    {cv.certificates.map(({ title, meta }) => (
                      <div key={title}>
                        <p className="text-[12px] font-semibold leading-snug">{title}</p>
                        {meta && <p className="text-[10.5px] text-black/55 mt-0.5">{meta}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {cv.education.length > 0 && (
                <section>
                  <h2 className="text-[10px] font-medium uppercase tracking-[0.28em] text-black/40 mb-5">
                    Education
                  </h2>
                  <div className="space-y-4">
                    {cv.education.map(({ title, meta }) => (
                      <div key={title}>
                        <p className="text-[12px] font-semibold leading-snug">{title}</p>
                        {meta && <p className="text-[10.5px] text-black/55 mt-0.5">{meta}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {cv.skills.length > 0 && (
                <section>
                  <h2 className="text-[10px] font-medium uppercase tracking-[0.28em] text-black/40 mb-5">
                    Skills
                  </h2>
                  <div className="space-y-4">
                    {cv.skills.map(({ category, items }) => (
                      <div key={category}>
                        <p className="text-[12px] font-semibold leading-snug mb-1">{category}</p>
                        <ul className="text-[11px] text-black/65 space-y-0.5 list-disc pl-4 marker:text-black/30">
                          {items.map(item => <li key={item}>{item}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
