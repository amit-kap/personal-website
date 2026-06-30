import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { getFeaturedCaseStudy } from '@/lib/content'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin)

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

const BLINDS = 16 // number of vertical slats
const HOLD = 3 // seconds a frame is held
const TRANS = 1.2 // seconds for the blinds to sweep open
const SEG = HOLD + TRANS
const DOLLY_FROM = 1.05
const DOLLY_TO = 1.16

export default function FeaturedCaseStudy() {
  const featured = getFeaturedCaseStudy()
  const scope = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const frames = featured ? storyFramesFor(featured.slug) : []

  // Cinematic loop: each frame dollies in while held, then the next frame's
  // venetian blinds open over it. Plain timeline (no ScrollTrigger).
  useGSAP(
    () => {
      // Title "decodes" in (scramble) when the band scrolls into view. Stays
      // visible by default, so a frozen ScrollTrigger just shows it plainly.
      const title = titleRef.current
      if (title && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.to(title, {
          scrambleText: { text: title.textContent || '', chars: 'upperCase', speed: 1 },
          duration: 0.7,
          ease: 'none',
          scrollTrigger: { trigger: scope.current, start: 'top 60%', once: true },
        })
      }

      if (frames.length < 2) return
      const q = gsap.utils.selector(scope)
      const imgs = q<HTMLImageElement>('.featured-frame')
      const n = imgs.length
      const rectsOf = (i: number) => q<SVGRectElement>(`#fc-clip-${i} rect`)

      // Initial state: the LAST frame is the open base, so frame 0 can blinds-in
      // over it at t=0. Every other frame starts closed.
      imgs.forEach((img, i) => {
        const isBase = i === n - 1
        gsap.set(img, { zIndex: isBase ? 1 : 0, scale: isBase ? DOLLY_TO : DOLLY_FROM })
        gsap.set(rectsOf(i), { scaleX: isBase ? 1 : 0, transformOrigin: 'center right' })
      })

      const tl = gsap.timeline({ repeat: -1 })
      for (let x = 0; x < n; x++) {
        const prev = (x - 1 + n) % n
        const start = x * SEG
        // Blinds sweep frame x open over the previous frame...
        tl.set(imgs[x], { zIndex: 2 }, start)
        tl.fromTo(
          rectsOf(x),
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: 'power1.inOut',
            duration: 0.4,
            stagger: { amount: TRANS - 0.4 },
            immediateRender: false,
          },
          start,
        )
        // ...while it is already dollying in — the dolly spans the blinds + the
        // hold so the camera move is "inside" the transition, never a restart.
        tl.fromTo(
          imgs[x],
          { scale: DOLLY_FROM },
          { scale: DOLLY_TO, ease: 'none', duration: SEG, immediateRender: false },
          start,
        )
        // Once the blinds finish, frame x is the base; retire the previous frame.
        tl.set(imgs[x], { zIndex: 1 }, start + TRANS)
        tl.set(imgs[prev], { zIndex: 0 }, start + TRANS)
        tl.set(rectsOf(prev), { scaleX: 0 }, start + TRANS)
      }
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
        {frames.length > 0 ? (
          <>
            {/* Per-frame blinds clip paths (one clipPath of vertical slats each) */}
            <svg width="0" height="0" aria-hidden className="absolute">
              <defs>
                {frames.map((_, fi) => (
                  <clipPath key={fi} id={`fc-clip-${fi}`} clipPathUnits="objectBoundingBox">
                    {Array.from({ length: BLINDS }).map((__, i) => (
                      <rect key={i} x={i / BLINDS} y="0" width={1 / BLINDS} height="1" />
                    ))}
                  </clipPath>
                ))}
              </defs>
            </svg>

            {frames.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={i === 0 ? featured.title : ''}
                aria-hidden={i > 0}
                style={{ clipPath: `url(#fc-clip-${i})` }}
                className="featured-frame absolute inset-0 w-full h-full object-cover"
              />
            ))}
          </>
        ) : (
          featured.coverImage && (
            <img
              src={featured.coverImage.src}
              alt={featured.title}
              width={featured.coverImage.width}
              height={featured.coverImage.height}
              data-parallax="0.2"
              className="absolute inset-0 w-full h-full object-cover scale-[1.6]"
            />
          )
        )}

        {/* Bottom legibility gradient (above the frames) */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.35) 32%, rgba(0,0,0,0) 62%)',
          }}
        />

        {/* Overlay text — full-bleed image, content capped to the centered 1440 column */}
        <div className="absolute inset-x-0 bottom-0 z-10 pb-14 sm:pb-20">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8">
            <p
              data-reveal
              className="font-mono uppercase tracking-[0.25em] text-white/75 text-[12px] sm:text-[13px] mb-4"
            >
              Featured
            </p>
            <h2
              ref={titleRef}
              className="font-heading font-normal text-white leading-[1.04] tracking-[-0.01em] whitespace-nowrap"
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
