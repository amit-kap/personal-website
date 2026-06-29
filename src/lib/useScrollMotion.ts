import { useLayoutEffect } from 'react'
import type { RefObject } from 'react'

const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
const DURATION = '0.9s'

/**
 * Scroll-driven reveals for a page scope.
 *
 * Markup contract (set by section components):
 *  - `data-reveal` → element fades + rises into place when it first enters the viewport.
 *
 * Implemented with IntersectionObserver + a CSS transition (no scroll-linked work, so it
 * never competes with native scrolling). Honors `prefers-reduced-motion`: content is shown
 * immediately with no transition.
 */
export function useScrollMotion(scope: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'))
    if (els.length === 0) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      els.forEach((el) => {
        el.style.opacity = '1'
        el.style.transform = 'none'
      })
      return
    }

    // Set the hidden start state synchronously (before paint) to avoid a flash.
    els.forEach((el) => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(24px)'
      el.style.transition = `opacity ${DURATION} ${EASE}, transform ${DURATION} ${EASE}`
      el.style.willChange = 'opacity, transform'
    })

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          el.style.opacity = '1'
          el.style.transform = 'none'
          el.addEventListener(
            'transitionend',
            () => {
              el.style.willChange = ''
            },
            { once: true },
          )
          obs.unobserve(el)
        })
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.01 },
    )

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [scope])
}
