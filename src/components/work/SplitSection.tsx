import Reveal from '@/components/Reveal'

/* Eyebrow + statement on the left, body content on the right. `stacked` puts
   the statement on top and the body below it, full width. */
export function SplitSection({
  eyebrow,
  stmt,
  stacked = false,
  children,
}: {
  eyebrow: string
  stmt: string
  stacked?: boolean
  children: React.ReactNode
}) {
  return (
    <section className="relative">
      <Reveal className={`inner-col grid ${stacked ? 'gap-4.5 py-12' : 'gap-8 py-14 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14'}`}>
        <div className={`flex flex-col ${stacked ? 'gap-4.5' : 'gap-3.5'}`}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="stmt">{stmt}</h2>
        </div>
        <div className="flex flex-col gap-4">{children}</div>
      </Reveal>
    </section>
  )
}
