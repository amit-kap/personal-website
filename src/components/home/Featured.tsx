/* Home featured work: the Shift motion film in a frame, with a title line and
   a link into its case study. */
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import homeCopy from '@/content/home.json'
import Reveal from '@/components/Reveal'
import { RevealButton } from '@amit-kap/glaze/components/reveal-button'
import { Button } from '@amit-kap/glaze/components/button'
import { Progress } from '@amit-kap/glaze/components/progress'
import { accentRevealButton } from '@/components/actionButtons'
import { useAllowMotion } from '@/lib/useAllowMotion'
import { RestartIcon, RevealArrow } from '@/components/icons'
import { ShiftMark } from './ShiftMark'
import { bandClass, innerClass, labelClass } from './layout'

/* The Shift capture sits whole inside the frame with an even 0.6% border
   (percentage padding is relative to width on every side), and the frame
   takes the capture's own ~2:1 shape instead of cropping it to 16:9. */
const featuredMedia = 'block h-auto w-full rounded-item'

/* The film with its own controls over the bottom edge: a restart button and
   a progress line. They show while the pointer moves over the film (or a
   tap, or keyboard focus) and fade out 3s after it stops. While they show,
   progress is read every frame, not on timeupdate (~4 a second), so the line
   runs smooth.
   The film plays only while half of it is on screen: it starts from its
   first frame when first scrolled to, pauses when it leaves and resumes
   when it comes back. Nothing but the poster loads before that. */
const CONTROLS_IDLE_MS = 3000

function FeaturedFilm() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [progress, setProgress] = useState(0)
  const [controlsShown, setControlsShown] = useState(false)
  const [focused, setFocused] = useState(false)
  const hideTimer = useRef<number | undefined>(undefined)
  const lastPointer = useRef({ x: -1, y: -1 })

  const showControls = () => {
    setControlsShown(true)
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setControlsShown(false), CONTROLS_IDLE_MS)
  }
  const hideControls = () => {
    window.clearTimeout(hideTimer.current)
    setControlsShown(false)
  }
  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  useEffect(() => {
    const video = videoRef.current
    if (!video || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.5 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  // The line is only read while it is on screen: the loop runs while the film
  // plays and its controls show, and stops on pause.
  const controlsVisible = controlsShown || focused
  useEffect(() => {
    const video = videoRef.current
    if (!video || !controlsVisible) return
    let frame = 0
    const read = () => {
      if (video.duration) setProgress((video.currentTime / video.duration) * 100)
    }
    const tick = () => {
      read()
      frame = requestAnimationFrame(tick)
    }
    const start = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(tick)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      read()
    }
    read()
    if (!video.paused) start()
    video.addEventListener('play', start)
    video.addEventListener('pause', stop)
    return () => {
      cancelAnimationFrame(frame)
      video.removeEventListener('play', start)
      video.removeEventListener('pause', stop)
    }
  }, [controlsVisible])

  const restart = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    void video.play().catch(() => {})
  }

  return (
    <div
      className="relative"
      onPointerEnter={showControls}
      onPointerMove={(event) => {
        // The browser also sends moves while the pointer rests and the page
        // repaints under it; only a real move keeps the controls up.
        const { x, y } = lastPointer.current
        if (event.clientX === x && event.clientY === y) return
        lastPointer.current = { x: event.clientX, y: event.clientY }
        showControls()
      }}
      onPointerDown={showControls}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') hideControls()
      }}
      onFocus={(event) => setFocused(event.target.matches(':focus-visible'))}
      onBlur={() => setFocused(false)}
    >
      <video
        ref={videoRef}
        muted
        loop
        playsInline
        preload="none"
        width={1920}
        height={1080}
        poster="/shift-motion-poster.webp"
        aria-hidden="true"
        className={featuredMedia}
      >
        <source src="/shift-motion.mp4" type="video/mp4" />
      </video>
      <div
        className={`absolute inset-x-3 bottom-3 flex items-center gap-3 transition-opacity duration-(--duration-moderate) ease-standard ${
          controlsShown || focused ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <Button
          variant="secondary"
          size="icon-sm"
          onClick={restart}
          aria-label="Restart the Shift film"
          className="rounded-pill"
        >
          <RestartIcon />
        </Button>
        <Progress
          value={progress}
          aria-label="Film progress"
          className="flex-1 [&_[data-slot=progress-indicator]]:transition-none [&_[data-slot=progress-track]]:bg-background/50"
        />
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
            <div className="overflow-hidden rounded-container bg-dim p-[0.6%]">
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
