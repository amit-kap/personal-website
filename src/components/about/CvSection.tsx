import Reveal from '@/components/Reveal'
import type { CVNamedEntry } from '@/lib/content'
import { splitMeta } from './cvFormat'

/* A CV block: an eyebrow heading over a stack of hairline-divided rows. */
export function CvSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="relative">
      <div className="inner-col pb-14 pt-12">
        <Reveal as="p" className="eyebrow pb-2.5">{title}</Reveal>
        {children}
      </div>
    </section>
  )
}

/* One row of the compact hairline grid: three columns (date, title, detail),
   a rule above every row but the first, and the last row's bottom trimmed. */
export function CvRow({ index, count, children }: { index: number; count: number; children: React.ReactNode }) {
  return (
    <Reveal
      className={`grid items-start gap-x-8 gap-y-2 py-6.5 sm:grid-cols-[140px_260px_minmax(0,1fr)] ${index > 0 ? 'border-t border-border' : ''} ${index === count - 1 ? 'pb-1' : ''}`}
    >
      {children}
    </Reveal>
  )
}

/* Certificates and education: same rows as Experience, date left and
   institution right. */
export function CvMetaSection({ title, entries }: { title: string; entries: CVNamedEntry[] }) {
  return (
    <CvSection title={title}>
      {entries.map((entry, i) => {
        const { place, date } = splitMeta(entry.meta)
        return (
          <CvRow key={entry.title} index={i} count={entries.length}>
            <p className="text-body text-muted-foreground">{date}</p>
            <h2 className="font-heading text-stmt font-medium">{entry.title}</h2>
            <p className="text-body text-copy">{place}</p>
          </CvRow>
        )
      })}
    </CvSection>
  )
}
