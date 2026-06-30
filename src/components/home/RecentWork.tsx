import { Link } from 'react-router-dom'
import { getAllWorks, type Work } from '@/lib/content'

function WorkSection({ work, index }: { work: Work; index: number }) {
  const images = work.allImages

  return (
    <Link to={`/work/${work.slug}`} className="group block w-full">
      {/* max-w column; divider sits inside the padding so it matches the content block */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className={`flex flex-col gap-10 py-14 sm:py-20 ${index > 0 ? 'border-t border-border' : ''}`}>
          <h3
            data-reveal
            className="text-title font-heading font-normal leading-[1.06] tracking-[-0.02em] text-foreground max-w-4xl"
          >
            {work.productTitle}
          </h3>

          {/* Meta: icon + company · role + period */}
          <div
            data-reveal
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-lead"
          >
            {work.icon && (
              <img src={work.icon} alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
            )}
            <span className="font-medium text-foreground">
              {work.company} · {work.role}
            </span>
            <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">→</span>
          </div>

          {/* Horizontal swipe carousel of all images — moves only on left/right
              swipe (native scroll-snap), never hijacks vertical page scroll. */}
          <div>
            <div className="flex gap-3 sm:gap-5 overflow-x-auto overscroll-x-contain snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {images.map((img, i) => (
                <div
                  key={img.src}
                  className="snap-start shrink-0 basis-[78%] sm:basis-[31.5%] relative aspect-[16/9] overflow-hidden rounded-lg bg-muted"
                >
                  <img
                    src={img.src}
                    alt={`${work.company} ${i + 1}`}
                    width={img.width}
                    height={img.height}
                    loading="lazy"
                    data-parallax="0.12"
                    className="absolute inset-0 w-full h-full object-cover scale-[1.26]"
                  />
                </div>
              ))}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex items-center gap-2 text-muted-foreground eyebrow">
                <span aria-hidden="true">←</span>
                <span>Swipe</span>
                <span aria-hidden="true">→</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function RecentWork() {
  const works = getAllWorks()

  return (
    <section className="w-full bg-background pt-12 sm:pt-16">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <h2
          data-reveal
          className="eyebrow text-muted-foreground"
        >
          Recent Work
        </h2>
      </div>
      <div className="mt-4">
        {works.map((work, i) => (
          <WorkSection key={work.slug} work={work} index={i} />
        ))}
      </div>
    </section>
  )
}
