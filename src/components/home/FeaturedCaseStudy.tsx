import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { getFeaturedCaseStudy } from '@/lib/content'

gsap.registerPlugin(useGSAP)

// Story frames live one level deeper (writing/<slug>/story-frames/) than the
// regular content images, so they need their own glob.
const frameModules = import.meta.glob<{ default: string }>(
  '../../content/writing/*/story-frames/*.{png,jpg,jpeg,webp}',
  { eager: true },
)

function storyFramesFor(slug: string): string[] {
  return Object.entries(frameModules)
    .filter(([path]) => path.includes(`/writing/${slug}/story-frames/`))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, mod]) => mod.default)
}

export default function FeaturedCaseStudy() {
  const featured = getFeaturedCaseStudy()
  const scope = useRef<HTMLElement>(null)
  const frames = featured ? storyFramesFor(featured.slug) : []

  // Cinematic loop: hold each frame 3s, then 2s crossfade to the next, forever.
  useGSAP(
    () => {
      if (frames.length < 2) return
      const imgs = gsap.utils.toArray<HTMLElement>('.featured-frame')
      gsap.set(imgs, { autoAlpha: 0 })
      gsap.set(imgs[0], { autoAlpha: 1 })
      const tl = gsap.timeline({ repeat: -1 })
      imgs.forEach((img, i) => {
        const next = imgs[(i + 1) % imgs.length]
        tl.to(img, { autoAlpha: 0, duration: 2, ease: 'power1.inOut' }, '+=3').to(
          next,
          { autoAlpha: 1, duration: 2, ease: 'power1.inOut' },
          '<',
        )
      })
    },
    { scope },
  )

  if (!featured) return null

  return (
    <section ref={scope} className="relative w-full">
      <Link
        to={`/case-studies/${featured.slug}`}
        className="group block relative w-full h-[78svh] min-h-[520px] overflow-hidden bg-foreground"
      >
        {frames.length > 0
          ? frames.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={i === 0 ? featured.title : ''}
                aria-hidden={i > 0}
                data-parallax="0.2"
                style={{ opacity: i === 0 ? 1 : 0 }}
                className="featured-frame absolute inset-0 w-full h-full object-cover scale-[1.6]"
              />
            ))
          : featured.coverImage && (
              <img
                src={featured.coverImage.src}
                alt={featured.title}
                width={featured.coverImage.width}
                height={featured.coverImage.height}
                data-parallax="0.2"
                className="absolute inset-0 w-full h-full object-cover scale-[1.6]"
              />
            )}

        {/* Bottom legibility gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 32%, rgba(0,0,0,0) 62%)',
          }}
        />

        {/* Overlay text — full-bleed image, content capped to the centered 1440 column */}
        <div className="absolute inset-x-0 bottom-0 pb-14 sm:pb-20">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
            <p
              data-reveal
              className="font-mono uppercase tracking-[0.25em] text-white/75 text-[12px] sm:text-[13px] mb-4"
            >
              Featured
            </p>
            <h2
              data-reveal
              className="font-heading font-normal text-white leading-[1.04] tracking-[-0.01em] max-w-4xl"
              style={{ fontSize: 'clamp(30px, 5.5vw, 68px)' }}
            >
              {featured.title}
            </h2>
            {featured.excerpt && (
              <p
                data-reveal
                className="mt-5 text-white/85 leading-[1.5] max-w-2xl text-[clamp(16px,1.6vw,22px)]"
              >
                {featured.excerpt}
              </p>
            )}
          </div>
        </div>
      </Link>
    </section>
  )
}
