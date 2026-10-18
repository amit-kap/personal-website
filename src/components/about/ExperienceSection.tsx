/* About page experience entries (see CvSection for the entry layout). */
import { Link } from 'react-router-dom'
import { Button } from '@amit-kap/glaze/components/button'
import type { CVExperience } from '@/lib/content'
import { ArrowRightIcon } from '@/components/icons'
import { logoFor } from '@/lib/workLogos'
import { CvEntryHeader, CvRow, CvSection } from './CvSection'
import { formatPeriod } from './cvFormat'

/* Each job: the period in the left column; on the right, the company over
   its role, then the description, ending with a View link. */
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
            {/* Glaze's link Button; pulled left by its own padding
                so its label lines up with the text above. */}
            <Button
              render={<Link to={`/work/${entry.slug}`} />}
              nativeButton={false}
              role="link"
              variant="link"
              aria-label={`View the ${entry.company} work`}
              className="-ms-2.5"
            >
              View
              <ArrowRightIcon />
            </Button>
          </CvRow>
        )
      })}
    </CvSection>
  )
}
