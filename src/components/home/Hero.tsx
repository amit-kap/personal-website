import { getCV } from '@/lib/content'

export default function Hero() {
  const { header } = getCV()
  const img = `${import.meta.env.BASE_URL}hero.png`

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

            <a
              data-reveal
              href="mailto:amitka111@gmail.com"
              className="group relative overflow-hidden mt-9 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-8 py-4 text-body font-medium font-sans"
            >
              Contact me
              <span aria-hidden="true">→</span>
              {/* Light sweep — skewed white band glides across on hover */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-1/4 skew-x-[45deg] bg-white/60 -translate-x-[250%] transition-transform duration-700 ease-out group-hover:translate-x-[500%]"
              />
            </a>
          </div>

          {/* Portrait — native size, defines the section height */}
          <div className="pointer-events-none hidden md:block self-start shrink-0 z-10">
            <img src={img} alt={header.name} data-parallax="0.12" />
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
