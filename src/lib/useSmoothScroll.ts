import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

/* Smooth scrolling for the whole page. Returns a ref holding the instance so
   callers can drive programmatic scrolls through it — scrollTo/scrollIntoView
   fight a hijacked scroll, so route changes and anchors go through Lenis. */
let current: Lenis | null = null

/* Anything that needs to freeze the page — the lightbox, for one — has to go
   through Lenis, since a hijacked scroll ignores overflow on the body. */
export function getLenis() {
  return current
}

export function useSmoothScroll() {
  const lenis = useRef<Lenis | null>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const instance = new Lenis({ lerp: 0.1 })
    lenis.current = instance
    current = instance

    let frame = requestAnimationFrame(function raf(time: number) {
      instance.raf(time)
      frame = requestAnimationFrame(raf)
    })

    return () => {
      cancelAnimationFrame(frame)
      instance.destroy()
      lenis.current = null
      current = null
    }
  }, [])

  return lenis
}
