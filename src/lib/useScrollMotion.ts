import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { RefObject } from 'react'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/**
 * Scroll-driven reveals for a page scope.
 *
 * Markup contract (set by section components):
 *  - `data-reveal`         → element fades + rises into place when it first enters the viewport.
 *  - `data-parallax="0.1"` → element drifts vertically (yPercent ±n*100) as its container
 *                            passes through the viewport, scrubbed to scroll. The element must
 *                            sit in an `overflow-hidden` container and be oversized by
 *                            `scale ≥ 1 + 2*drift` so its edges never expose the background.
 *
 * Implementation notes:
 *  - Uses `ScrollTrigger.batch` so reveal elements entering together animate with a stagger.
 *  - `useGSAP` reverts all tweens/ScrollTriggers automatically (incl. React StrictMode
 *    double-invoke and unmount).
 *  - Calls `ScrollTrigger.refresh()` once web fonts are ready: Bodoni/Jakarta swapping in
 *    changes heading heights after the initial layout, which shifts trigger positions.
 *    (Resize is auto-refreshed by ScrollTrigger; font/async layout changes are not.)
 *  - No scroll-linked (scrub) work, so it never competes with native scrolling.
 *  - Honors `prefers-reduced-motion`: content is shown immediately, nothing animates.
 */
export function useScrollMotion(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current
      if (!root) return
      const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
      if (els.length === 0) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Hidden start state, set before paint (useGSAP runs in useLayoutEffect) → no flash.
        gsap.set(els, { autoAlpha: 0, y: 24 })

        ScrollTrigger.batch(els, {
          start: 'top 85%',
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: 'power2.out',
              stagger: 0.08,
              overwrite: true,
            }),
        })

        // Parallax: each [data-parallax] drifts vertically, scrubbed to scroll, over the
        // span its container passes through the viewport.
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

        // Recompute trigger positions after fonts swap in (heading heights change).
        document.fonts?.ready.then(() => ScrollTrigger.refresh())
      })

      mm.add('(prefers-reduced-motion: reduce)', () => {
        gsap.set(els, { autoAlpha: 1, y: 0 })
      })

      return () => mm.revert()
    },
    { scope },
  )
}
