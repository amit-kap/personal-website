import type { ContentImage } from '@/lib/content'
import Reveal from '@/components/Reveal'
import { WindowCard } from '@/components/work/WindowCard'

export interface SurfaceItem {
  image?: ContentImage
  alt: string
  eyebrow: string
  title: string
  copy: React.ReactNode
}

/* A 2×2 grid of surfaces (one column on phones): each screenshot, in window
   chrome, over its label, title and caption. md:gap-15 is the 60px between
   items, as in the home problem grid. */
export function SurfacesGrid({ heading, items }: { heading: string; items: SurfaceItem[] }) {
  return (
    <section className="relative">
      <div className="inner-col flex flex-col gap-9 pb-16 pt-14">
        <div className="flex flex-col items-center gap-2 text-center">
          <Reveal as="p" className="eyebrow">The Surfaces</Reveal>
          <Reveal as="h2" className="font-heading text-section font-medium" delay={0.08}>
            {heading}
          </Reveal>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-15">
          {items.map((item) => (
            <Reveal key={item.title} className="flex flex-col gap-4">
              <WindowCard image={item.image} alt={item.alt} />
              <div className="flex flex-col gap-1.5">
                <p className="eyebrow">{item.eyebrow}</p>
                <h3 className="font-heading text-stmt font-medium leading-tight">{item.title}</h3>
                <p className="text-meta leading-normal text-copy">{item.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
