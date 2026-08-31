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
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const el = video.current
    if (!el) return
    // Autoplay is a motion effect like any other; leave it stopped if asked.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) el.pause()

    const onTime = () => setProgress(el.duration ? el.currentTime / el.duration : 0)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [])

  const toggle = () => {
    const el = video.current
    if (!el) return
    if (el.paused) el.play()
    else el.pause()
  }

  const scrub = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = video.current
    if (!el || !el.duration) return
    const { left, width } = event.currentTarget.getBoundingClientRect()
    el.currentTime = Math.min(Math.max((event.clientX - left) / width, 0), 1) * el.duration
  }

  const openFull = () => setOpen(true)

  return (
    <>
      <div className="backdrop-media backdrop-media--fit vid" aria-busy={loading}>
        <video
          ref={video}
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
