import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/* Smooth scrolling for the whole page. Returns a ref holding the instance so
   callers can drive programmatic scrolls through it — scrollTo/scrollIntoView
   fight a hijacked scroll, so route changes and anchors go through Lenis.
   Lenis runs on GSAP's ticker and tells ScrollTrigger about every scroll, so
   scroll-driven motion (the Work with me journey) moves on the same frame as
   the page. */
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

    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      lenis.current = null
      current = null
    }
  }, [])

  return lenis
}
