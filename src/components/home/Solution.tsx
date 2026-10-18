/* Work with me "How I can help": Diagnose, Plan and Build cards joined by connector
   lines down to the package circle. FlowOverlay animates the lines, measuring
   them from the data-flow attributes here. */
import workCopy from '@/content/workWithMe.json'
import Reveal from '@/components/Reveal'
import { innerClass, labelClass } from './layout'

/* dot - line - dot. Overlaps the neighbouring card borders by 3px (the dots'
   radius), exactly as in Paper. */
function Connector({ className = 'h-10' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex shrink-0 flex-col items-center gap-0.5 ${className}`}>
      <span className="size-1.5 shrink-0 rounded-pill bg-border" />
      <span className="w-0.5 flex-1 bg-border" />
      <span className="size-1.5 shrink-0 rounded-pill bg-border" />
    </div>
  )
}

/* One icon per step, in order: inner SVG paths on a 32 grid. */
const stepIcons = [
  // Diagnose
  <>
    <path d="M14.666 2.666v2.668" />
    <path d="M6.666 2.666v2.668" />
    <path d="M6.666 4H5.334a2.666 2.666 90 0 0-2.668 2.666v5.334a8 8 0 0 0 16 0V6.666a2.666 2.666 90 0 0-2.666-2.666h-1.334" />
    <path d="M235 27H233.668a2.666 2.666 0 0 0-2.668 2.666v5.334a8 8 0 0 0 16 0V29.666a2.666 2.666 0 0 0-2.666-2.666h-1.334" />
    <path d="M10.666 20a8 8 0 0 0 16 0v-4" />
    <circle cx="26.666" cy="13.334" r="1.28" />
  </>,
  // Plan
  <>
    <path d="M17.333 6.667h10.667" />
    <path d="M17.333 16h10.667" />
    <path d="M17.333 25.333h10.667" />
    <path d="M4 22.667l2.667 2.666 5.333-5.333" />
    <rect x="4" y="5.333" width="8" height="8" rx="1" />
  </>,
  // Build
  <>
    <path d="M13.333 24v-9.333" />
    <path d="M14.825 2.94a2.667 2.667 0 0 1 2.35 0l10.453 5.128A0.667 0.667 0 0 1 27.333 9.333h-22.666a0.667 0.667 0 0 1-0.294-1.265z" />
    <path d="M18.667 24v-9.333" />
    <path d="M24 24v-9.333" />
    <path d="M4 29.333h24" />
    <path d="M8 24v-9.333" />
  </>,
]

const stepCardClass = 'flex flex-col items-center gap-4 border border-border p-6'

export function Solution() {
  const { solution } = workCopy
  return (
    /* 78px top: with the label (20px) and its gap (16px), the problem cards sit
       114px above Diagnose, the same as Build to the final circle. */
    <section className="flex flex-col items-center px-4 pt-19.5 md:px-[57px]">
      <div className={innerClass}>
        <Reveal as="h2" className={`${labelClass} text-center`}>
          {solution.label}
        </Reveal>
        <Reveal as="ol" className="flex flex-col items-stretch">
          {solution.steps.map((step, index) => (
            <li key={step.title} className="contents">
              {/* 80px connectors between cards; -mt-[3px] tucks the end dots over the card borders. */}
              {index > 0 && <Connector className="-mt-[3px] h-20" />}
              <div data-flow="step" className={`${stepCardClass} rounded-container ${index > 0 ? '-mt-[3px]' : ''}`}>
                <svg className="size-8 shrink-0 text-primary" width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {stepIcons[index]}
                </svg>
                <h3 className="font-heading text-stmt font-medium text-foreground">{step.title}</h3>
                <p className="text-body leading-5 text-muted-foreground">{step.body}</p>
              </div>
            </li>
          ))}
        </Reveal>
        <div className="-mt-4 flex flex-col items-center">
          {/* Runs on to the solid circle, which sits 114px below Build. */}
          <Connector className="relative z-10 -mt-[3px] -mb-6 h-[120px]" />
          {/* The package sits half over the footer: its 160px box (112px circle
              plus 24px padding) hangs 80px below the section, so the circle's
              centre is on the footer's top edge; z-10 keeps it above the
              footer, which comes later. */}
          <Reveal className="relative z-10 -mt-[3px] -mb-20 flex w-full flex-col items-center">
            <div data-flow="final" className="relative flex items-center rounded-pill p-6">
              <div className="relative z-[1] flex items-center rounded-pill bg-primary p-8 ring-6 ring-background">
                {/* Lucide "package": the finished product. Drawn on a 24 grid at
                    48px, so a 0.75 stroke is the site's 1.5px line. */}
                <svg className="size-12 shrink-0 text-primary-foreground" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                  <path d="M12 22V12" />
                  <polyline points="3.29 7 12 12 20.71 7" />
                  <path d="m7.5 4.27 9 5.15" />
                </svg>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
