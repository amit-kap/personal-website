import { Link } from 'react-router-dom'
import { getAllCaseStudies } from '@/lib/content'

export default function CaseStudies() {
  // The featured study is already shown in the Featured band above.
  const studies = getAllCaseStudies().filter((cs) => !cs.featured)
  if (studies.length === 0) return null

  return (
    <section className="w-full bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <h2
          data-reveal
          className="font-mono uppercase tracking-[0.25em] text-muted-foreground text-[12px] sm:text-[13px]"
        >
          Case Studies
        </h2>

        <div className="mt-[72px] sm:mt-24 grid sm:grid-cols-2 gap-6 sm:gap-10">
          {studies.map((study) => (
            <Link
              key={study.slug}
              to={`/case-studies/${study.slug}`}
              data-reveal
              className="group block"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted">
                {study.coverImage && (
                  <img
                    src={study.coverImage.src}
                    alt={study.title}
                    width={study.coverImage.width}
                    height={study.coverImage.height}
                    loading="lazy"
                    data-parallax="0.12"
                    className="absolute inset-0 w-full h-full object-cover scale-[1.26]"
                  />
                )}
              </div>

              <h3 className="mt-5 font-heading font-normal text-foreground leading-[1.12] tracking-[-0.01em] text-[22px] sm:text-[28px]">
                {study.title}
              </h3>
              {study.excerpt && (
                <p className="mt-3 text-muted-foreground leading-[1.5] text-[15px] sm:text-[16px] max-w-xl">
                  {study.excerpt}
                </p>
              )}
              <span className="inline-flex items-baseline gap-2 mt-4 text-[13px] font-medium text-foreground">
                Read
                <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
