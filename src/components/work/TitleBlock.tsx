import Reveal from '@/components/Reveal'

/* Page title block: meta line, title, intro paragraph. */
export function TitleBlock({ meta, title, intro }: { meta: string; title: string; intro: string }) {
  return (
    <div className="relative">
      <div className="inner-col flex flex-col gap-5 pb-10 pt-16">
        <Reveal as="p" className="meta-line" delay={0.05}>{meta}</Reveal>
        <Reveal as="h1" className="max-w-[880px] font-heading text-feature font-medium" delay={0.12}>
          {title}
        </Reveal>
        <Reveal as="p" className="body-copy max-w-[720px]" delay={0.2}>{intro}</Reveal>
      </div>
    </div>
  )
}
