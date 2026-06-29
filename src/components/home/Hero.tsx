import { getCV } from '@/lib/content'

export default function Hero() {
  const { header } = getCV()
  const img = `${import.meta.env.BASE_URL}hero.png`

  return (
    <section className="relative w-full min-h-[86svh] overflow-hidden bg-background text-foreground">
      {/* Centered inner column — full-bleed section, content capped at 1440px */}
      <div className="relative mx-auto max-w-[1440px] w-full px-5 sm:px-8 min-h-[86svh] flex flex-col justify-center py-28">
        {/* Portrait — top-right of the centered column, native image size */}
        <div className="pointer-events-none absolute top-0 right-0 hidden md:block">
          <img src={img} alt={header.name} data-parallax="0.12" />
        </div>

        {/* Top label row */}
        <div className="absolute top-8 sm:top-10 inset-x-5 sm:inset-x-8 z-20 flex items-center justify-between border-b border-foreground/10 pb-4">
          <span
            data-reveal
            className="font-heading font-semibold uppercase tracking-[0.14em] text-label text-foreground"
          >
            Product Design portfolio
          </span>
          <span
            data-reveal
            className="font-heading font-semibold uppercase tracking-[0.14em] text-label text-muted-foreground"
          >
            Tel Aviv · 2026
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl">
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
            className="mt-9 inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-label font-medium font-sans hover:opacity-85 transition-opacity"
          >
            Contact
            <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Portrait on mobile — normal flow below the text */}
        <div className="md:hidden mt-12 -mx-5 sm:-mx-8">
          <img src={img} alt="" className="w-full max-h-[60vh] object-cover object-top" />
        </div>
      </div>
    </section>
  )
}
