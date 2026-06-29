import { Link } from 'react-router-dom'
import { getAllWorks, type Work } from '@/lib/content'

function WorkSection({ work }: { work: Work }) {
  const images = work.allImages.slice(0, 2)

  return (
    <Link
      to={`/work/${work.slug}`}
      className="group block w-full py-16 sm:py-24 border-t border-border first:border-t-0"
    >
      <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8">
        <h3
          data-reveal
          className="font-heading font-normal leading-[1.06] tracking-[-0.01em] text-foreground max-w-4xl"
          style={{ fontSize: 'clamp(26px, 4.2vw, 52px)' }}
        >
          {work.productTitle}
        </h3>
        <p data-reveal className="mt-3 text-[14px] text-muted-foreground font-medium">
          {work.company}
          <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5 ml-2">→</span>
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-4 sm:gap-6">
          {images.map((img, i) => (
            <div
              key={img.src}
              className="relative aspect-[16/10] overflow-hidden rounded-lg bg-muted"
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
    </Link>
  )
}

export default function RecentWork() {
  const works = getAllWorks().slice(0, 3)

  return (
    <section className="w-full bg-background py-12 sm:py-16">
      <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8">
        <h2
          data-reveal
          className="font-mono uppercase tracking-[0.25em] text-muted-foreground text-[12px] sm:text-[13px]"
        >
          Recent Work
        </h2>
      </div>
      <div className="mt-4">
        {works.map((work) => (
          <WorkSection key={work.slug} work={work} />
        ))}
      </div>
    </section>
  )
}
