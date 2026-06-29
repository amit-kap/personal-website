import { Link } from 'react-router-dom'
import { getAllCaseStudies, type CaseStudy } from '@/lib/content'

function Row({ study, index }: { study: CaseStudy; index: number }) {
  const imageLeft = index % 2 === 0

  return (
    <Link
      to={`/case-studies/${study.slug}`}
      data-reveal
      className="group grid sm:grid-cols-2 gap-6 sm:gap-10 items-center py-10 border-t border-border"
    >
      <div
        className={`relative aspect-[16/9] overflow-hidden rounded-lg bg-muted ${
          imageLeft ? 'sm:order-1' : 'sm:order-2'
        }`}
      >
        {study.coverImage && (
          <img
            src={study.coverImage.src}
            alt={study.title}
            width={study.coverImage.width}
            height={study.coverImage.height}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </div>

      <div className={imageLeft ? 'sm:order-2' : 'sm:order-1'}>
        <h3 className="font-heading font-normal text-foreground leading-[1.1] tracking-[-0.01em] text-[24px] sm:text-[30px]">
          {study.title}
        </h3>
        {study.excerpt && (
          <p className="mt-3 text-muted-foreground leading-[1.5] text-[15px] sm:text-[16px] max-w-md">
            {study.excerpt}
          </p>
        )}
        <span className="inline-flex items-baseline gap-2 mt-5 text-[13px] font-medium text-foreground">
          Read
          <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">→</span>
        </span>
      </div>
    </Link>
  )
}

export default function CaseStudies() {
  const studies = getAllCaseStudies()

  return (
    <section className="w-full bg-background py-20 sm:py-28">
      <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8">
        <h2
          data-reveal
          className="font-heading font-normal text-foreground leading-[1.04] tracking-[-0.01em]"
          style={{ fontSize: 'clamp(30px, 4.5vw, 56px)' }}
        >
          Case Studies
        </h2>
        <div className="mt-10">
          {studies.map((study, i) => (
            <Row key={study.slug} study={study} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
