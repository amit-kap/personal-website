import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { getCV } from '@/lib/content'

gsap.registerPlugin(useGSAP)

export default function Hero() {
  const { header } = getCV()
  const img = `${import.meta.env.BASE_URL}hero.png`
  const btnRef = useRef<HTMLButtonElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)

  // Slide down to the footer (it's fixed at the bottom, revealed as content scrolls up).
  const scrollToContact = () =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })

  useGSAP(
    (_ctx, contextSafe) => {
      const btn = btnRef.current
      if (!btn || !contextSafe) return
      let nudge: gsap.core.Tween | null = null
      const enter = contextSafe!(() => {
        gsap.to(btn, { scale: 1.06, duration: 0.4, ease: 'power3.out', overwrite: 'auto' })
        if (arrowRef.current)
          nudge = gsap.to(arrowRef.current, {
            x: 5,
            duration: 0.45,
            ease: 'power1.inOut',
            repeat: -1,
            yoyo: true,
          })
      })
      const leave = contextSafe!(() => {
        gsap.to(btn, { scale: 1, duration: 0.5, ease: 'power3.out', overwrite: 'auto' })
        nudge?.kill()
        if (arrowRef.current)
          gsap.to(arrowRef.current, { x: 0, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
      })
      btn.addEventListener('mouseenter', enter)
      btn.addEventListener('mouseleave', leave)
      return () => {
        btn.removeEventListener('mouseenter', enter)
        btn.removeEventListener('mouseleave', leave)
        nudge?.kill()
      }
    },
    { scope: btnRef },
  )

  return (
    <section className="relative w-full overflow-hidden bg-background text-foreground">
      {/* Centered inner column — full-bleed section, content capped at 1440px */}
      <div className="relative mx-auto max-w-[1440px] w-full px-5 sm:px-8">
        {/* Top label row */}
        <div className="absolute top-8 sm:top-10 inset-x-5 sm:inset-x-8 z-0 flex items-center justify-between border-b border-foreground/10 pb-4">
          <span
            data-reveal
            className="font-mono uppercase tracking-[0.25em] text-muted-foreground text-[12px] sm:text-[13px]"
          >
            Product Design portfolio
          </span>
          <span
            data-reveal
            className="font-mono uppercase tracking-[0.25em] text-muted-foreground text-[12px] sm:text-[13px]"
          >
            Tel Aviv · 2026
          </span>
        </div>

        {/* Row: content (vertically centered) + portrait, whose native height sets the section height */}
        <div className="flex items-stretch justify-between">
          {/* Content */}
          <div className="relative z-20 max-w-3xl self-center py-28">
            <h1
              data-reveal
              aria-label={header.name}
              className="font-heading font-extrabold text-display tracking-[-0.04em]"
            >
              <span className="block text-foreground">Amit</span>
              <span className="block text-[#a9a9a9]">Kaplinsky</span>
            </h1>

            <p
              data-reveal
              className="mt-6 font-tagline italic text-lead text-foreground/90 max-w-xl"
            >
              Over a decade of turning raw ideas into slick user experiences
            </p>

            {/* Wrapper carries the reveal so GSAP's inline transform never lands on the button (it would override the hover scale) */}
            <div data-reveal className="mt-9">
              <button
                ref={btnRef}
                type="button"
                onClick={scrollToContact}
                className="group relative overflow-hidden inline-flex items-center gap-2 rounded-full bg-foreground text-background px-8 py-4 text-body font-medium font-sans cursor-pointer"
              >
                Contact me
                <span ref={arrowRef} aria-hidden="true">→</span>
                {/* Light sweep — skewed white band glides across on hover */}
                <span
                  aria-hidden="true"
                  className="btn-sweep pointer-events-none absolute inset-y-0 left-0 w-1/2 -skew-x-[45deg] bg-white/80 -translate-x-[250%]"
                />
              </button>
            </div>
          </div>

          {/* Portrait — native size, defines the section height */}
          <div className="pointer-events-none hidden md:block self-start shrink-0 z-10">
            <img
              src={img}
              alt={header.name}
              data-parallax="0.12"
              className="shadow-[20px_20px_36px_0_rgba(0,0,0,0.10)]"
            />
          </div>
        </div>

        {/* Portrait on mobile — normal flow below the text */}
        <div className="md:hidden -mx-5 sm:-mx-8">
          <img src={img} alt="" className="w-full max-h-[60vh] object-cover object-top" />
        </div>
      </div>
    </section>
  )
}
