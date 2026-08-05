import { Link } from 'react-router-dom'
import { getAllCaseStudies } from '@/lib/content'

export default function Writing() {
  const studies = getAllCaseStudies()
  const featured = studies.find((study) => study.featured)
  const remaining = studies.filter((study) => !study.featured)

  return (
    <main className="v2-page bg-background" id="writing">
      <section className="mx-auto max-w-[1440px] px-5 pt-20 sm:px-8 sm:pt-28 lg:pt-32">
        <p className="eyebrow text-muted-foreground">Writing</p>
        <h1 className="mt-4 max-w-5xl font-heading text-feature font-bold tracking-[-0.065em] text-foreground">
          Notes from building security products.
        </h1>
      </section>

      {featured && (
        <section className="mx-auto max-w-[1440px] px-5 pb-16 pt-24 sm:px-8 sm:pb-24 sm:pt-32">
          <p className="eyebrow mb-5 text-muted-foreground">Featured essay</p>
          <Link
            to={`/case-studies/${featured.slug}`}
            className="group grid overflow-hidden rounded-[20px] bg-[#111111] text-white md:grid-cols-2"
          >
            <div className="flex min-h-[420px] flex-col items-start justify-between p-8 sm:p-12 lg:p-16">
              <div>
                <p className="eyebrow text-[#a9dcdf]">Shift · 2025</p>
                <h2 className="mt-8 max-w-md font-heading text-feature font-bold tracking-[-0.065em]">
                  {featured.title}
                </h2>
                <p className="mt-7 max-w-md text-lead leading-[1.38] text-white/65">{featured.excerpt}</p>
              </div>
              <span className="inline-flex items-center gap-3 text-body font-semibold">
                Read essay <span className="text-[#7ee6ff] transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </div>
            {featured.coverImage && (
              <div className="min-h-[330px] overflow-hidden md:min-h-full">
                <img
                  src={featured.coverImage.src}
                  alt=""
                  width={featured.coverImage.width}
                  height={featured.coverImage.height}
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
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
              <p className="eyebrow mt-6 text-muted-foreground">{study.workSlug === 'checkpoint' ? 'Check Point · 2021' : 'Veriti · 2023'}</p>
              <h2 className="mt-3 max-w-md font-heading text-title-sm font-bold leading-[0.98] tracking-[-0.045em] text-foreground">{study.title}</h2>
              <p className="mt-4 max-w-xl text-body leading-[1.5] text-muted-foreground">{study.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-body font-semibold text-foreground">
                Read essay <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </span>
            </Link>
          ))}
        </section>
      )}
    </main>
  )
}
