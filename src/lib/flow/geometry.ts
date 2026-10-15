export type Pt = [number, number]
/* A line of the flow; s is its phase at its start. */
export type Spec = { pts: Pt[]; cum: number[]; len: number; s: number }

/* Total length of a polyline. */
export const length = (pts: Pt[]) => pts.reduce((sum, p, i) => (i ? sum + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0)

/* Measure a polyline: cumulative arc length at every vertex. */
export const polyline = (pts: Pt[], s = 0): Spec => {
  const cum = pts.map((_, i) => length(pts.slice(0, i + 1)))
  return { pts, cum, len: cum[cum.length - 1], s }
}

/* Point at arc-length d along a measured polyline. */
export function pointAt({ pts, cum }: Spec, d: number): Pt {
  let lo = 1
  let hi = cum.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (cum[mid] < d) lo = mid + 1
    else hi = mid
  }
  const t = (d - cum[lo - 1]) / (cum[lo] - cum[lo - 1] || 1)
  return [pts[lo - 1][0] + (pts[lo][0] - pts[lo - 1][0]) * t, pts[lo - 1][1] + (pts[lo][1] - pts[lo - 1][1]) * t]
}
