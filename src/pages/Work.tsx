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

function RecentWorkIndex({ works }: { works: Work[] }) {
  const [active, setActive] = useState<number | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  return (
    <div
      className="relative"
      onMouseMove={(e) => setPos({ x: e.clientX, y: e.clientY })}
      onMouseLeave={() => setActive(null)}
    >
      <ul className="border-t border-black/10 animate-fade-up">
        {works.map((work, i) => (
          <li key={work.slug} onMouseEnter={() => setActive(i)}>
            <Link
              to={`/work/${work.slug}`}
              className="group flex items-baseline gap-5 sm:gap-8 border-b border-black/10 py-6 md:py-8 transition-opacity duration-300"
              style={{ opacity: active === null || active === i ? 1 : 0.35 }}
            >
              <span className="pt-1 text-[12px] font-mono text-black/35 tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[24px] sm:text-[32px] md:text-[42px] font-medium tracking-tight leading-[1.1] text-black transition-transform duration-300 ease-out group-hover:translate-x-2">
                  {work.productTitle}
                </span>
                <span className="mt-1.5 block text-[13px] font-medium text-black/45 md:hidden">
                  {work.company}
                </span>
              </span>
              <span className="hidden self-center whitespace-nowrap text-[13px] font-medium text-black/50 md:block">
                {work.company}
              </span>
              <span className="self-center text-[20px] text-black/25 transition-all duration-300 ease-out group-hover:translate-x-1 group-hover:text-black">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Cursor-following image preview (desktop only) */}
      <div
        className="pointer-events-none fixed top-0 left-0 z-40 hidden w-[340px] transition-opacity duration-200 ease-out md:block"
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px) translate(28px, -50%)`,
          opacity: active === null ? 0 : 1,
        }}
      >
        {active !== null && (
          <div className="overflow-hidden rounded-[6px] border border-black/[0.06] shadow-2xl shadow-black/25">
            <CyclingImage
              key={works[active].slug}
              images={works[active].allImages}
              alt={works[active].company}
              intervalMs={1400}
            />
          </div>
        )}
      </div>
    </div>
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

        {/* Recent Work — typographic index with cursor-following image preview */}
        <section className="pt-12 sm:pt-16 pb-20 sm:pb-24">
          <div className="2xl:mx-auto 2xl:max-w-[1440px] px-5 sm:px-8">
            <p className="text-[14px] font-mono uppercase tracking-[0.2em] text-black/45 mb-8 sm:mb-10 animate-fade-up">
              Recent Work
            </p>
            <RecentWorkIndex works={works} />
          </div>
        </section>
      </main>
    </div>
  )
}
