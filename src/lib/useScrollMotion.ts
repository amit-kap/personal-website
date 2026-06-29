import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { RefObject } from 'react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Scroll-driven reveals + parallax for a page scope.
 *
 * Markup contract (set by section components):
 *  - `data-reveal`         → element fades + rises into place when it enters the viewport.
 *  - `data-parallax="0.1"` → element drifts vertically as its container passes through
 *                            the viewport. The number is the drift fraction (yPercent = ±n*100).
 *                            Parallax elements should sit in an `overflow-hidden` container and
 *                            be slightly oversized (e.g. `scale-110`) so edges never show.
 *
 * All motion is gated behind `prefers-reduced-motion: no-preference`. Under reduced motion,
 * reveal elements are simply made visible and nothing animates.
 */
export function useScrollMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 24 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            },
          )
        })

        root.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
          const drift = Number(el.dataset.parallax) || 0.12
          gsap.fromTo(
            el,
            { yPercent: -drift * 100 },
            {
              yPercent: drift * 100,
              ease: 'none',
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          )
        })
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        root.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.set(el, { autoAlpha: 1, y: 0 })
        })
      })

      return () => mm.revert()
    },
    { scope },
  )
}
