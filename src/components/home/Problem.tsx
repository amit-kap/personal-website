/* Work with me "Sound familiar?": a two-line headline, then the four problems
   as a timeline. The origin node sits under the headline; TimelineRoute draws
   the rail (and its ring nodes) from the data-route elements here: the origin,
   each item and the node placeholder on its rail. Each item lights when the
   scroll-driven disc reaches its node (it sets data-lit). */
import workCopy from '@/content/workWithMe.json'
import Reveal from '@/components/Reveal'
import { bandClass, innerClass, labelClass } from './layout'

export function Problem() {
  const { problem } = workCopy
  // The second sentence of the headline takes the foreground colour.
  const breakAt = problem.headline.indexOf('. ') + 2
  const problemLead = problem.headline.slice(0, breakAt)
  const problemPayoff = problem.headline.slice(breakAt)
  return (
    <section className={`${bandClass} pt-20`}>
      <div className={innerClass}>
        <div className="flex flex-col gap-4 pb-8">
          <Reveal as="h2" className={`${labelClass} text-center`}>
            {problem.label}
          </Reveal>
          {/* Two lines on desktop: the lead (816px at 46px) runs a little past
              the 800px column, so the headline reaches 32px out on each side. */}
          <Reveal as="p" delay={0.08} className="text-center font-heading text-feature font-normal text-primary md:-mx-8">
            {problemLead.trim()}
            <span className="block text-primary-foreground">{problemPayoff}</span>
          </Reveal>
        </div>
        <div className="relative">
          {/* The origin's 18px box, 3px down (Paper: its centre is 12px below the top). */}
          <span data-route="origin" className="absolute top-[3px] left-1/2 size-[18px] -translate-x-1/2" />
          {/* The first item starts 316px under the origin (120 on phones), so
              the rail has room to turn in from the centre. The rail is 24px in
              from the column edge, the items 72px (56 on phones). Every item is
              320px tall but the last, 264px (200 and auto on phones), so the
              problems arrive one at a time as you scroll. Paper's timeline
              ends with the last item; phones keep 100px below it. */}
          <ol className="flex flex-col pt-30 pb-25 md:pt-[316px] md:pb-0">
            {problem.items.map((item, index) => (
              <li
                key={index}
                data-route="item"
                className="group relative ml-14 flex min-h-50 flex-col gap-2 opacity-40 transition-opacity duration-500 data-lit:opacity-100 md:h-[320px] md:min-h-0 md:ml-18 last:min-h-0 md:last:h-[264px]"
              >
                <span data-route="node" className="absolute top-2.5 -left-[38px] size-3 md:-left-[54px]" />
                <div className="flex items-baseline">
                  <span className="w-10 shrink-0 text-meta text-muted-foreground transition-colors duration-500 group-data-lit:text-primary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-heading text-title-sm font-normal tracking-[-0.01em] text-foreground">{item.title}</h3>
                </div>
                <p className="max-w-[520px] pl-10 text-body leading-[1.375] text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
