import { Link } from 'react-router-dom'
import { buttonVariants } from '@amit-kap/glaze/components/button'
import type { CVExperience } from '@/lib/content'
import { logoFor } from '@/lib/workLogos'
import { CvRow, CvSection } from './CvSection'
import { formatPeriod } from './cvFormat'

/* Experience in a compact hairline grid. */
export function ExperienceSection({ experience }: { experience: CVExperience[] }) {
  return (
    <CvSection title="Experience">
      {experience.map((entry, i) => (
        <CvRow key={entry.slug} index={i} count={experience.length}>
            <p className="text-body text-muted-foreground">{formatPeriod(entry.period)}</p>
            <div className="flex flex-col items-start gap-2">
              <h2 className="font-heading text-stmt font-medium">
                {/* The mark sits centred on the company line. */}
                <span className="flex items-center gap-2.5">
                  {logoFor(entry.slug) && (
                    <img src={logoFor(entry.slug)} alt="" width={24} height={24} className="size-6 shrink-0" />
                  )}
                  {entry.company}
                </span>
                {/* The role on its own line; founding roles shimmer. */}
                <span className={`mt-1 block text-body font-normal text-copy ${/founding designer/i.test(entry.role) ? 'shimmer-text' : ''}`}>
                  {entry.role}
                </span>
              </h2>
              {/* Glaze's ghost button, nudged left by its own padding so its
                  label lines up with the text above. */}
              <Link
                to={`/work/${entry.slug}`}
                aria-label={`View the ${entry.company} work`}
                className={buttonVariants({ variant: 'ghost', size: 'sm', className: '-ms-2.5 text-muted-foreground' })}
              >
                View
                <svg viewBox="0 0 33 33" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6.875 16.5h19.25" />
                  <path d="M16.5 6.875l9.625 9.625-9.625 9.625" />
                </svg>
              </Link>
            </div>
            <ul className="flex flex-col gap-2 text-body text-copy">
              {entry.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
        </CvRow>
      ))}
    </CvSection>
  )
}
