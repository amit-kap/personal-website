/* Home featured work: the Shift motion film in a frame, with a title line and
   a link into its case study. */
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import homeCopy from '@/content/home.json'
import Reveal from '@/components/Reveal'
import { RevealButton } from '@amit-kap/glaze/components/reveal-button'
import { accentRevealButton } from '@/components/actionButtons'
import { useAllowMotion } from '@/lib/useAllowMotion'
import { RevealArrow } from '@/components/icons'
import { ShiftMark } from './ShiftMark'
import { bandClass, innerClass, labelClass } from './layout'

/* The Shift capture sits whole inside the frame with an even 0.6% border
   (percentage padding is relative to width on every side), and the frame
   takes the capture's own ~2:1 shape instead of cropping it to 16:9. */
const featuredMedia = 'block h-auto w-full rounded-item'

/* The film carries the Shift page's controls: clicking it toggles play and
   pause, a play badge stays at the centre while paused (and flashes out when
   play is pressed), and a scrubbable hairline runs along the bottom edge.
   The film plays only while half of it is on screen: it starts when first
   scrolled to, pauses when it leaves and resumes when it comes back, unless
   the visitor paused it themselves. Nothing but the poster loads before that. */
function PlayIcon() {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor" aria-hidden="true">
      <path d="M1 1.2 9.6 6 1 10.8z" />
    </svg>
  )
}

function FeaturedFilm() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const heldByUser = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [flash, setFlash] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTime = () => setProgress(video.duration ? video.currentTime / video.duration : 0)
    const onPlay = () => {
      setPlaying(true)
      setStarted(true)
    }
    const onPause = () => setPlaying(false)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!heldByUser.current) void video.play().catch(() => {})
        } else video.pause()
      },
      { threshold: 0.5 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      heldByUser.current = false
      void video.play().catch(() => {})
      setFlash((f) => f + 1)
    } else {
      heldByUser.current = true
      video.pause()
    }
  }

  const scrub = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !video.duration) return
    const { left, width } = event.currentTarget.getBoundingClientRect()
    video.currentTime = Math.min(Math.max((event.clientX - left) / width, 0), 1) * video.duration
  }

  return (
    <div className="vid overflow-hidden rounded-item">
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        width={1920}
        height={1080}
        poster="/shift-motion-poster.webp"
        aria-label="Shift motion film"
        role="button"
        tabIndex={0}
        className={`${featuredMedia} cursor-pointer`}
        onClick={toggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            toggle()
          }
        }}
      >
        <source src="/shift-motion-v2.mp4" type="video/mp4" />
      </video>
      {!playing && started && (
        <span className="vid-badge" aria-hidden="true">
          <PlayIcon />
        </span>
      )}
      {flash > 0 && playing && (
        <span key={flash} className="vid-badge" data-flash aria-hidden="true" onAnimationEnd={() => setFlash(0)}>
          <PlayIcon />
        </span>
      )}
      <div className="vid-track" onClick={(event) => { event.stopPropagation(); scrub(event) }} role="presentation">
        <div className="vid-line">
          <div className="vid-fill" style={{ transform: `scaleX(${progress})` }} />
        </div>
      </div>
    </div>
  )
}

export function Featured() {
  const { featured } = homeCopy
  const allowMotion = useAllowMotion()
  const navigate = useNavigate()
  const caseStudy = `/work/${featured.slug}`
  return (
    <section className={`${bandClass} py-10`}>
      <div className={innerClass}>
        {/* The site's shimmer (the About founding roles'), in orange ink. */}
        <Reveal as="h2" className={`${labelClass} text-center`}>
          <span className="shimmer-text [--shimmer-ink:var(--primary)]">
            {featured.label}
          </span>
        </Reveal>
        <Reveal>
          <div className="flex flex-col gap-4">
            <div className="featured-frame">
              {allowMotion ? (
                <FeaturedFilm />
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
