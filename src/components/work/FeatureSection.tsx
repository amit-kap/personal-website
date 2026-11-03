import type { ContentImage } from '@/lib/content'
import Reveal from '@/components/Reveal'

/* One feature: eyebrow, title and copy stacked over a full-width visual. */
export function FeatureSection({
  eyebrow,
  title,
  copy,
  children,
}: {
  eyebrow: string
  title: string
  copy: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="relative">
      <div className="inner-col flex flex-col gap-4.5 py-12">
        <Reveal as="p" className="eyebrow">{eyebrow}</Reveal>
        <Reveal as="h2" className="font-heading text-title-sm font-medium" delay={0.06}>{title}</Reveal>
        <Reveal as="p" className="body-copy max-w-[760px]" delay={0.12}>{copy}</Reveal>
        <Reveal scale>{children}</Reveal>
      </div>
    </section>
  )
}

export type { ContentImage }
