import { Link } from 'react-router-dom'
import { getCV } from '@/lib/content'

export default function Footer() {
  const { experience } = getCV()

  return (
    <footer className="bg-[#111111] text-white">
      <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="eyebrow text-[#c5f54a]">CV / Contact</p>
            <h2 className="mt-7 max-w-3xl font-heading text-feature font-bold tracking-[-0.07em]">Designing the systems behind decisions.</h2>
          </div>
          <div className="flex flex-col gap-3 text-body text-white/70 lg:pb-2">
            <a href="mailto:amitka111@gmail.com" className="self-start transition-colors hover:text-white">amitka111@gmail.com ↗</a>
            <a href="https://www.linkedin.com/in/amitka/" target="_blank" rel="noopener noreferrer" className="self-start transition-colors hover:text-white">linkedin.com/in/amitka ↗</a>
            <Link to="/cv" className="mt-2 self-start font-semibold text-white transition-opacity hover:opacity-65">View CV ↓</Link>
          </div>
        </div>

        <div className="mt-20">
          <p className="eyebrow text-white/45">Experience</p>
          <ul className="mt-7 grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-5">
            {experience.map(({ slug, company, role, period }) => (
              <li key={slug}>
                <p className="text-title-sm font-heading font-bold leading-none tracking-[-0.04em]">{company}</p>
                <p className="mt-3 text-meta text-white/60">{role}</p>
                <p className="mt-1 text-meta text-white/60">{period}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-caption uppercase tracking-[0.1em] text-white/40">
          <span>Amit Kaplinsky · Product Designer · AI Builder</span>
          <span>Tel Aviv · 2026</span>
        </div>
      </div>
    </footer>
  )
}
