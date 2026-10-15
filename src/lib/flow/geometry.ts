/* Polyline maths for the flow overlay: measuring a path and finding the point
   a given distance along it. */
export type Pt = [number, number]
/* A line of the flow: its points, the cumulative arc length at each point, the
   total length, and its phase at the start (see FlowOverlay). */
export type FlowLine = { pts: Pt[]; cumulative: number[]; len: number; phase: number }

/* Total length of a polyline. */
export const length = (pts: Pt[]) => pts.reduce((sum, p, i) => (i ? sum + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0)

/* Measure a polyline: cumulative arc length at every vertex. */
export const polyline = (pts: Pt[], phase = 0): FlowLine => {
  const cumulative = pts.map((_, i) => length(pts.slice(0, i + 1)))
  return { pts, cumulative, len: cumulative[cumulative.length - 1], phase }
}

/* Point at arc-length `distance` along a measured polyline. */
export function pointAt({ pts, cumulative }: FlowLine, distance: number): Pt {
  // Binary search for the segment that contains `distance`.
  let lo = 1
  let hi = cumulative.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (cumulative[mid] < distance) lo = mid + 1
    else hi = mid
  }
  const along = (distance - cumulative[lo - 1]) / (cumulative[lo] - cumulative[lo - 1] || 1)
  return [pts[lo - 1][0] + (pts[lo][0] - pts[lo - 1][0]) * along, pts[lo - 1][1] + (pts[lo][1] - pts[lo - 1][1]) * along]
}
