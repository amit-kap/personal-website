import { getCV } from '@/lib/content'

export default function Hero() {
  const { header } = getCV()

  return (
    <section className="relative w-full min-h-[76svh] flex items-center bg-background text-foreground">
      <div className="2xl:mx-auto 2xl:max-w-[1440px] w-full px-5 sm:px-8 grid md:grid-cols-2 gap-10 md:gap-16 items-center py-24">
        {/* Left: name + tagline */}
        <div className="order-2 md:order-1">
          <h1
            data-reveal
            className="font-heading font-normal leading-[1.02] tracking-[-0.01em] text-foreground"
            style={{ fontSize: 'clamp(40px, 7vw, 88px)' }}
          >
            {header.name}
          </h1>
          <p
            data-reveal
            className="mt-6 font-heading italic text-muted-foreground leading-snug max-w-xl"
            style={{ fontSize: 'clamp(18px, 2.4vw, 28px)' }}
          >
            {header.tagline}
          </p>
        </div>

        {/* Right: portrait */}
        <div className="order-1 md:order-2">
          <div className="relative w-full aspect-[4/5] max-h-[60vh] overflow-hidden rounded-xl bg-muted">
            <img
              src={`${import.meta.env.BASE_URL}profile.jpg`}
              alt={header.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
