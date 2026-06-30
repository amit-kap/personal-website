import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCV } from '@/lib/content'

export default function Footer() {
  const { experience } = getCV()
  const [revealed, setRevealed] = useState(false)

  // Fire the avatar light-sweep once, when the page scrolls down to the footer.
  useEffect(() => {
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 120) {
        setRevealed(true)
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <footer className="bg-foreground text-background">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 pt-12 pb-6 sm:pt-16 sm:pb-8">
        <div className="grid md:grid-cols-[0.78fr_1.22fr] gap-10 md:gap-16 pb-10 border-b border-white/10">
          {/* Left: portrait + contact */}
          <div className="flex flex-col gap-6">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full ring-1 ring-white/20 ring-offset-2 ring-offset-foreground">
              {/* inner clips the sweep band to the circle; ring stays outside */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                <img
                  src={`${import.meta.env.BASE_URL}hero.png`}
                  alt="Amit Kaplinsky"
                  className="w-full h-full object-cover object-top"
                />
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-[45deg] bg-white/70 -translate-x-[250%] ${
                    revealed ? 'footer-sweep-on' : ''
                  }`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:amitka111@gmail.com"
                className="text-meta text-white hover:text-white/60 transition-colors inline-flex items-baseline gap-1.5 self-start"
              >
                amitka111@gmail.com
                <span className="text-white/35 text-caption">↗</span>
              </a>
              <a
                href="https://wa.me/972544878882"
                className="text-meta text-white hover:text-white/60 transition-colors inline-flex items-baseline gap-1.5 self-start"
              >
                +972-54-487-8882
                <span className="text-white/35 text-caption">↗</span>
              </a>
              <a
                href="https://www.linkedin.com/in/amitka/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-meta text-white hover:text-white/60 transition-colors inline-flex items-baseline gap-1.5 self-start"
              >
                linkedin.com/in/amitka
                <span className="text-white/35 text-caption">↗</span>
              </a>
            </div>
          </div>

          {/* Right: experience + Download CV */}
          <div className="flex flex-col gap-5">
            <p className="eyebrow text-white/35">
              Experience
            </p>
            <ul className="grid grid-cols-[1.4fr_1fr_auto] md:grid-cols-[auto_auto_auto] md:whitespace-nowrap items-baseline gap-x-4 sm:gap-x-6 gap-y-3 text-meta">
              {experience.map(({ slug, company, role, period }) => (
                <li key={slug} className="contents">
                  <span className="font-medium text-white">{role}</span>
                  <span className="text-white/75">{company}</span>
                  <span className="font-mono text-white/35">{period}</span>
                </li>
              ))}
            </ul>
            <div className="pt-3">
              <Link
                to="/cv"
                className="inline-flex items-center gap-2 px-4 py-2 border border-background/25 rounded-full text-caption text-white hover:bg-background hover:text-foreground transition-colors"
              >
                Download CV
                <span className="text-caption">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-5">
          <span className="eyebrow text-white/35">
            © Amit Kaplinsky
          </span>
          <span className="eyebrow text-white/35">
            Tel Aviv · 2026
          </span>
        </div>
      </div>
    </footer>
  )
}
