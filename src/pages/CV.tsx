import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getCV } from '@/lib/content'
import Reveal from '@/components/Reveal'
import Seo from '@/components/Seo'
import RollingText from '@/components/RollingText'
import { BackToHome } from '@/components/work/casePrimitives'

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 2v8m0 0 3-3m-3 3-3-3M2.5 12.5h11" />
    </svg>
  )
}

/* The contacts line is markdown in cv.md so it can carry links. */
function Contacts({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="text-[11px] leading-6 text-[#5c5c58]">{children}</p>,
        a: ({ href, children }) => (
          <a href={href} className="underline decoration-[#c9c9c4] underline-offset-2 hover:decoration-[#111]">
            {children}
          </a>
        ),
      }}
    >
      {markdown}
    </ReactMarkdown>
  )
}

export default function CV() {
  const cv = getCV()

  return (
    <main>
      <Seo
        title="CV"
        description="Amit Kaplinsky's CV: cybersecurity product direction, founding design, design systems, human-agent workflows, and AI prototyping."
        path="/cv"
      />
      <div data-print-hide className="relative">
        <div className="inner-col flex flex-col items-center gap-[18px] pb-10 pt-14 text-center">
          <Reveal as="p" className="eyebrow" delay={0.05}>Curriculum Vitae</Reveal>
          <Reveal as="h1" className="font-heading text-section font-medium tracking-[-0.015em]" delay={0.1}>
            {cv.header.name}
          </Reveal>
          <Reveal as="p" className="body-copy max-w-[560px]" delay={0.16}>{cv.header.tagline}</Reveal>
          <Reveal delay={0.22} className="flex flex-col items-center gap-2.5">
            <button type="button" onClick={() => window.print()} className="pill-cta roll-host px-[26px] py-3 text-[15px]">
              <RollingText text="Download PDF" />
              <DownloadIcon />
            </button>
            <p className="text-[13px] text-muted-foreground">
              Opens the print dialog. Choose “Save as PDF”.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="cv-stage">
        <article className="cv-sheet">
          <header className="border-b border-[#e6e6e6] pb-4">
            <h2 className="font-heading text-[26px] font-medium leading-tight tracking-[-0.02em]">{cv.header.name}</h2>
            <p className="mt-1 text-[13px] text-[#454542]">{cv.header.tagline}</p>
            <div className="mt-2.5">
              <Contacts markdown={cv.header.contacts} />
            </div>
          </header>

          <div className="mt-7 grid grid-cols-12 gap-x-9 gap-y-7">
            <section className="col-span-12 sm:col-span-8">
              <h3 className="cv-head">Experience</h3>
              <div className="mt-4 flex flex-col gap-[18px]">
                {cv.experience.map(({ slug, company, role, period, summary, hasImages }) => (
                  <article key={slug} className="cv-entry">
                    <h4 className="font-heading text-[13.5px] font-medium leading-snug">
                      {hasImages ? (
                        <Link to={`/work/${slug}`} className="underline decoration-[#c9c9c4] underline-offset-[3px] hover:decoration-[#111]">
                          {company}
                        </Link>
                      ) : (
                        company
                      )}
                      <span className="mx-2 font-normal text-[#c2c2bd]">|</span>
                      <span className="font-normal text-[#333330]">{role}</span>
                    </h4>
                    <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.12em] text-[#8a8a85]">{period}</p>
                    <p className="mt-1.5 text-[11.5px] leading-[1.55] text-[#5c5c58]">{summary}</p>
                  </article>
                ))}
              </div>
            </section>

            <aside className="col-span-12 flex flex-col gap-7 sm:col-span-4">
              {cv.certificates.length > 0 && (
                <section>
                  <h3 className="cv-head">Certificates</h3>
                  <div className="mt-4 flex flex-col gap-3">
                    {cv.certificates.map(({ title, meta }) => (
                      <div key={title} className="cv-entry">
                        <p className="font-heading text-[12px] font-medium leading-snug">{title}</p>
                        {meta && <p className="mt-0.5 text-[10.5px] text-[#7b7b76]">{meta}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {cv.education.length > 0 && (
                <section>
                  <h3 className="cv-head">Education</h3>
                  <div className="mt-4 flex flex-col gap-3">
                    {cv.education.map(({ title, meta }) => (
                      <div key={title} className="cv-entry">
                        <p className="font-heading text-[12px] font-medium leading-snug">{title}</p>
                        {meta && <p className="mt-0.5 text-[10.5px] text-[#7b7b76]">{meta}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {cv.skills.length > 0 && (
                <section>
                  <h3 className="cv-head">Skills</h3>
                  <div className="mt-4 flex flex-col gap-3">
                    {cv.skills.map(({ category, items }) => (
                      <div key={category} className="cv-entry">
                        <p className="font-heading text-[12px] font-medium leading-snug">{category}</p>
                        <p className="mt-0.5 text-[11px] leading-[1.5] text-[#5c5c58]">{items.join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </aside>
          </div>
        </article>
      </div>

      <div data-print-hide>
        <BackToHome />
      </div>
    </main>
  )
}
