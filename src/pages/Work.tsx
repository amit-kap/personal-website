import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllWorks, getFeaturedCaseStudy, getWorkBySlug, type ContentImage, type Work } from '@/lib/content'
import SkeletonImage from '@/components/SkeletonImage'

function CyclingImage({
  images,
  alt,
  intervalMs,
  startDelay = 0,
  fill = false,
}: {
  images: ContentImage[]
  alt: string
  intervalMs: number
  startDelay?: number
  fill?: boolean
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
    return <div className={`${fill ? 'absolute inset-0' : 'aspect-video w-full'} bg-black/[0.04] animate-pulse`} />
  }

  const fast = intervalMs <= 1500
  const fadeClass = fast ? 'duration-[350ms]' : 'duration-1000'

  return (
    <div className={`${fill ? 'absolute inset-0' : 'relative aspect-video w-full'} bg-black/[0.04]`}>
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

function WorkCard({ work, index }: { work: Work; index: number }) {
  return (
    <Link
      to={`/work/${work.slug}`}
      className="group relative block w-full overflow-hidden rounded-[8px] bg-black animate-fade-up"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="relative h-[46vh] min-h-[300px] max-h-[480px]">
        <CyclingImage
          images={work.allImages}
          alt={work.company}
          intervalMs={4500}
          startDelay={index * 400}
          fill
        />

        {/* Legibility gradient — strongest at bottom-left where the text sits */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-90"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 26%, rgba(0,0,0,0.10) 52%, rgba(0,0,0,0) 72%)',
          }}
        />

        {/* Text overlay — bottom-left, padded from the card edge */}
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <h2 className="text-white text-[26px] sm:text-[36px] md:text-[46px] font-medium tracking-tight leading-[1.08] max-w-2xl">
            {work.productTitle}
          </h2>
          <div className="mt-3 flex items-center gap-2">
            {work.icon && (
              <img
                src={work.icon}
                alt=""
                aria-hidden="true"
                className="h-5 w-5 sm:h-6 sm:w-6 flex-none brightness-0 invert"
              />
            )}
            <p className="text-[14px] sm:text-[15px] font-medium text-white/85">
              {work.company}
            </p>
          </div>
          <p className="mt-1 font-mono text-[12px] text-white/60">
            {work.role}
            <span className="mx-2 text-white/30">·</span>
            {work.period}
          </p>
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
                  <h1
                    className="leading-[1.02] tracking-[-0.025em] font-medium text-white"
                    style={{ fontSize: 'clamp(22px, 6.6vw, 68px)' }}
                  >
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

        {/* Recent Work — full-bleed image cards with cross-fading folder images */}
        <section className="pt-12 sm:pt-16 pb-20 sm:pb-24">
          <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 mb-8 sm:mb-10">
            <p className="text-[14px] font-mono uppercase tracking-[0.2em] text-black/45 animate-fade-up">
              Recent Work
            </p>
          </div>
          <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8 2xl:px-0 flex flex-col gap-4 sm:gap-6">
            {works.map((work, i) => (
              <WorkCard key={work.slug} work={work} index={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
