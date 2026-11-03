import Reveal from '@/components/Reveal'

/* Eyebrow and statement on top, body content below it, full width. */
export function SplitSection({
  eyebrow,
  stmt,
  children,
}: {
  eyebrow: string
  stmt: string
  children: React.ReactNode
}) {
  return (
    <section className="relative">
      <Reveal className="inner-col grid gap-4.5 py-12">
        <div className="flex flex-col gap-4.5">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="stmt">{stmt}</h2>
        </div>
        <div className="flex flex-col gap-4">{children}</div>
      </Reveal>
    </section>
  )
}
