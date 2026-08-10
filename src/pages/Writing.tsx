import { Link } from 'react-router-dom'
import { getAllCaseStudies, getWorkBySlug } from '@/lib/content'

export default function Writing() {
  const studies = getAllCaseStudies()
  const featured = studies.find((study) => study.featured)
  const remaining = studies.filter((study) => !study.featured)

  return (
    <main className="v2-page bg-background" id="writing">
      {featured && (
        <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-24 sm:px-8 sm:pb-24 sm:pt-28 lg:pt-32">
          <Link
            to={`/case-studies/${featured.slug}`}
            className="group grid overflow-hidden rounded-[20px] bg-foreground text-white lg:grid-cols-2"
          >
            <div className="flex min-h-[370px] flex-col p-8 sm:p-12 lg:p-14">
              <div>
                <p className="text-meta font-medium tracking-[-0.02em] text-white/65">Featured article · Shift</p>
                <h2 className="mt-7 max-w-xl font-heading text-feature font-bold tracking-[-0.07em]">
                  {featured.title}
                </h2>
                <p className="mt-6 max-w-lg text-lead leading-[1.4] text-white/70">{featured.excerpt}</p>
              </div>
              <span className="read-cta mt-auto inline-flex items-center pt-10 text-body font-semibold">
                Read article
              </span>
            </div>
            {featured.coverImage && (
              <div className="min-h-[300px] overflow-hidden lg:min-h-full">
                <img
                  src={featured.coverImage.src}
                  alt=""
                  width={featured.coverImage.width}
                  height={featured.coverImage.height}
                  className="h-full w-full object-cover lg:object-[calc(50%+100px)_center] transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
            )}
          </Link>
        </section>
      )}

      {remaining.length > 0 && (
        <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-5 pb-24 sm:px-8 md:grid-cols-2 md:gap-10 sm:pb-32">
          {remaining.map((study) => (
            <Link key={study.slug} to={`/case-studies/${study.slug}`} className="group block">
              {study.coverImage && (
                <div className="aspect-[16/9] overflow-hidden rounded-[16px] bg-muted">
                  <img
                    src={study.coverImage.src}
                    alt=""
                    width={study.coverImage.width}
                    height={study.coverImage.height}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  />
                </div>
              )}
              <p className="mt-6 text-meta font-medium tracking-[-0.02em] text-muted-foreground">{getWorkBySlug(study.workSlug)?.company ?? 'Security'}</p>
              <h2 className="mt-4 max-w-md font-heading text-title-sm font-bold leading-[0.98] tracking-[-0.05em] text-foreground">{study.title}</h2>
              <p className="mt-4 max-w-xl text-body leading-[1.5] text-muted-foreground">{study.excerpt}</p>
              <span className="read-cta mt-7 inline-flex items-center text-body font-semibold text-foreground">
                Read article
              </span>
            </Link>
          ))}
        </section>
      )}
    </main>
  )
}
