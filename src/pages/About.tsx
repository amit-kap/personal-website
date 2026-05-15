import { Link } from 'react-router-dom'

const experiences = [
  { slug: 'stealth-startup', company: 'Stealth Startup', role: 'Product Design Lead', period: '2024–Present', hasImages: false },
  { slug: 'onyxia-cyber', company: 'Onyxia Cyber', role: 'Product Design Lead', period: '2024', hasImages: true },
  { slug: 'veriti', company: 'Veriti', role: 'Product Design Lead', period: '2021–2024', hasImages: true },
  { slug: 'semperis', company: 'Semperis', role: 'UX Team Lead', period: '2020–2021', hasImages: false },
  { slug: 'checkpoint', company: 'Check Point Software Technologies', role: 'UX Expert', period: '2014–2020', hasImages: true },
  { slug: 'vmp', company: 'VMP International', role: 'UX Designer', period: '2010–2014', hasImages: false },
  { slug: 'freelance', company: 'Freelance', role: 'Designer & Developer', period: '2000–2009', hasImages: false },
]

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="grid md:grid-cols-12 gap-6 md:gap-16 py-16 border-t border-black/10">
      <div className="md:col-span-6">
        <h2 className="text-[17px] font-mono uppercase tracking-[0.25em] text-black/35">
          {label}
        </h2>
      </div>
      <div className="md:col-span-6">{children}</div>
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
              <h1 className="text-[24px] sm:text-[30px] font-medium tracking-tight leading-tight">
                Amit Kaplinsky
              </h1>
              <p className="text-[17px] leading-8 text-black">
                Product Designer based in Tel Aviv with over two decades of experience crafting enterprise software that people actually enjoy using.
              </p>
              <p className="text-[17px] leading-8 text-black">
                I've led design at cybersecurity companies including Onyxia Cyber, Veriti, Semperis, and Check Point — turning complex security problems into clear, intuitive interfaces.
              </p>
              <p className="text-[17px] leading-8 text-black">
                I care about details, structure, and shipping work that earns its place.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <img
                  src={`${import.meta.env.BASE_URL}profile.jpg`}
                  alt="Amit Kaplinsky"
                  className="w-full aspect-square object-cover rounded-[6px] bg-black/[0.04]"
                />
                <img
                  src={`${import.meta.env.BASE_URL}tel-aviv.jpg`}
                  alt="Tel Aviv"
                  className="w-full aspect-square object-cover rounded-[6px] bg-black/[0.04]"
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
