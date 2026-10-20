type Point = { x: number; y: number }
type Measurement = { total: number; stops: number[] }

const cache = new WeakMap<SVGPathElement, { key: string; measurement: Measurement }>()
const SAMPLE_STEP = 8
const distanceTo = (a: Point, b: Point) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2

/* Measure the route once, then reuse its geometry across viewport rebuilds.
   A shared coarse pass locates each station; local refinement centres it
   accurately without scanning the whole path separately for every ring. */
export function measureJourneyPath(path: SVGPathElement, rings: SVGCircleElement[]): Measurement {
  const points = rings.map((ring) => ({
    x: Number(ring.getAttribute('cx')),
    y: Number(ring.getAttribute('cy')),
  }))
  const key = `${path.getAttribute('d')}:${JSON.stringify(points)}`
  const previous = cache.get(path)
  if (previous?.key === key) return previous.measurement

  const total = path.getTotalLength()
  const samples: { at: number; point: Point }[] = []
  for (let at = 0; at < total; at += SAMPLE_STEP) {
    samples.push({ at, point: path.getPointAtLength(at) })
  }
  samples.push({ at: total, point: path.getPointAtLength(total) })

  const stops = points.map((point) => {
    let nearest = samples[0]
    for (const sample of samples) {
      if (distanceTo(sample.point, point) < distanceTo(nearest.point, point)) nearest = sample
    }
    let low = Math.max(0, nearest.at - SAMPLE_STEP)
    let high = Math.min(total, nearest.at + SAMPLE_STEP)
    for (let i = 0; i < 18; i++) {
      const left = low + (high - low) / 3
      const right = high - (high - low) / 3
      if (distanceTo(path.getPointAtLength(left), point) < distanceTo(path.getPointAtLength(right), point)) high = right
      else low = left
    }
    const refined = (low + high) / 2
    // Keep exact endpoints and stations that already land on a sample.
    return distanceTo(nearest.point, point) <= distanceTo(path.getPointAtLength(refined), point) ? nearest.at : refined
  })
  const measurement = { total, stops }
  cache.set(path, { key, measurement })
  return measurement
}
