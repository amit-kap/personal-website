import homeCopy from '@/content/home.json'
import Reveal from '@/components/Reveal'
import { bandClass, innerClass, labelClass } from './layout'

export function Problem() {
  const { problem } = homeCopy
  // The second sentence of the headline takes the foreground colour.
  const breakAt = problem.headline.indexOf('. ') + 2
  const problemLead = problem.headline.slice(0, breakAt)
  const problemPayoff = problem.headline.slice(breakAt)
  return (
    <section className={`${bandClass} pt-20`}>
      <div className={innerClass}>
        <div className="flex flex-col gap-4">
          <Reveal as="h2" className={`${labelClass} text-center`}>
            {problem.label}
          </Reveal>
          {/* Two lines on desktop: the lead (816px at 46px) runs a little past
              the 800px column, so the headline reaches 32px out on each side. */}
          <Reveal as="p" delay={0.08} className="text-center font-heading text-feature text-primary md:-mx-8">
            {problemLead.trim()}
            <span className="block text-primary-foreground">{problemPayoff}</span>
          </Reveal>
        </div>
        <Reveal as="ol" className="grid grid-cols-1 items-start gap-8 pt-4 md:grid-cols-2 md:gap-15">
          {problem.items.map((item, index) => (
            <li
              key={index}
              data-flow="problem"
              className="flex flex-col items-start gap-4 rounded-container border border-border p-6"
            >
              <span className="self-stretch text-meta text-muted-foreground">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="self-stretch font-heading text-stmt text-foreground">{item.title}</h3>
              <p className="self-stretch text-body leading-5 text-muted-foreground">{item.body}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
