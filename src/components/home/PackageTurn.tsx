/* The Work with me flow's final package: Lucide's "package" icon, except it is
   a real 3D box, turning slowly and constantly on its vertical axis like a
   turntable (unless a data-idle ancestor holds it). It starts (and, without
   motion, stays) exactly as the flat icon.
   Each frame draws only the edges that face the viewer, so it stays a clean
   line icon. */
import { useEffect, useRef } from 'react'
import { useAllowMotion } from '@/lib/useAllowMotion'
import { packagePath, REST_TURN } from '@/lib/packageGeometry'

/* One slow, constant turn on the vertical axis per TURN_MS. */
const TURN_MS = 12000

export function PackageTurn({ className = '' }: { className?: string }) {
  const path = useRef<SVGPathElement>(null)
  const allowMotion = useAllowMotion()

  useEffect(() => {
    const el = path.current
    if (!el) return
    el.setAttribute('d', packagePath(REST_TURN))
    if (!allowMotion) return
    // It holds still while an ancestor is marked data-idle (the Work with me
    // journey, until the package ignites), and turns on from where it was.
    let frame = 0
    let last = performance.now()
    let turned = 0
    let speed = 0
    const tick = (now: number) => {
      // A soft start after ignition; returning from a background tab cannot
      // jump the package through several seconds of rotation.
      const elapsed = Math.min(48, now - last)
      if (!el.closest('[data-idle]')) {
        speed += (1 - speed) * (1 - Math.exp(-elapsed / 380))
        turned = (turned + elapsed * speed / TURN_MS) % 1
        el.setAttribute('d', packagePath(REST_TURN + turned * 2 * Math.PI))
      } else speed = 0
      last = now
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [allowMotion])

  // Drawn at 48px on the 24 grid, so a 0.75 stroke is the site's 1.5px line.
  return (
    <svg className={className} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path ref={path} d={packagePath(REST_TURN)} />
    </svg>
  )
}
