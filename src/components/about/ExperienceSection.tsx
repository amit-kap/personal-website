/* About page experience entries (see CvSection for the entry layout). */
import { Link } from 'react-router-dom'
import type { CVExperience } from '@/lib/content'
import { logoFor } from '@/lib/workLogos'
import { CvEntryHeader, CvRow, CvSection } from './CvSection'
import { formatPeriod } from './cvFormat'

/* Each job: the period in the left column; on the right, company and role on
   one line, then the description, ending with a View link. */
export function ExperienceSection({ experience }: { experience: CVExperience[] }) {
  return (
    <CvSection title="Experience">
      {experience.map((entry, i) => {
        const logo = logoFor(entry.slug)
        return (
          <CvRow key={entry.slug} index={i} count={experience.length} date={formatPeriod(entry.period)}>
            <CvEntryHeader
              title={entry.company}
              subtitle={entry.role}
              logo={logo}
              // Founding roles shimmer.
              subtitleClassName={/founding designer/i.test(entry.role) ? 'shimmer-text' : ''}
            />
            <ul className="flex flex-col gap-2 text-body text-copy">
              {entry.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            {/* A plain text link in the same 16px body type as the entry. */}
            <Link
              to={`/work/${entry.slug}`}
              aria-label={`View the ${entry.company} work`}
              className="inline-flex items-center gap-1.5 text-body text-muted-foreground transition-colors hover:text-foreground"
            >
              View
              <svg className="size-4" viewBox="0 0 33 33" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6.875 16.5h19.25" />
                <path d="M16.5 6.875l9.625 9.625-9.625 9.625" />
              </svg>
            </Link>
          </CvRow>
        )
      })}
    </CvSection>
  )
}
