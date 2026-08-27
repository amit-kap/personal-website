import { useEffect, useRef } from 'react'

/* Drifts its content down as the page scrolls, so the section below appears to
   slide over it. `ratio` is the fraction of scroll distance the content lags
   by — 0.3 means it moves 30% as far as the page. */
export default function Parallax({
  ratio = 0.3,
  className = '',
  children,
}: {
  ratio?: number
  className?: string
  children?: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frame = 0
    const update = () => {
      frame = 0
      // Only drifts while the hero is still on screen; below that it's parked.
      const offset = Math.min(window.scrollY, window.innerHeight) * ratio
      el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
      el.style.transform = ''
    }
  }, [ratio])

  return <div ref={ref} className={className}>{children}</div>
}
