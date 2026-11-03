import { useEffect, useRef, useState } from 'react'

function PlayIcon() {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor" aria-hidden="true">
      <path d="M1 1.2 9.6 6 1 10.8z" />
    </svg>
  )
}

/* Looping product video carrying the page's own controls: clicking it toggles
   play and pause like YouTube. While it is paused a play badge stays at the
   centre; pressing play flashes it out. A hairline progress line on the bottom
   edge is scrubbable. */
export default function ProductVideo({
  src,
  poster,
  label,
}: {
  src: string
  poster?: string
  label: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [flash, setFlash] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // Autoplay is a motion effect like any other; leave it stopped if asked.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.pause()

    // A cached video can be ready before React attaches onCanPlay, so that
    // event is missed: check the ready state now, and also clear the loader
    // as soon as playback starts.
    if (video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) setLoading(false)

    const onTime = () => setProgress(video.duration ? video.currentTime / video.duration : 0)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onPlaying = () => setLoading(false)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('playing', onPlaying)
    return () => {
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('playing', onPlaying)
    }
  }, [])

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setFlash((f) => f + 1)
    } else video.pause()
  }

  const scrub = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !video.duration) return
    const { left, width } = event.currentTarget.getBoundingClientRect()
    video.currentTime = Math.min(Math.max((event.clientX - left) / width, 0), 1) * video.duration
  }

  return (
    <>
      <div className="product-media vid" aria-busy={loading}>
        {/* The video itself is the play/pause button, and handles Enter and
            Space. */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          aria-label={label}
          className="block h-auto w-full cursor-pointer"
          onClick={toggle}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              toggle()
            }
          }}
          onCanPlay={() => setLoading(false)}
          onError={() => setLoading(false)}
          role="button"
          tabIndex={0}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        {loading && (
          <div className="vid-loader" role="status" aria-live="polite">
            <span className="vid-loader-dot" aria-hidden="true" />
            Loading video
          </div>
        )}
        {!playing && (
          <span className="vid-badge" aria-hidden="true">
            <PlayIcon />
          </span>
        )}
        {flash > 0 && playing && (
          <span key={flash} className="vid-badge" data-flash aria-hidden="true" onAnimationEnd={() => setFlash(0)}>
            <PlayIcon />
          </span>
        )}
        {/* Click-to-seek strip; the viewer has native controls. */}
        <div className="vid-track" onClick={(event) => { event.stopPropagation(); scrub(event) }} role="presentation">
          <div className="vid-line">
            <div className="vid-fill" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      </div>
    </>
  )
}
