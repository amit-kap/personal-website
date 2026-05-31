import { Link } from 'react-router-dom'
import { getAllWorks, getFeaturedCaseStudy, getWorkBySlug } from '@/lib/content'
import SkeletonImage from '@/components/SkeletonImage'

export default function Work() {
  const works = getAllWorks()
  const featured = getFeaturedCaseStudy()
  const featuredWork = featured ? getWorkBySlug(featured.workSlug) : undefined

  return (
    <div className="relative z-10 min-h-screen flex flex-col bg-white">
      <main className="flex-1 pt-14 w-full">
        {/* Hero — featured case study (full-bleed, image extends to top of viewport behind nav) */}
        {featured && featuredWork && (
          <section className="relative -mt-14 animate-fade-up">
            <Link to={`/work/${featured.workSlug}#case-study`} className="group block relative">
              {/* Full-bleed hero image */}
              <div className="relative w-full h-[88vh] min-h-[560px] max-h-[860px] overflow-hidden bg-black">
                {featured.coverImage && (
                  <SkeletonImage
                    src={featured.coverImage.src}
                    alt={featured.title}
                    width={featured.coverImage.width}
                    height={featured.coverImage.height}
                    loading="eager"
                    wrapperClassName="absolute inset-0 w-full h-full"
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Gradient overlay — top fade (nav legibility) + stronger bottom fade (title legibility) */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.10) 14%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.30) 48%, rgba(0,0,0,0.70) 78%, rgba(0,0,0,0.88) 100%)',
                  }}
                />
              </div>

              {/* Title content overlaid at the bottom of the image */}
              <div className="absolute bottom-0 left-0 right-0 pb-12 sm:pb-16 px-5 sm:px-8 pointer-events-none">
                <div className="2xl:mx-auto 2xl:max-w-[1440px]">
                  <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/75 mb-3 sm:mb-4">
                    Featured
                  </p>
                  <h1 className="text-[36px] sm:text-[52px] md:text-[68px] leading-[1.02] tracking-[-0.025em] font-medium text-white max-w-3xl">
                    {featured.title}
                  </h1>
                  {featured.excerpt && (
                    <p className="mt-4 sm:mt-5 text-[16px] sm:text-[19px] leading-[1.45] text-white/85 max-w-2xl">
                      {featured.excerpt}
                    </p>
                  )}
                  <span className="inline-flex items-baseline gap-2 mt-6 sm:mt-7 text-[13px] font-medium text-white pointer-events-auto">
                    <span className="relative pb-1">
                      <span>Read the case study</span>
                      {/* hover underline — grows from left, no underline at rest */}
                      <span className="absolute left-0 right-0 bottom-0 h-px bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                    </span>
                    <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">→</span>
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Recent Work — centered */}
        <div className="2xl:mx-auto 2xl:max-w-[1440px]">
          <section className="px-5 sm:px-8 pt-20 sm:pt-24 pb-24">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-black/40 mb-6 animate-fade-up">
              Recent Work
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-12">
              {works.map((work, i) => (
                <Link
                  key={work.slug}
                  to={`/work/${work.slug}`}
                  className="group block animate-fade-up"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="rounded-[6px] overflow-hidden border border-black/[0.05] mb-4">
                    {work.tileImage ? (
                      <SkeletonImage
                        src={work.tileImage.src}
                        alt={work.company}
                        width={work.tileImage.width}
                        height={work.tileImage.height}
                        wrapperClassName="aspect-video w-full"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="aspect-video w-full bg-black/[0.04] animate-pulse" />
                    )}
                  </div>
                  <div className="flex items-baseline justify-between gap-3 mb-1.5">
                    <h2 className="text-[16px] font-medium text-black group-hover:text-black/60 transition-colors">
                      {work.company}
                    </h2>
                    <span className="text-[11px] font-mono text-black/35 shrink-0">{work.period}</span>
                  </div>
                  <p className="text-[12px] text-black/45 font-mono mb-3">{work.role}</p>
                  <p className="text-[14px] leading-6 text-black/65">{work.blurb}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
