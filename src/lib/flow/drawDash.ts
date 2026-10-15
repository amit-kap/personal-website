import { WHITE, mix, rgba, type Rgb } from './color'
import { pointAt, type Pt, type Spec } from './geometry'

export const DASH = 20
const GLOW = 0.5
const THICKNESS = 1

const stroke = (c: CanvasRenderingContext2D, a: Pt, b: Pt, width: number, style: string) => {
  c.lineWidth = width
  c.strokeStyle = style
  c.beginPath()
  c.moveTo(a[0], a[1])
  c.lineTo(b[0], b[1])
  c.stroke()
}

/* One dash with its head at t along the path: ~2px steps fading in from
   the tail, whitening toward the head, over a faint wide glow. */
export function drawDash(c: CanvasRenderingContext2D, spec: Spec, t: number, color: Rgb) {
  if (t <= 0 || t > spec.len + DASH) return
  const n = Math.ceil(DASH / 2)
  for (let i = 1; i <= n; i++) {
    const from = Math.min(spec.len, t - (DASH * (i - 1)) / n)
    const to = Math.max(0, t - (DASH * i) / n)
    if (from <= to) continue
    const u = 1 - (i - 0.5) / n
    const fade = u * u
    const tone = mix(color, WHITE, u ** 6 * 0.65)
    const a = pointAt(spec, from)
    const b = pointAt(spec, to)
    stroke(c, a, b, 2 + 6 * GLOW, rgba(tone, fade * 0.2 * GLOW))
    stroke(c, a, b, THICKNESS, rgba(tone, fade))
  }
  if (t > spec.len) return
  const [x, y] = pointAt(spec, t)
  const reach = 12 + 40 * GLOW
  const strength = 0.4 * GLOW
  const bloom = c.createRadialGradient(x, y, 0, x, y, reach)
  bloom.addColorStop(0, rgba(color, strength))
  bloom.addColorStop(0.2, rgba(color, strength * 0.4))
  bloom.addColorStop(0.5, rgba(color, strength * 0.1))
  bloom.addColorStop(1, rgba(color, 0))
  c.fillStyle = bloom
  c.fillRect(x - reach, y - reach, reach * 2, reach * 2)
}
