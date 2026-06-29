import { Link } from 'react-router-dom'
import { getAllWorks, type Work } from '@/lib/content'

function WorkSection({ work, index }: { work: Work; index: number }) {
  const images = work.allImages.slice(0, 3)

  return (
    <Link to={`/work/${work.slug}`} className="group block w-full">
      {/* max-w column; divider sits inside the padding so it matches the content block */}
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <div className={`flex flex-col gap-10 py-14 sm:py-20 ${index > 0 ? 'border-t border-border' : ''}`}>
          <h3
            data-reveal
            className="font-heading font-normal leading-[1.06] tracking-[-0.02em] text-foreground max-w-4xl"
            style={{ fontSize: 'clamp(30px, 5.5vw, 68px)' }}
          >
            {work.productTitle}
          </h3>

          {/* Meta: icon + company · role + period */}
          <div
            data-reveal
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[clamp(16px,1.6vw,22px)]"
          >
            {work.icon && (
              <img src={work.icon} alt="" aria-hidden="true" className="h-8 w-8 object-contain" />
            )}
            <span className="font-medium text-foreground">
              {work.company} · {work.role}
            </span>
            <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">→</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
            {images.map((img, i) => (
              <div
                key={img.src}
                className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted"
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
        </div>
      </div>
    </Link>
  )
}

export default function RecentWork() {
  const works = getAllWorks()

  return (
    <section className="w-full bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
        <h2
          data-reveal
          className="font-mono uppercase tracking-[0.25em] text-muted-foreground text-[12px] sm:text-[13px]"
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
