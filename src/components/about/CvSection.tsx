import Reveal from '@/components/Reveal'
import type { CVNamedEntry } from '@/lib/content'
import { splitMeta } from './cvFormat'

/* A CV block: an eyebrow heading over a stack of hairline-divided entries. */
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

/* One CV entry in two columns: the date on the left, the entry itself on the
   right (it stacks on phones). A rule above every entry but the first, and
   the last entry's bottom trimmed. */
export function CvRow({
  index,
  count,
  date,
  children,
}: {
  index: number
  count: number
  date: string
  children: React.ReactNode
}) {
  return (
    <Reveal
      className={`grid items-start gap-x-8 gap-y-2 py-6.5 sm:grid-cols-[140px_minmax(0,1fr)] ${index > 0 ? 'border-t border-border' : ''} ${index === count - 1 ? 'pb-1' : ''}`}
    >
      <p className="text-body text-muted-foreground">{date}</p>
      <div className="flex flex-col items-start gap-3">{children}</div>
    </Reveal>
  )
}

/* The entry's head: an optional mark and the title in the Glaze heading
   size, with the subtitle muted on its own line below; a little extra room
   under it sets the head apart from the description. */
export function CvEntryHeader({
  title,
  subtitle,
  logo,
  subtitleClassName = '',
}: {
  title: string
  subtitle?: string
  logo?: string
  subtitleClassName?: string
}) {
  return (
    <div className="mb-1 flex flex-col items-start gap-1">
      <div className="flex items-center gap-3">
        {logo && <img src={logo} alt="" width={24} height={24} className="size-6 shrink-0" />}
        <h2 className="font-heading text-heading font-medium text-foreground">{title}</h2>
      </div>
      {subtitle && <p className={`text-body text-muted-foreground ${subtitleClassName}`}>{subtitle}</p>}
    </div>
  )
}

/* Certificates and education: the same entries, the date on the left and
   the title with its institution on the right. */
export function CvMetaSection({ title, entries }: { title: string; entries: CVNamedEntry[] }) {
  return (
    <CvSection title={title}>
      {entries.map((entry, i) => {
        const { place, date } = splitMeta(entry.meta)
        return (
          <CvRow key={entry.title} index={i} count={entries.length} date={date}>
            <CvEntryHeader title={entry.title} subtitle={place} />
          </CvRow>
        )
      })}
    </CvSection>
  )
}
