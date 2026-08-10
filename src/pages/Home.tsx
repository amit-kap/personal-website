import { Link } from 'react-router-dom'
import { getAllCaseStudies, getAllWorks, getWorkBySlug } from '@/lib/content'
import ProductCarousel from '@/components/ProductCarousel'

export default function Home() {
  const works = getAllWorks()
  const shift = works.find((work) => work.slug === 'shift')
  const shiftScreens = shift
    ? [
        shift.bodyImages['01-shift-dashboard.webp'],
        shift.bodyImages['02-inventory-vendors-page.webp'],
        shift.bodyImages['04-vendor-access-graph.webp'],
        shift.bodyImages['05-threat-center.webp'],
      ].filter((image): image is NonNullable<typeof image> => Boolean(image))
    : []
  const earlierWork = works.filter((work) => work.slug !== 'shift')
  const essays = getAllCaseStudies()
  const featuredEssay = essays.find((essay) => essay.featured)
  const remainingEssays = essays.filter((essay) => !essay.featured)

  return (
    <main className="v2-page bg-background">
      <section className="relative min-h-[660px] overflow-hidden sm:min-h-[700px] lg:min-h-[760px]">
        <div className="mx-auto flex min-h-[660px] max-w-[1440px] flex-col items-center justify-center px-5 py-20 text-center sm:min-h-[700px] sm:px-8 lg:min-h-[760px] lg:py-24">
          <div className="flex max-w-5xl flex-col items-center">
            <h1 className="max-w-5xl font-heading text-[clamp(3.25rem,6.25vw,6.5rem)] font-bold leading-[0.88] tracking-[-0.075em] text-foreground">
              Making complex security products <span className="hero-outline">clear enough</span> to act&nbsp;on.
            </h1>
            <p className="mt-9 max-w-2xl text-[clamp(1.2rem,2vw,1.7rem)] leading-[1.45] tracking-[-0.035em] text-foreground/70">
              I design the systems behind security decisions, from continuous third-party defence to identity protection and enterprise-scale management.
            </p>
            <a
              href="#work"
              aria-label="Explore five products"
              className="header-contact-cta explore-scroll-cta mt-7 inline-flex"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className="h-5 w-5">
                <path d="M8 2v10m0 0 4-4m-4 4L4 8" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section id="work" className="scroll-mt-8 bg-surface-muted">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28">
        <h2 className="text-meta font-semibold tracking-[-0.02em] text-foreground/65">
          Featured work
        </h2>

        {shift && (
          <Link to={`/work/${shift.slug}`} className="group mt-12 grid overflow-hidden rounded-[20px] bg-shift-violet text-white lg:grid-cols-[0.88fr_1.12fr]">
            <div className="flex min-h-[440px] flex-col p-8 sm:p-12 lg:p-14">
              <div>
                <h3 className="max-w-lg font-heading text-feature font-bold tracking-[-0.07em]">
                  Third-party risk, continuously defended.
                </h3>
                <div className="mt-5 text-meta leading-5 tracking-[-0.02em] text-white/75">
                  <p className="font-medium">Shift · {shift.role}</p>
                  <p className="mt-1 text-white/60">{shift.period}</p>
                </div>
                <p className="mt-6 max-w-md text-lead leading-[1.4] text-white/82">
                  A vendor-security system that connects evidence, risk, access, and human judgment in one operating flow.
                </p>
              </div>
              <span className="read-cta mt-auto inline-flex w-fit items-center pt-12 text-body font-semibold text-white">
                View case study
              </span>
            </div>
            {shiftScreens.length > 0 && (
              <ProductCarousel
                images={shiftScreens}
                alt="Shift product surfaces"
                plateClassName="min-h-[330px] bg-white p-5 sm:px-7 sm:py-12 lg:px-8 lg:py-14"
                cornerClassName="rounded-[10px]"
              />
            )}
          </Link>
        )}

        <div className="mt-20 flex items-end justify-between gap-8">
          <p className="text-meta font-semibold tracking-[-0.02em] text-muted-foreground">Earlier product work</p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {earlierWork.map((work) => (
            <Link key={work.slug} to={`/work/${work.slug}`} className="group flex h-full flex-col">
              {work.tileImage && (
                <div className="aspect-[16/10] overflow-hidden rounded-[14px] bg-muted">
                  <img
                    src={work.tileImage.src}
                    alt=""
                    width={work.tileImage.width}
                    height={work.tileImage.height}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  />
                </div>
              )}
              <h3 className="mt-5 min-h-[3.75rem] font-heading text-title-sm font-bold leading-[0.98] tracking-[-0.05em] text-foreground">{work.productTitle}</h3>
              <div className="mt-2 min-h-11">
                <p className="text-meta font-medium leading-5 tracking-[-0.02em] text-muted-foreground">
                  {work.company} · {work.role}
                </p>
                <p className="mt-1 text-meta leading-5 tracking-[-0.02em] text-muted-foreground/75">{work.period}</p>
              </div>
              <p className="mt-3 text-body leading-[1.45] text-muted-foreground">{work.blurb}</p>
            </Link>
          ))}
        </div>
        </div>
      </section>

      <section id="writing" className="bg-background">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-meta font-semibold tracking-[-0.02em] text-foreground/65">Writing from the work</p>

          {featuredEssay && (
            <Link
              to={`/case-studies/${featuredEssay.slug}`}
              className="group mt-10 grid overflow-hidden rounded-[20px] bg-foreground text-white lg:grid-cols-2"
            >
              <div className="flex min-h-[370px] flex-col p-8 sm:p-12 lg:p-14">
                <div>
                  <p className="text-meta font-medium tracking-[-0.02em] text-white/65">Featured article · Shift</p>
                  <h3 className="mt-7 max-w-xl font-heading text-feature font-bold tracking-[-0.07em]">{featuredEssay.title}</h3>
                  <p className="mt-6 max-w-lg text-lead leading-[1.4] text-white/70">{featuredEssay.excerpt}</p>
                </div>
                <span className="read-cta mt-auto inline-flex items-center pt-10 text-body font-semibold">
                  Read article
                </span>
              </div>
              {featuredEssay.coverImage && (
                <div className="min-h-[300px] overflow-hidden lg:min-h-full">
                  <img
                    src={featuredEssay.coverImage.src}
                    alt=""
                    width={featuredEssay.coverImage.width}
                    height={featuredEssay.coverImage.height}
                    loading="lazy"
                    className="h-full w-full object-cover lg:object-[calc(50%+100px)_center] transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                  />
                </div>
              )}
            </Link>
          )}

          {remainingEssays.length > 0 && (
            <div className="mt-7 grid gap-5 md:grid-cols-2">
              {remainingEssays.map((essay) => (
                <Link
                  key={essay.slug}
                  to={`/case-studies/${essay.slug}`}
                  className="group rounded-[16px] bg-white/55 p-7 transition-colors hover:bg-white sm:p-8"
                >
                  <p className="text-meta font-medium tracking-[-0.02em] text-muted-foreground">
                    {getWorkBySlug(essay.workSlug)?.company ?? 'Security'}
                  </p>
                  <h3 className="mt-4 max-w-md font-heading text-title-sm font-bold leading-[0.98] tracking-[-0.05em] text-foreground">{essay.title}</h3>
                  <p className="mt-4 max-w-xl text-body leading-[1.5] text-muted-foreground">{essay.excerpt}</p>
                  <span className="read-cta mt-7 inline-flex items-center text-body font-semibold text-foreground">
                    Read article
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
