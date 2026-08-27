import { useEffect, useRef, useState } from 'react'
import type { ContentImage } from '@/lib/content'

const HOLD_MS = 850

/* The project media on the home page: at rest it shows one frame; on hover it
   cross-fades through the rest of that project's screenshots, and on mouse-out
   it holds whatever frame it reached. The extra frames are only mounted after
   the first hover, so the page doesn't fetch every screenshot upfront. */
export default function ProjectGallery({ images, alt, eager = false }: { images: ContentImage[]; alt: string; eager?: boolean }) {
  const [index, setIndex] = useState(0)
  const [armed, setArmed] = useState(false)
  const timer = useRef<number | null>(null)

  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current) }, [])

  if (images.length === 0) return null

  const single = images.length === 1
  const reducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const start = () => {
    if (single || reducedMotion || timer.current) return
    setArmed(true)
    timer.current = window.setInterval(() => {
      setIndex((current) => (current + 1) % images.length)
    }, HOLD_MS)
  }

  const stop = () => {
    if (timer.current) {
      window.clearInterval(timer.current)
      timer.current = null
    }
  }

  // Until the first hover only the resting frame exists; after that every frame
  // stays mounted so later hovers cross-fade instantly.
  const mounted = armed ? images : images.slice(0, 1)

  return (
    <div
      className="backdrop-media relative"
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
    >
      {mounted.map((image, i) => (
        <img
          key={image.src}
          src={image.src}
          alt={i === 0 ? alt : ''}
          width={image.width}
          height={image.height}
          loading={eager && i === 0 ? 'eager' : 'lazy'}
          aria-hidden={i === 0 ? undefined : true}
          className="absolute inset-0 h-full w-full object-cover object-left-top transition-opacity duration-500 ease-out"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
    </div>
  )
}
