import { Link } from 'react-router-dom'
import { getCV } from '@/lib/content'

export default function Footer() {
  const { header, experience } = getCV()

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 pt-12 pb-6 sm:pt-16 sm:pb-8">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 pb-10 border-b border-white/10">
          {/* Left: identity + contact */}
          <div className="flex flex-col gap-6">
            <img
              src={`${import.meta.env.BASE_URL}profile.jpg`}
              alt={header.name}
              className="h-28 w-28 sm:h-32 sm:w-32 rounded-full object-cover"
            />
            <div>
              <h2 className="text-[20px] font-medium text-white leading-tight">{header.name}</h2>
              <p className="text-[14px] text-white/55 mt-1">{header.tagline}</p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:amitka111@gmail.com"
                className="text-[14px] text-white hover:text-white/60 transition-colors inline-flex items-baseline gap-1.5 self-start"
              >
                amitka111@gmail.com
                <span className="text-white/35 text-[11px]">↗</span>
              </a>
              <a
                href="https://wa.me/972544878882"
                className="text-[14px] text-white hover:text-white/60 transition-colors inline-flex items-baseline gap-1.5 self-start"
              >
                +972-54-487-8882
                <span className="text-white/35 text-[11px]">↗</span>
              </a>
              <a
                href="https://www.linkedin.com/in/amitka/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-white hover:text-white/60 transition-colors inline-flex items-baseline gap-1.5 self-start"
              >
                linkedin.com/in/amitka
                <span className="text-white/35 text-[11px]">↗</span>
              </a>
            </div>
          </div>

          {/* Right: experience + Download CV */}
          <div className="flex flex-col gap-5">
            <p className="font-mono uppercase tracking-[0.25em] text-white/35 text-[12px] sm:text-[13px]">
              Experience
            </p>
            <ul className="flex flex-col gap-3">
              {experience.map(({ slug, company, role, period }) => (
                <li key={slug}>
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="text-[14px] text-white">
                      <span className="font-medium">{role}</span>
                      <span className="text-white/35 mx-1.5">·</span>
                      <span className="text-white/75">{company}</span>
                    </p>
                    <span className="text-[11px] font-mono text-white/35 shrink-0">{period}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-3">
              <Link
                to="/cv"
                className="inline-flex items-center gap-2 px-4 py-2 border border-background/25 rounded-full text-[12px] text-white hover:bg-background hover:text-foreground transition-colors"
              >
                Download CV
                <span className="text-[11px]">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-5">
          <span className="font-mono uppercase tracking-[0.25em] text-white/35 text-[12px] sm:text-[13px]">
            © Amit Kaplinsky
          </span>
          <span className="font-mono uppercase tracking-[0.25em] text-white/35 text-[12px] sm:text-[13px]">
            Tel Aviv · 2026
          </span>
        </div>
      </div>
    </footer>
  )
}
