/* Work with me "Sound familiar?": a two-line headline, then the four problems
   on a serpentine route (Paper "work-with-me / timeline v5"). On desktop the
   route is a fixed 800 × 1627 journey: an origin ring 160px above the route,
   a straight drop into it, then four 300px lanes between x 40 and 760,
   turned with 40px rounded corners, a stop ring on the side beside each problem.
   After problem 04 it returns to the centre and runs straight down to a ring
   just above "How I can help". Phones get the problems as a plain list. */
import workCopy from '@/content/workWithMe.json'
import Reveal from '@/components/Reveal'
import { bandClass, innerClass, labelClass } from './layout'

/* The origin ring sits at y 12 and the line drops 160px, turning into the
   first pass with a rounded corner instead of a ring (Amit's addition to
   Paper v5, which starts the route at the first pass). Lanes are 300px
   (Paper: 160; Amit asked for more room between the problems). */
const drop = 160
const lane = 300
/* The passes sit a lane apart from y 172; each lane's text (62px) is centred between two. */
const passes = [0, 1, 2, 3].map((i) => 12 + drop + i * lane)
const textTop = (lane - 62) / 2
const [p1, p2, p3, p4] = passes
const p5 = p4 + lane
/* After problem 04 the line returns to the centre and runs 207px down to the
   end ring; the journey ends at the ring's edge, the label 40px below it. */
const endY = p5 + 40 + 207
const height = endY + 8
const routePath = [
  `M400 12V${p1 - 40}A40 40 0 0 0 440 ${p1}H720A40 40 0 0 1 760 ${p1 + 40}V${p2 - 40}A40 40 0 0 1 720 ${p2}`,
  `H80A40 40 0 0 0 40 ${p2 + 40}V${p3 - 40}A40 40 0 0 0 80 ${p3}`,
  `H720A40 40 0 0 1 760 ${p3 + 40}V${p4 - 40}A40 40 0 0 1 720 ${p4}`,
  `H80A40 40 0 0 0 40 ${p4 + 40}V${p5 - 40}A40 40 0 0 0 80 ${p5}`,
  `H360A40 40 0 0 1 400 ${p5 + 40}V${endY}`,
].join('')

export function Problem() {
  const { problem } = workCopy
  // The second sentence of the headline takes the foreground colour.
  const breakAt = problem.headline.indexOf('. ') + 2
  const problemLead = problem.headline.slice(0, breakAt)
  const problemPayoff = problem.headline.slice(breakAt)
  return (
    <section className={`${bandClass} pt-10`}>
      <div className={`${innerClass} gap-10!`}>
        <div className="flex flex-col gap-4">
          <Reveal as="h2" className={`${labelClass} text-center`}>
            {problem.label}
          </Reveal>
          {/* Two lines on desktop: the lead (816px at 46px) runs a little past
              the 800px column, so the headline reaches 32px out on each side. */}
          <Reveal as="p" delay={0.08} className="text-center font-heading text-feature font-normal text-primary md:-mx-8">
            {problemLead.trim()}
            <span className="block text-foreground">{problemPayoff}</span>
          </Reveal>
        </div>
        <div data-journey="box" className="relative md:h-(--journey-h)" style={{ '--journey-h': `${height}px` } as React.CSSProperties}>
          <svg
            aria-hidden="true"
            width="800"
            height={height}
            viewBox={`0 0 800 ${height}`}
            className="absolute inset-0 hidden overflow-visible md:block"
          >
            <path data-journey="path" d={routePath} fill="none" className="stroke-border" strokeWidth="2" />
            {/* The origin ring, then the stops the disc pauses on (JourneyMotion). */}
            <circle cx="400" cy="12" r="7" className="fill-background stroke-muted-foreground" strokeWidth="1.5" />
            {/* A stop ring beside each problem, on the lane's side line level
                with its text (right, left, right, left), then the end ring. */}
            {[...passes.map((y, i) => [i % 2 ? 40 : 760, y + lane / 2]), [400, endY]].map(([x, y]) => (
              <circle key={y} data-journey="stop" cx={x} cy={y} r="7" className="fill-background stroke-muted-foreground" strokeWidth="1.5" />
            ))}
            {/* The disc rests on the origin ring (Paper "disc" in timeline / 1). */}
            <g data-journey="disc">
              <circle cx="400" cy="12" r="9" className="fill-background stroke-primary" strokeWidth="1.5" />
              <circle cx="400" cy="12" r="3" className="fill-primary" />
            </g>
          </svg>
          {/* The disc's glow, centred on the origin. */}
          <span data-journey="glow" aria-hidden="true" className="pointer-events-none absolute top-[-18px] left-[370px] hidden size-[60px] rounded-pill bg-primary/35 blur-[24px] md:block" />
          {/* Zero state, as in Paper "timeline / 1": each problem at 40% until
              the disc reaches its lane (data-lit, set by JourneyMotion). */}
          <ol className="flex flex-col gap-10 md:block">
            {problem.items.map((item, index) => (
              <li
                key={index}
                data-journey="problem"
                className="flex flex-col items-center gap-2 text-center opacity-40 transition-opacity duration-500 data-lit:opacity-100 md:absolute md:left-20 md:w-[640px]"
                style={{ top: passes[index] + textTop }}
              >
                <h3 className="font-heading text-title-sm font-normal tracking-[-0.01em] text-foreground">{item.title}</h3>
                <p className="text-body leading-[1.375] text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
