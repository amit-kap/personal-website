/* Lucide's "package" icon as a real 3D box (see components/home/PackageTurn). */

/* Lucide's drawing is an orthographic box on a 24 grid: centred on (12,12),
   18 wide, with 10-unit verticals and top edges dropping 5 over 9. That is a
   box turned 45° and seen from asin(5/9) above. */
const SIN_TILT = 5 / 9
const COS_TILT = Math.sqrt(1 - SIN_TILT ** 2)
const SCALE = 9 / Math.SQRT2
const HALF_HEIGHT = 5 / (SCALE * COS_TILT)
export const REST_TURN = Math.PI / 4

/* Corners as [x, y (up), z]; faces by outward normal and corner indices. */
const corners: [number, number, number][] = [-1, 1].flatMap((y) =>
  [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([x, z]): [number, number, number] => [x, y * HALF_HEIGHT, z]),
)
const faces: { normal: [number, number, number]; ring: number[] }[] = [
  { normal: [0, 1, 0], ring: [4, 5, 6, 7] },
  { normal: [0, -1, 0], ring: [0, 1, 2, 3] },
  { normal: [0, 0, -1], ring: [0, 1, 5, 4] },
  { normal: [1, 0, 0], ring: [1, 2, 6, 5] },
  { normal: [0, 0, 1], ring: [2, 3, 7, 6] },
  { normal: [-1, 0, 0], ring: [3, 0, 4, 7] },
]
/* The tape: across the top face, between the middles of two opposite edges. */
const tape: [number, number, number][] = [
  [-1, HALF_HEIGHT, 0],
  [1, HALF_HEIGHT, 0],
]

/* Screen point on the 24 grid for a model point, with the box turned `turn`. */
export function project([x, y, z]: [number, number, number], turn: number): [number, number] {
  const across = x * Math.cos(turn) - z * Math.sin(turn)
  const toward = x * Math.sin(turn) + z * Math.cos(turn)
  return [12 + SCALE * across, 12 - SCALE * (y * COS_TILT - toward * SIN_TILT)]
}

/* The icon as one SVG path: every edge of a face that faces the viewer (on a
   convex box that is exactly the visible edges), plus the tape. */
export function packagePath(turn: number): string {
  const facing = (n: [number, number, number]) =>
    n[1] * SIN_TILT + (n[0] * Math.sin(turn) + n[2] * Math.cos(turn)) * COS_TILT > 1e-6
  const edges = new Set<string>()
  for (const { normal, ring } of faces) {
    if (!facing(normal)) continue
    ring.forEach((a, i) => {
      const b = ring[(i + 1) % ring.length]
      edges.add(a < b ? `${a}-${b}` : `${b}-${a}`)
    })
  }
  const point = (p: [number, number, number]) => project(p, turn).map((v) => v.toFixed(3)).join(' ')
  const segments = [...edges].map((edge) => {
    const [a, b] = edge.split('-').map(Number)
    return `M${point(corners[a])}L${point(corners[b])}`
  })
  return segments.join('') + `M${point(tape[0])}L${point(tape[1])}`
}
