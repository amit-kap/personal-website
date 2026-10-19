/* Work with me "How I can help" (Paper "work-with-me / timeline v5"): the label,
   the Diagnose, Plan and Build cards in a row (stacked on phones), then a line
   from a dot under the row down into the package, whose centre sits on the
   footer's top edge. */
import workCopy from '@/content/workWithMe.json'
import Reveal from '@/components/Reveal'
import { labelClass } from './layout'
import { PackageTurn } from './PackageTurn'

export function Solution() {
  const { solution } = workCopy
  return (
    <section className="flex flex-col items-center px-4 pt-10">
      <div className="flex w-full max-w-[800px] flex-col gap-10">
        <Reveal as="h2" className={`${labelClass} text-center`}>
          {solution.label}
        </Reveal>
        <div className="flex flex-col">
          {/* Zero state, as in Paper "timeline / 1": each card at 40% until
              the disc reaches it (data-lit). */}
          <ol className="flex flex-col gap-5 md:flex-row">
            {solution.steps.map((step, index) => (
              <li
                key={step.title}
                className="flex flex-col items-center gap-4 rounded-container border border-border px-6 py-10 text-center opacity-40 transition-opacity duration-500 data-lit:opacity-100 md:h-[232px] md:flex-1 md:basis-0"
              >
                <h3 className="font-heading text-stmt font-medium text-foreground">
                  {index + 1}. {step.title}
                </h3>
                <p className="text-body leading-5 text-pretty text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
          {/* 320px under the row to the footer (Paper: 240; Amit asked for
              more room): a dot 17px down, the line to 259px, then the
              package (112px circle in a 6px background ring) centred on the
              section's bottom edge; z-10 keeps it above the
              footer, which comes later. */}
          <div className="relative h-[320px]">
            <svg aria-hidden="true" width="800" height="320" viewBox="0 0 800 320" className="absolute top-0 left-1/2 -translate-x-1/2 overflow-visible">
              <circle cx="400" cy="17" r="3" className="fill-border" />
              <path d="M400 17V259" fill="none" className="stroke-border" strokeWidth="2" />
            </svg>
            <div className="absolute top-full left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center rounded-pill bg-primary p-8 ring-6 ring-background">
              {/* Lucide's "package", the finished product, as a real 3D box
                  that turns now and then (PackageTurn). */}
              <PackageTurn className="size-12 shrink-0 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
