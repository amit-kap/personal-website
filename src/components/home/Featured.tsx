/* Home featured work: the Shift motion film in a frame, with a title line and
   a link into its case study. */
import { Link, useNavigate } from 'react-router-dom'
import homeCopy from '@/content/home.json'
import Reveal from '@/components/Reveal'
import { RevealButton } from '@amit-kap/glaze/components/reveal-button'
import { accentRevealButton } from '@/components/actionButtons'
import { useAllowMotion } from '@/lib/useAllowMotion'
import { RevealArrow } from '@/components/icons'
import { ShiftMark } from './ShiftMark'
import { bandClass, innerClass, labelClass } from './layout'

/* The Shift capture sits whole inside the frame with an even 1% border
   (percentage padding is relative to width on every side), and the frame
   takes the capture's own ~2:1 shape instead of cropping it to 16:9. */
const featuredMedia = 'block h-auto w-full rounded-item'

export function Featured() {
  const { featured } = homeCopy
  const allowMotion = useAllowMotion()
  const navigate = useNavigate()
  const caseStudy = `/work/${featured.slug}`
  return (
    <section className={`${bandClass} py-10`}>
      <div className={innerClass}>
        <Reveal as="h2" className={`${labelClass} text-center`}>
          {featured.label}
        </Reveal>
        <Reveal>
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-container bg-dim p-[1%]">
              {allowMotion ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  width={1920}
                  height={1080}
                  poster="/shift-motion-poster.webp"
                  aria-hidden="true"
                  className={featuredMedia}
                >
                  <source src="/shift-motion.mp4" type="video/mp4" />
                </video>
              ) : (
                <img src="/shift-motion-poster.webp" alt="" width={1920} height={1080} className={featuredMedia} />
              )}
            </div>
            {/* The whole row is the button's reveal group: hovering the text
                opens "View" too (Glaze styles its label off group/reveal), and
                a click anywhere on it follows the link. The button stays the
                one link for keyboards and screen readers. */}
            <div
              onClick={(event) => {
                if (!(event.target as Element).closest('a')) navigate(caseStudy)
              }}
              className="group/reveal flex cursor-pointer items-center justify-between gap-2 py-4"
            >
              <div className="flex flex-col gap-2">
                {/* Name and what it is read as one title line; the tagline
                    wraps under the name on narrow screens. */}
                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-stmt font-normal">
                  <span className="flex items-center gap-2 text-foreground">
                    <ShiftMark />
                    Shift
                  </span>
                  <span className="text-copy">{featured.tagline}</span>
                </p>
                <p className="flex items-center gap-2 text-body leading-[1.25] text-copy">
                  <span>{featured.role}</span>
                  <span aria-hidden="true" className="text-dim">/</span>
                  <span>{featured.years}</span>
                </p>
              </div>
              {/* The one way into the case study: Glaze's RevealButton as a link,
                  which opens to show its label on hover or keyboard focus. */}
              <RevealButton
                render={<Link to={caseStudy} />}
                nativeButton={false}
                role="link"
                aria-label={`View the Shift case study: ${featured.tagline}`}
                label="View"
                iconSide="end"
                className={`${accentRevealButton} group-hover/reveal:px-5`}
              >
                <RevealArrow />
              </RevealButton>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
