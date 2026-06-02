import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllWorks, getFeaturedCaseStudy, getWorkBySlug, type ContentImage, type Work } from '@/lib/content'
import SkeletonImage from '@/components/SkeletonImage'

function CyclingImage({
  images,
  alt,
  intervalMs,
  startDelay = 0,
}: {
  images: ContentImage[]
  alt: string
  intervalMs: number
  startDelay?: number
}) {
  const [idx, setIdx] = useState(0)
  const [armed, setArmed] = useState(startDelay === 0)

  // Honour the initial stagger delay once, then keep the row "armed"
  useEffect(() => {
    if (startDelay === 0) return
    const t = setTimeout(() => setArmed(true), startDelay)
    return () => clearTimeout(t)
  }, [startDelay])

  // Cycle. Re-runs when intervalMs changes (e.g. on hover).
  useEffect(() => {
    if (!armed || images.length <= 1) return
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [armed, images.length, intervalMs])

  if (images.length === 0) {
    return <div className="aspect-video w-full bg-black/[0.04] animate-pulse" />
  }

  const fast = intervalMs <= 1500
  const fadeClass = fast ? 'duration-[350ms]' : 'duration-1000'

  return (
    <div className="relative aspect-video w-full bg-black/[0.04]">
      {images.map((img, i) => (
        <img
          key={img.src}
          src={img.src}
          alt={i === 0 ? alt : ''}
          width={img.width}
          height={img.height}
          loading={i === 0 ? 'eager' : 'lazy'}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity ease-out ${fadeClass} ${
            i === idx ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  )
}

function WorkRow({ work, index }: { work: Work; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      to={`/work/${work.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group block animate-fade-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="grid md:grid-cols-12 gap-6 md:gap-10 items-start">
        {/* Text — left on desktop */}
        <div className="md:col-span-5 md:order-1 order-2">
          <h2 className="text-[22px] sm:text-[26px] font-medium tracking-tight text-black/70 group-hover:text-black transition-colors mb-3 leading-[1.2]">
            {work.productTitle}
          </h2>
          <p className="text-[14px] font-medium text-black/55 group-hover:text-black/80 transition-colors mb-1">
            {work.company}
          </p>
          <p className="text-[12px] text-black/40 group-hover:text-black/60 transition-colors font-mono mb-4">
            {work.role}
            <span className="text-black/25 mx-2">·</span>
            {work.period}
          </p>
          <p className="text-[15px] leading-[1.55] text-black/55 group-hover:text-black/80 transition-colors max-w-md">
            {work.blurb}
          </p>
        </div>

        {/* Image — right on desktop, auto-cycles through folder (fast on hover) */}
        <div className="md:col-span-7 md:order-2 order-1">
          <div className="rounded-[6px] overflow-hidden border border-black/[0.05]">
            <CyclingImage
              images={work.allImages}
              alt={work.company}
              intervalMs={hovered ? 1000 : 8000}
              startDelay={index * 450}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Work() {
  const works = getAllWorks()
  const featured = getFeaturedCaseStudy()
  const featuredWork = featured ? getWorkBySlug(featured.workSlug) : undefined

  return (
    <div className="relative z-10 min-h-screen flex flex-col bg-white">
      <main className="flex-1 pt-14 w-full">
        {/* Hero — featured case study (full-bleed, image extends to top of viewport behind nav) */}
        {featured && featuredWork && (
          <section className="relative -mt-14 animate-fade-up">
            <Link to={`/case-studies/${featured.slug}`} className="group block relative">
              {/* Full-bleed hero image */}
              <div className="relative w-full h-[88vh] min-h-[560px] max-h-[860px] overflow-hidden bg-black">
                {featured.coverImage && (
                  <SkeletonImage
                    src={featured.coverImage.src}
                    alt={featured.title}
                    width={featured.coverImage.width}
                    height={featured.coverImage.height}
                    loading="eager"
                    wrapperClassName="absolute inset-0 w-full h-full"
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Gradient overlay — top fade (nav legibility) + stronger bottom fade (title legibility) */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.10) 14%, rgba(0,0,0,0) 28%, rgba(0,0,0,0.30) 48%, rgba(0,0,0,0.70) 78%, rgba(0,0,0,0.88) 100%)',
                  }}
                />
              </div>

              {/* Title content overlaid at the bottom of the image */}
              <div className="absolute bottom-0 left-0 right-0 pb-12 sm:pb-16 px-5 sm:px-8 pointer-events-none">
                <div className="2xl:mx-auto 2xl:max-w-[1440px]">
                  <p className="text-[14px] font-mono uppercase tracking-[0.2em] text-white/80 mb-4 sm:mb-5">
                    Featured
                  </p>
                  <h1 className="text-[36px] sm:text-[52px] md:text-[68px] leading-[1.02] tracking-[-0.025em] font-medium text-white max-w-3xl">
                    {featured.title}
                  </h1>
                  {featured.excerpt && (
                    <p className="mt-4 sm:mt-5 text-[16px] sm:text-[19px] leading-[1.45] text-white/85 max-w-2xl">
                      {featured.excerpt}
                    </p>
                  )}
                  <span className="inline-flex items-baseline gap-2 mt-6 sm:mt-7 text-[13px] font-medium text-white pointer-events-auto">
                    <span className="relative pb-1">
                      <span>Read the case study</span>
                      {/* hover underline — grows from left, no underline at rest */}
                      <span className="absolute left-0 right-0 bottom-0 h-px bg-white origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                    </span>
                    <span className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-1.5">→</span>
                  </span>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Recent Work — full-bleed zebra bands, content centered inside each */}
        <section className="pt-10 sm:pt-12 pb-16">
          <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 mb-6 sm:mb-8">
            <p className="text-[14px] font-mono uppercase tracking-[0.2em] text-black/45 animate-fade-up">
              Recent Work
            </p>
          </div>
          <div className="flex flex-col">
            {works.map((work, i) => (
              <div
                key={work.slug}
                className={i % 2 === 1 ? 'bg-neutral-50' : ''}
              >
                <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 py-12 md:py-16">
                  <WorkRow work={work} index={i} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
