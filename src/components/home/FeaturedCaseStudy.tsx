import { Link } from 'react-router-dom'
import { getFeaturedCaseStudy } from '@/lib/content'

export default function FeaturedCaseStudy() {
  const featured = getFeaturedCaseStudy()
  if (!featured) return null

  return (
    <section className="relative w-full">
      <Link
        to={`/case-studies/${featured.slug}`}
        className="group block relative w-full h-[78svh] min-h-[520px] overflow-hidden bg-foreground"
      >
        {featured.coverImage && (
          <img
            src={featured.coverImage.src}
            alt={featured.title}
            width={featured.coverImage.width}
            height={featured.coverImage.height}
            data-parallax="0.12"
            className="absolute inset-0 w-full h-full object-cover scale-[1.26]"
          />
        )}

        {/* Bottom legibility gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 32%, rgba(0,0,0,0) 62%)',
          }}
        />

        {/* Overlay text — full-bleed image, content capped to the centered 1440 column */}
        <div className="absolute inset-x-0 bottom-0 pb-14 sm:pb-20">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
            <p
              data-reveal
              className="font-mono uppercase tracking-[0.25em] text-white/75 text-[12px] sm:text-[13px] mb-4"
            >
              Featured
            </p>
            <h2
              data-reveal
              className="font-heading font-normal text-white leading-[1.04] tracking-[-0.01em] max-w-4xl"
              style={{ fontSize: 'clamp(30px, 5.5vw, 68px)' }}
            >
              {featured.title}
            </h2>
            {featured.excerpt && (
              <p
                data-reveal
                className="mt-5 text-white/85 leading-[1.5] max-w-2xl text-[16px] sm:text-[19px]"
              >
                {featured.excerpt}
              </p>
            )}
            <span className="inline-flex items-baseline gap-2 mt-7 text-[13px] font-medium text-white">
              <span className="relative pb-1">
                Read the case study
                <span className="absolute left-0 right-0 bottom-0 h-px bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
              </span>
              <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">→</span>
            </span>
          </div>
        </div>
      </Link>
    </section>
  )
}
