import Reveal from '@/components/Reveal'

/* Three numbered columns divided by hairlines. */
export function JobGrid({ jobs }: { jobs: Array<{ title: string; copy: string }> }) {
  return (
    <section className="relative">
      <Reveal className="inner-col grid gap-y-8 py-12 sm:grid-cols-3 sm:gap-y-0">
        {jobs.map((job, i) => (
          <div
            key={job.title}
            className={`flex flex-col gap-2 py-1 sm:px-8 ${i === 0 ? 'sm:pl-0' : 'sm:border-l sm:border-border'} ${i === jobs.length - 1 ? 'sm:pr-0' : ''}`}
          >
            <p className="eyebrow">The Job / 0{i + 1}</p>
            <h3 className="font-heading text-title font-medium">{job.title}</h3>
            <p className="text-meta leading-normal text-copy">{job.copy}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
