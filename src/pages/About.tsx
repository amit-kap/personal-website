import { Link } from 'react-router-dom'

const experiences = [
  { slug: 'shift', company: 'Shift', role: 'Product Design Lead', period: '2024–Present', hasImages: true },
  { slug: 'onyxia-cyber', company: 'Onyxia Cyber', role: 'Product Design Lead', period: '2024', hasImages: true },
  { slug: 'veriti', company: 'Veriti', role: 'Product Design Lead', period: '2021–2024', hasImages: true },
  { slug: 'semperis', company: 'Semperis', role: 'UX Team Lead', period: '2020–2021', hasImages: false },
  { slug: 'checkpoint', company: 'Check Point Software Technologies', role: 'UX Expert', period: '2014–2020', hasImages: true },
  { slug: 'vmp', company: 'VMP International', role: 'UX Designer', period: '2010–2014', hasImages: false },
  { slug: 'freelance', company: 'Freelance', role: 'Designer & Developer', period: '2000–2009', hasImages: false },
]

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
        <div className="px-5 sm:px-8 pb-20 animate-fade-up" style={{ paddingTop: '5.75rem' }}>

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
                <img
                  src={`${import.meta.env.BASE_URL}profile.jpg`}
                  alt="Amit Kaplinsky"
                  className="w-full aspect-square object-cover rounded-[6px] bg-black/[0.04] border border-black/[0.05]"
                />
                <img
                  src={`${import.meta.env.BASE_URL}tel-aviv.jpg`}
                  alt="Tel Aviv"
                  className="w-full aspect-square object-cover rounded-[6px] bg-black/[0.04] border border-black/[0.05]"
                />
              </div>
            </div>
          </Section>

          <Section label="CV">
            <div className="space-y-5">
              {experiences.map(({ slug, company, role, period, hasImages }) => (
                <div key={slug} className="flex items-baseline justify-between gap-4">
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
              ))}
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
