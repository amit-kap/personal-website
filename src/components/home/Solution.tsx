/* Work with me "How I can help" (Paper "work-with-me / timeline v5"): the label,
   the Diagnose, Plan and Build cards in a row (stacked on phones), then a line
   from a dot under the row down into the package, whose centre sits on the
   footer's top edge. */
import workCopy from '@/content/workWithMe.json'
import Reveal from '@/components/Reveal'
import { labelClass } from './layout'
import { PackageTurn } from './PackageTurn'
import './journey.css'

export function Solution() {
  const { solution } = workCopy
  return (
    <section className="flex flex-col items-center px-4 min-[900px]:pt-10">
      <div className="flex w-full max-w-[800px] flex-col min-[900px]:gap-10">
        <Reveal as="h2" className={`${labelClass} text-center`}>
          {solution.label}
        </Reveal>
        <span aria-hidden="true" className="journey-mobile-connector" />
        <div className="flex flex-col">
          {/* On desktop JourneyMotion reveals the cards after the final stop. */}
          <ol className="journey-solution-cards flex flex-col gap-14 min-[900px]:flex-row min-[900px]:gap-5">
            {solution.steps.map((step, index) => (
              <li
                key={step.title}
                data-journey="step"
                className="relative flex flex-col items-center gap-4 rounded-container border border-border px-6 py-10 text-center min-[900px]:h-[232px] min-[900px]:flex-1 min-[900px]:basis-0"
              >
                <h3 className="font-heading text-stmt font-medium text-foreground">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-body leading-5 text-pretty text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
          {/* 320px under the row to the footer (Paper: 240; Amit asked for
              more room): a dot 49px down, the line to 259px, then the
              package (112px circle in a 6px background ring) centred on the
              section's bottom edge; z-10 keeps it above the footer, which
              comes later. JourneyMotion draws the line and ignites the
              package (Paper "detail / d — Package ignites"). */}
          <div className="relative h-[320px]">
            <svg aria-hidden="true" width="100%" height="320" viewBox="0 0 800 320" preserveAspectRatio="xMidYMin slice" className="absolute inset-0 h-full w-full overflow-visible">
              <circle data-journey="dot" cx="400" cy="49" r="3" className="fill-border" />
              <path data-journey="line" d="M400 49V259" fill="none" className="stroke-border" strokeWidth="2" />
            </svg>
            <div className="absolute top-full left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <span
                data-journey="package-glow"
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-pill bg-primary/45 opacity-0 blur-[40px]"
              />
              <div data-journey="package" className="relative flex items-center rounded-pill bg-primary p-8 text-primary-foreground ring-6 ring-card/90">
                {/* The primary fill JourneyMotion grows from the centre. */}
                <span data-journey="package-fill" aria-hidden="true" className="absolute inset-0 rounded-pill bg-primary" />
                {/* Lucide's "package", the finished product, as a real 3D box
                    that turns slowly (PackageTurn). */}
                <PackageTurn className="relative size-12 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
