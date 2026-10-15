import { useEffect, useRef, useState } from 'react'
import Lightbox from './Lightbox'

function PlayIcon() {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor" aria-hidden="true">
      <path d="M1 1.2 9.6 6 1 10.8z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor" aria-hidden="true">
      <rect x="0.5" y="1" width="3" height="10" rx="1" />
      <rect x="6.5" y="1" width="3" height="10" rx="1" />
    </svg>
  )
}

/* Looping product video carrying the page's own controls: a hairline progress
   line on the bottom edge, scrubbable, and a play/pause that fades in on hover. */
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
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // Autoplay is a motion effect like any other; leave it stopped if asked.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.pause()

    const onTime = () => setProgress(video.duration ? video.currentTime / video.duration : 0)
    const onPlay = () => setPlaying(true)
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

  const toggle = () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) video.play()
    else video.pause()
  }

  const scrub = (event: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    if (!video || !video.duration) return
    const { left, width } = event.currentTarget.getBoundingClientRect()
    video.currentTime = Math.min(Math.max((event.clientX - left) / width, 0), 1) * video.duration
  }

  const openFull = () => setOpen(true)

  return (
    <>
      <div className="product-media vid" aria-busy={loading}>
        {/* The video opens the full-frame viewer, so it is exposed as a button
            and handles Enter and Space itself. The play/pause control below
            is separate, and stops the click reaching this one. */}
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          aria-label={label}
          className="block h-auto w-full cursor-zoom-in"
          onClick={openFull}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              openFull()
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
        <button type="button" className="vid-btn" onClick={(event) => { event.stopPropagation(); toggle() }} aria-label={playing ? 'Pause video' : 'Play video'}>
          {playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        {/* Click-to-seek strip; keyboard users have the native controls in the viewer. */}
        <div className="vid-track" onClick={(event) => { event.stopPropagation(); scrub(event) }} role="presentation">
          <div className="vid-line">
            <div className="vid-fill" style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      </div>
      {open && <Lightbox src={src} alt={label} video onClose={() => setOpen(false)} />}
    </>
  )
}
