import { Link } from 'react-router-dom'
import { getAllWorks, getFeaturedCaseStudy, getWorkBySlug } from '@/lib/content'
import SkeletonImage from '@/components/SkeletonImage'

export default function Work() {
  const works = getAllWorks()
  const featured = getFeaturedCaseStudy()
  const featuredWork = featured ? getWorkBySlug(featured.workSlug) : undefined

  return (
    <div className="relative z-10 min-h-screen flex flex-col bg-white">
      <main className="flex-1 pt-14 w-full 2xl:mx-auto 2xl:max-w-[1440px]">
        {/* Hero — featured case study */}
        {featured && featuredWork && (
          <section className="px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28 animate-fade-up">
            <Link to={`/work/${featured.workSlug}#case-study`} className="group block">
              {featured.coverImage && (
                <div className="rounded-[8px] overflow-hidden border border-black/[0.05] mb-10">
                  <SkeletonImage
                    src={featured.coverImage.src}
                    alt={featured.title}
                    width={featured.coverImage.width}
                    height={featured.coverImage.height}
                    loading="eager"
                    wrapperClassName="aspect-[16/9] w-full"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-black/40 mb-4">
                Case Study
              </p>
              <h1 className="text-[28px] sm:text-[40px] md:text-[52px] leading-[1.05] tracking-[-0.025em] font-medium text-black max-w-3xl">
                {featured.title}
              </h1>
              {featured.excerpt && (
                <p className="mt-5 text-[18px] sm:text-[22px] leading-[1.4] text-black/55 max-w-2xl">
                  {featured.excerpt}
                </p>
              )}
              <span className="inline-flex items-baseline gap-2 mt-8 text-[13px] font-medium text-black border-b border-black/15 group-hover:border-black/70 transition-colors pb-1">
                Read the case study
                <span className="text-black/35 group-hover:text-black transition-colors">→</span>
              </span>
            </Link>
          </section>
        )}

        {/* Recent Work — one tile per workplace */}
        <section className="px-5 sm:px-8 pb-24">
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
      </main>
    </div>
  )
}
