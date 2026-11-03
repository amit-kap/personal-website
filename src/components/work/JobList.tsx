import { SplitSection } from '@/components/work/SplitSection'

/* "The Job": a statement, then each job as a small heading over its copy. */
export function JobList({ stmt, jobs }: { stmt: string; jobs: Array<{ title: string; copy: string }> }) {
  return (
    <SplitSection eyebrow="The Job" stmt={stmt}>
      <div className="flex flex-col gap-6">
        {jobs.map((job) => (
          <div key={job.title} className="flex flex-col gap-1.5">
            <h3 className="font-heading text-title font-medium">{job.title}</h3>
            <p className="body-copy">{job.copy}</p>
          </div>
        ))}
      </div>
    </SplitSection>
  )
}
