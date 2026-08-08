import { Link } from 'react-router-dom'
import { getAllCaseStudies, getAllWorks, getWorkBySlug } from '@/lib/content'
import ProductCarousel from '@/components/ProductCarousel'
import heroDecisionMap from '@/assets/hero-decision-map-v2.png'

export default function Home() {
  const works = getAllWorks()
  const shift = works.find((work) => work.slug === 'shift')
  const shiftScreens = shift
    ? [
        shift.bodyImages['01-shift-dashboard.png'],
        shift.bodyImages['02-inventory-vendors-page.png'],
        shift.bodyImages['04-vendor-access-graph.png'],
        shift.bodyImages['05-threat-center.png'],
      ].filter((image): image is NonNullable<typeof image> => Boolean(image))
    : []
  const earlierWork = works.filter((work) => work.slug !== 'shift')
  const essays = getAllCaseStudies()
  const featuredEssay = essays.find((essay) => essay.featured)
  const remainingEssays = essays.filter((essay) => !essay.featured)

  return (
    <main className="v2-page bg-background">
      <section className="relative isolate min-h-[min(760px,calc(100svh-68px))] overflow-hidden bg-[#f9eddf]">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
          <img
            src={heroDecisionMap}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>
        <div className="relative mx-auto grid min-h-[min(760px,calc(100svh-68px))] max-w-[1440px] grid-cols-1 items-center px-5 py-20 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
          <div className="max-w-4xl">
          <h1 className="font-heading text-hero font-bold tracking-[-0.075em] text-foreground lg:max-w-[min(50vw,720px)]">
            Making complex security products clear enough to act on.
          </h1>
          <p className="mt-9 max-w-2xl text-[clamp(1.2rem,2vw,1.7rem)] leading-[1.45] tracking-[-0.035em] text-foreground/70">
            I design the systems behind security decisions, from continuous third-party defence to identity protection and enterprise-scale management.
          </p>
          <a href="#work" className="mt-7 inline-flex items-center gap-2 text-body font-semibold text-foreground transition-opacity hover:opacity-60">
            Explore five products <span aria-hidden="true">↓</span>
          </a>
          </div>
        </div>
      </section>

      <section id="work" className="mx-auto max-w-[1440px] scroll-mt-8 px-5 py-24 sm:px-8 sm:py-32">
        <h2 className="max-w-6xl font-heading text-feature font-bold tracking-[-0.07em] text-foreground">
          Five security products. Five different forms of clarity.
        </h2>

        {shift && (
          <Link to={`/work/${shift.slug}`} className="group mt-12 grid overflow-hidden rounded-[20px] bg-[#7755f4] text-white lg:grid-cols-[0.88fr_1.12fr]">
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
              <span className="mt-auto inline-flex w-fit items-center gap-3 pt-12 text-body font-semibold text-white">
                Read the Shift story
                <span className="text-lg leading-none transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">↗</span>
              </span>
            </div>
            {shiftScreens.length > 0 && (
              <ProductCarousel
                images={shiftScreens}
                alt="Shift product surfaces"
                plateClassName="min-h-[330px] bg-[#f4f1ff] p-5 sm:px-7 sm:py-12 lg:px-8 lg:py-14"
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
      </section>

      <section id="writing" className="bg-[#e2e6fb]">
        <div className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-meta font-semibold tracking-[-0.02em] text-foreground/65">Writing from the work</p>

          {featuredEssay && (
            <Link
              to={`/case-studies/${featuredEssay.slug}`}
              className="group mt-10 grid overflow-hidden rounded-[20px] bg-[#111111] text-white lg:grid-cols-2"
            >
              <div className="flex min-h-[370px] flex-col p-8 sm:p-12 lg:p-14">
                <div>
                  <p className="text-meta font-medium tracking-[-0.02em] text-[#a9dcdf]">Featured article · Shift</p>
                  <h3 className="mt-7 max-w-xl font-heading text-feature font-bold tracking-[-0.07em]">{featuredEssay.title}</h3>
                  <p className="mt-6 max-w-lg text-lead leading-[1.4] text-white/70">{featuredEssay.excerpt}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-3 pt-10 text-body font-semibold">
                  Read article <span className="text-[#7ee6ff] text-lg leading-none transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">↗</span>
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
                  <span className="mt-7 inline-flex items-center gap-2 text-body font-semibold text-foreground">
                    Read article <span className="transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">↗</span>
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
