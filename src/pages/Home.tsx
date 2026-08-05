import { Link } from 'react-router-dom'
import { getAllWorks } from '@/lib/content'

export default function Home() {
  const works = getAllWorks()
  const shift = works.find((work) => work.slug === 'shift')
  const earlierWork = works.filter((work) => work.slug !== 'shift')

  return (
    <main className="v2-page bg-background">
      <section className="mx-auto grid min-h-[min(760px,calc(100svh-68px))] max-w-[1440px] grid-cols-1 items-center px-5 py-20 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-28">
        <div className="max-w-4xl">
          <p className="eyebrow text-muted-foreground">Security product design / 2014—now</p>
          <h1 className="mt-7 font-heading text-hero font-bold tracking-[-0.075em] text-foreground">
            Making complex security products clear enough to act on.
          </h1>
          <p className="mt-9 max-w-2xl text-[clamp(1.2rem,2vw,1.7rem)] leading-[1.45] tracking-[-0.035em] text-foreground/70">
            I design the systems behind security decisions—from continuous third-party defence to identity protection and enterprise-scale management.
          </p>
          <a href="#work" className="mt-7 inline-flex items-center gap-2 text-body font-semibold text-foreground transition-opacity hover:opacity-60">
            Explore five products <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <section id="work" className="mx-auto max-w-[1440px] scroll-mt-8 px-5 pb-24 sm:px-8 sm:pb-32">
        <p className="eyebrow text-muted-foreground">Selected work</p>
        <h2 className="mt-4 max-w-6xl font-heading text-feature font-bold tracking-[-0.07em] text-foreground">
          Five security products. Five different forms of clarity.
        </h2>

        {shift && (
          <Link to={`/work/${shift.slug}`} className="group mt-12 grid overflow-hidden rounded-[20px] bg-[#7755f4] text-white lg:grid-cols-[0.88fr_1.12fr]">
            <div className="flex min-h-[440px] flex-col items-start justify-between p-8 sm:p-12 lg:p-14">
              <div>
                <p className="eyebrow text-white/70">01 / Shift / Founding Designer / 2024—now</p>
                <h3 className="mt-8 max-w-lg font-heading text-feature font-bold tracking-[-0.07em]">
                  Third-party risk, continuously defended.
                </h3>
                <p className="mt-7 max-w-md text-lead leading-[1.4] text-white/82">
                  A vendor-security system that connects evidence, risk, access, and human judgment in one operating flow.
                </p>
              </div>
              <span className="inline-flex items-center gap-3 text-body font-semibold">View Shift <span className="transition-transform duration-300 group-hover:translate-x-1">↗</span></span>
            </div>
            {shift.tileImage && (
              <div className="min-h-[330px] overflow-hidden bg-[#f4f1ff] p-5 sm:p-7 lg:p-8">
                <img
                  src={shift.tileImage.src}
                  alt="Shift vendor risk dashboard"
                  width={shift.tileImage.width}
                  height={shift.tileImage.height}
                  className="h-full w-full rounded-[10px] object-cover object-left-top transition-transform duration-700 ease-out group-hover:scale-[1.018]"
                />
              </div>
            )}
          </Link>
        )}

        <div className="mt-20 flex items-end justify-between gap-8">
          <p className="eyebrow text-muted-foreground">Earlier product work</p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {earlierWork.map((work, index) => (
            <Link key={work.slug} to={`/work/${work.slug}`} className="group block">
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
              <p className="eyebrow mt-5 text-muted-foreground">0{index + 2} / {work.company} / {work.period}</p>
              <h3 className="mt-3 font-heading text-title-sm font-bold leading-[0.98] tracking-[-0.05em] text-foreground">{work.productTitle}</h3>
              <p className="mt-3 text-body leading-[1.45] text-muted-foreground">{work.blurb}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
