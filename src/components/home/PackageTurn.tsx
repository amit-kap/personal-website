/* The Work with me flow's final package: Lucide's "package" icon, except it is
   a real 3D box, turning slowly and constantly on its vertical axis like a
   turntable. It starts (and, without motion, stays) exactly as the flat icon.
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
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = ((now - start) % TURN_MS) / TURN_MS
      el.setAttribute('d', packagePath(REST_TURN + progress * 2 * Math.PI))
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
