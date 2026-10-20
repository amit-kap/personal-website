/* Keep most of a lane at a steady speed, with a short, soft departure and
   arrival. Unlike a full ease-in-out this doesn't rush the middle of a lane. */
export function journeyEase(progress: number): number {
  const edge = 0.08
  const p = Math.max(0, Math.min(1, progress))
  if (p < edge) return (p * p) / (2 * edge * (1 - edge))
  if (p > 1 - edge) return 1 - journeyEase(1 - p)
  return (p - edge / 2) / (1 - edge)
}

/* Time-based settling: the disc feels the same on 60Hz and 120Hz displays. */
export function settle(current: number, target: number, elapsed: number, duration: number) {
  return current + (target - current) * (1 - Math.exp(-elapsed / duration))
}

/* Match the incoming scroll speed, then settle at the dock with no overshoot.
   The limited initial slope keeps the curve monotonic even after a fling. */
export function dockingEase(speed: number, distance: number, duration: number) {
  const slope = Math.max(0, Math.min(2, speed * duration / Math.max(1, distance)))
  return (progress: number) => {
    const p = Math.max(0, Math.min(1, progress))
    return (slope - 2) * p ** 3 + (3 - 2 * slope) * p ** 2 + slope * p
  }
}

/* Round only the camera's start/end of travel. Reading positions and the
   middle of its range stay exact, without another layer of time-based lag. */
export function cameraOffset(position: number, maximum: number, softness = 48) {
  const limit = Math.max(0, maximum)
  const y = Math.max(0, Math.min(limit, position))
  const edge = Math.min(softness, limit / 2)
  if (edge <= 0) return y
  const round = (value: number) => {
    const p = value / edge
    return edge * (2 * p ** 2 - p ** 3)
  }
  if (y < edge) return round(y)
  if (y > limit - edge) return limit - round(limit - y)
  return y
}

export type JourneyPhase = 'route' | 'cards' | 'package'

/* A destination may change mid-gesture; ownership follows the visible
   playhead until its hidden handoff has completed, in either direction. */
export function journeyPhase(requested: JourneyPhase, time: number, cardsReady: number): JourneyPhase {
  if (time > cardsReady) return 'package'
  return time > 0 || requested !== 'route' ? 'cards' : 'route'
}

export type JourneyDock = {
  from: number
  to: number
  start: number
  arrival: number
  settled: number
}

/* Only catch a nearby station when scrolling rests. Measure proximity along
   the route, not in scroll pixels: long and short lanes feel equally magnetic.
   A reading pause is already docked and must never snap back to its start. */
export function magneticProgress(progress: number, duration: number, direction: number, docks: JourneyDock[]) {
  const time = progress * duration
  const radius = 42
  for (const dock of docks) {
    if (time < dock.start || time >= dock.settled) continue
    const distance = dock.from + (dock.to - dock.from) * journeyEase((time - dock.start) / (dock.arrival - dock.start))
    if (direction >= 0 && dock.to - distance <= radius) return dock.settled / duration
    if (direction < 0 && dock.from > 0 && distance - dock.from <= radius) return dock.start / duration
  }
  return progress
}

type Point = { x: number; y: number }

/* The reveal can run on its own clock, but it never competes with scrolling
   for the disc. A single frame chooses its position and the camera target. */
export function journeyFrame(
  phase: JourneyPhase,
  route: Point,
  dot: Point,
  pkg: Point,
  reveal: { handoff: number; camera: number; opacity: number },
  tail: { progress: number; opacity: number },
) {
  // SVG points expose x/y as prototype accessors, not enumerable fields.
  if (phase === 'route') return { x: route.x, y: route.y, cameraY: route.y, opacity: 1 }
  if (phase === 'cards') return {
    x: reveal.handoff ? dot.x : route.x,
    y: reveal.handoff ? dot.y : route.y,
    cameraY: route.y + (dot.y - route.y) * reveal.camera,
    opacity: reveal.opacity,
  }
  const y = dot.y + (pkg.y - dot.y) * tail.progress
  return { x: dot.x, y, cameraY: y, opacity: tail.opacity }
}
export const JOURNEY_MEDIA_QUERY = '(min-width: 900px) and (prefers-reduced-motion: no-preference)'

