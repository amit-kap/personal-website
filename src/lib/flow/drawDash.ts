/* Draws one glowing dash of the flow overlay onto its canvas. */
import { WHITE, mix, rgba, type Rgb } from './color'
import { pointAt, type Pt, type FlowLine } from './geometry'

/* Length of a dash in px, tail to head. */
export const DASH = 20
/* Overall strength of the glow stroke and the bloom at the head. */
const GLOW = 0.5
/* Width of the crisp core stroke. */
const THICKNESS = 1

const stroke = (ctx: CanvasRenderingContext2D, from: Pt, to: Pt, width: number, style: string) => {
  ctx.lineWidth = width
  ctx.strokeStyle = style
  ctx.beginPath()
  ctx.moveTo(from[0], from[1])
  ctx.lineTo(to[0], to[1])
  ctx.stroke()
}

/* One dash with its head `head` px along the line: ~2px steps fading in from
   the tail, whitening toward the head, over a faint wide glow. */
export function drawDash(ctx: CanvasRenderingContext2D, line: FlowLine, head: number, color: Rgb) {
  if (head <= 0 || head > line.len + DASH) return
  const steps = Math.ceil(DASH / 2)
  for (let i = 1; i <= steps; i++) {
    // Each step is clamped to the line, so a dash slides on and off its ends.
    const stepStart = Math.min(line.len, head - (DASH * (i - 1)) / steps)
    const stepEnd = Math.max(0, head - (DASH * i) / steps)
    if (stepStart <= stepEnd) continue
    // 1 at the head, 0 at the tail; the fade is quadratic, the whitening much sharper.
    const nearHead = 1 - (i - 0.5) / steps
    const fade = nearHead * nearHead
    const tone = mix(color, WHITE, nearHead ** 6 * 0.65)
    const from = pointAt(line, stepStart)
    const to = pointAt(line, stepEnd)
    stroke(ctx, from, to, 2 + 6 * GLOW, rgba(tone, fade * 0.2 * GLOW))
    stroke(ctx, from, to, THICKNESS, rgba(tone, fade))
  }
  // The bloom belongs to the head, so it is only drawn while the head is on the line.
  if (head > line.len) return
  const [x, y] = pointAt(line, head)
  const reach = 12 + 40 * GLOW
  const strength = 0.4 * GLOW
  const bloom = ctx.createRadialGradient(x, y, 0, x, y, reach)
  bloom.addColorStop(0, rgba(color, strength))
  bloom.addColorStop(0.2, rgba(color, strength * 0.4))
  bloom.addColorStop(0.5, rgba(color, strength * 0.1))
  bloom.addColorStop(1, rgba(color, 0))
  ctx.fillStyle = bloom
  ctx.fillRect(x - reach, y - reach, reach * 2, reach * 2)
}
