import { Link } from 'react-router-dom'
import { getCV } from '@/lib/content'
import SkeletonImage from '@/components/SkeletonImage'

const { experience } = getCV()

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid md:grid-cols-12 gap-10 md:gap-16 py-16 border-t border-black/10">
      <div className="md:col-span-5">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.25em] text-black/35">
          {label}
        </h2>
      </div>
      <div className="md:col-span-7">{children}</div>
    </section>
  )
}

export default function About() {
  return (
    <div className="relative z-10 min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 pb-20 animate-fade-up" style={{ paddingTop: '5.75rem' }}>

          <Section label="About">
            <div className="space-y-5">
              <p className="text-[19px] leading-8 tracking-[-0.01em] text-black">
                Tel Aviv. A decade designing enterprise software, mostly cybersecurity, mostly 0→1.
              </p>
              <p className="text-[19px] leading-8 tracking-[-0.01em] text-black">
                Led design at Onyxia Cyber, Veriti, Semperis, and Check Point. Currently at Shift — AI-powered vendor security, designed from zero.
              </p>
              <p className="text-[19px] leading-8 tracking-[-0.01em] text-black">
                Product designer and AI builder by trade. I care about details, structure, and shipping work that earns its place.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <SkeletonImage
                  src={`${import.meta.env.BASE_URL}profile.jpg`}
                  alt="Amit Kaplinsky"
                  wrapperClassName="w-full aspect-square rounded-[6px] border border-black/[0.05]"
                  className="w-full h-full object-cover"
                />
                <SkeletonImage
                  src={`${import.meta.env.BASE_URL}tel-aviv.jpg`}
                  alt="Tel Aviv"
                  wrapperClassName="w-full aspect-square rounded-[6px] border border-black/[0.05]"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </Section>

          <Section label="CV">
            <div className="space-y-6">
              {experience.map(({ slug, company, role, period, summary, hasImages }) => (
                <div key={slug}>
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      {hasImages ? (
                        <Link
                          to={`/experience/${slug}`}
                          className="text-[14px] font-medium text-black hover:text-black/50 transition-colors duration-200 group"
                        >
                          {company}
                          <span className="ml-1.5 text-black/25 group-hover:text-black/40 transition-colors text-[12px]">→</span>
                        </Link>
                      ) : (
                        <p className="text-[14px] font-medium text-black">{company}</p>
                      )}
                      <p className="text-[12px] text-black/35 font-mono mt-0.5">{role}</p>
                    </div>
                    <span className="text-[12px] text-black/30 font-mono shrink-0">{period}</span>
                  </div>
                  {summary && (
                    <p className="text-[13px] leading-6 text-black/55 mt-2">{summary}</p>
                  )}
                </div>
              ))}
              <div className="pt-2">
                <Link
                  to="/cv"
                  className="inline-flex items-baseline text-[12px] font-mono uppercase tracking-[0.2em] text-black/45 hover:text-black transition-colors duration-200"
                >
                  View as printable CV
                  <span className="ml-2 text-black/30">→</span>
                </Link>
              </div>
            </div>
          </Section>

          <Section label="Contact">
            <div className="space-y-3">
              <a
                href="mailto:amitka111@gmail.com"
                className="block text-[14px] font-medium text-black hover:text-black/50 transition-colors duration-200"
              >
                amitka111@gmail.com
                <span className="ml-1.5 text-black/25 text-[12px]">↗</span>
              </a>
              <a
                href="https://wa.me/972544878882"
                className="block text-[14px] font-medium text-black hover:text-black/50 transition-colors duration-200"
              >
                +972-54-487-8882
                <span className="ml-1.5 text-black/25 text-[12px]">↗</span>
              </a>
              <a
                href="https://www.linkedin.com/in/amitka/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[14px] font-medium text-black hover:text-black/50 transition-colors duration-200"
              >
                linkedin.com/in/amitka
                <span className="ml-1.5 text-black/25 text-[12px]">↗</span>
              </a>
            </div>
          </Section>

        </div>
      </main>
    </div>
  )
}
