/* Work with me "How I can help": the Diagnose, Plan and Build steps as
   rounded cards in a row (stacked on phones), then the package circle. TimelineRoute
   draws the line from the label, across the cards and down to the package from
   the data-route elements here; each step lights (data-lit) when the disc
   reaches it, and the bloom behind the package when the disc lands. */
import workCopy from '@/content/workWithMe.json'
import Reveal from '@/components/Reveal'
import { labelClass } from './layout'
import { PackageTurn } from './PackageTurn'

export function Solution() {
  const { solution } = workCopy
  return (
    /* 62px top on desktop (8px on phones): the label sits that far under the
       last problem, as in Paper. */
    <section className="flex flex-col items-center px-4 pt-2 md:px-[57px] md:pt-[62px]">
      <div className="flex w-full max-w-[800px] flex-col">
        <Reveal as="h2" className={`${labelClass} text-center`}>
          <span data-route="label" className="block">{solution.label}</span>
        </Reveal>
        {/* The route turns in above the cards: 510px under the label on
            desktop, so the route after the label is as long as the route
            before it. The row's 60px gaps are the connectors, which the route
            draws. */}
        <ol className="mt-20 flex flex-col gap-10 md:mt-[510px] md:flex-row md:gap-15">
          {solution.steps.map((step, index) => (
            <li
              key={step.title}
              data-route="step"
              className="group flex flex-col items-center gap-4 rounded-[24px] border border-border p-6 text-center transition-colors duration-500 data-lit:border-primary/60 md:h-[232px] md:flex-1 md:basis-0 md:px-6 md:py-10"
            >
              <h3 className="font-heading text-stmt font-medium text-foreground opacity-40 transition-opacity duration-500 group-data-lit:opacity-100">
                {index + 1}. {step.title}
              </h3>
              <p className="text-body leading-5 text-muted-foreground opacity-50 transition-opacity duration-500 group-data-lit:opacity-100">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
        {/* The package sits half over the footer: its 160px box (112px circle
            plus 24px padding) hangs 80px below the section, so the circle's
            centre is on the footer's top edge; z-10 keeps it above the
            footer, which comes later. On desktop 600px below the cards puts
            that centre 680px under them (90px on phones). */}
        <Reveal className="relative z-10 mt-[90px] -mb-20 md:mt-[600px] flex w-full flex-col items-center">
          <div data-route="final" className="relative flex items-center rounded-pill p-6">
            <span
              data-route="bloom"
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 size-[180px] -translate-x-1/2 -translate-y-1/2 rounded-pill bg-primary/35 opacity-0 blur-[48px] transition-opacity duration-700 data-lit:opacity-100"
            />
            <div className="relative z-[1] flex items-center rounded-pill bg-primary p-8 ring-6 ring-background">
              {/* Lucide's "package", the finished product, as a real 3D box
                  that turns now and then (PackageTurn). */}
              <PackageTurn className="size-12 shrink-0 text-primary-foreground" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
