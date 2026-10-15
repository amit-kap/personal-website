import { useLayoutEffect, useRef } from 'react'

/* The "flow" from the problem cards to the clients circle, drawn like a flow
   diagram. The problem cards are joined by curved connectors: from a dot at
   the middle of each card's inner side, a quarter circle bends down into one
   trunk between the columns, which stops just above the centred Proposed
   Solution label. A constant stream of short glowing dashes runs from each
   dot along its curve and down the trunk, and on down the connectors between
   the step cards to the clients circle.
   Each line carries a phase ("distance along the flow", which is simply y on
   the vertical lines), so dashes stay evenly spaced and in step where lines
   meet. Dashes are drawn on a canvas the same way as the hero pill's Star
   Border: the trail is cut into ~2px steps that fade in and whiten toward the
   head, under a faint wide glow stroke, with a soft bloom at the head.
   Geometry is measured from [data-flow] elements (problem, step, final). */
const DASH = 20
const SPACING = 56 // px between dashes along a line
const SPEED = 60 // px per second
const GLOW = 0.5
const THICKNESS = 1
const BLEED = 48 // canvas overhang so the glow isn't clipped
const LABEL_GAP = 8 // px between the trunk and the solution label
const DOT = 3 // connector dot radius
const DOT_GAP = 2 // px between a dot and its line, as in the step connectors

type Pt = [number, number]
type Box = { x: number; y: number; w: number; h: number }
type Rgb = [number, number, number]
/* A line of the flow; s is its phase at its start. */
type Spec = { pts: Pt[]; cum: number[]; len: number; s: number }

const WHITE: Rgb = [255, 255, 255]
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const rgba = (c: Rgb, alpha: number) => `rgba(${c.map(Math.round).join(', ')}, ${Math.min(1, Math.max(0, alpha)).toFixed(3)})`

/* Any CSS colour to RGB, via a canvas context's colour parser. */
function toRgb(ctx: CanvasRenderingContext2D, color: string): Rgb {
  ctx.fillStyle = '#000'
  ctx.fillStyle = color
  const v = String(ctx.fillStyle)
  if (v.startsWith('#')) {
    const n = parseInt(v.slice(1, 7), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const parts = v.match(/[\d.]+/g)?.map(Number) ?? WHITE
  return [parts[0], parts[1], parts[2]]
}

/* Point at arc-length d along a measured polyline. */
function pointAt({ pts, cum }: Spec, d: number): Pt {
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

const length = (pts: Pt[]) => pts.reduce((sum, p, i) => (i ? sum + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0)

const polyline = (pts: Pt[], s = 0): Spec => {
  const cum = pts.map((_, i) => length(pts.slice(0, i + 1)))
  return { pts, cum, len: cum[cum.length - 1], s }
}

/* Render inside the positioned wrapper around the problem and solution
   sections: it measures from its own parent, since a parent's ref is not yet
   attached when this layout effect runs. */
export default function FlowOverlay({ animate }: { animate: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const lines = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    const canvasEl = canvas.current
    const ctx = canvasEl?.getContext('2d')
    const linesEl = lines.current
    const wrap = linesEl?.parentElement
    if (!wrap || !linesEl) return

    let specs: Spec[] = []
    let color: Rgb = WHITE
    let dpr = 1
    let frame = 0
    let visible = false
    const t0 = performance.now()

    /* Rects relative to the wrapper, minus any Reveal entrance offset. */
    const boxOf = (el: Element, wr: DOMRect): Box => {
      const r = el.getBoundingClientRect()
      const ty = typeof DOMMatrix === 'function' ? new DOMMatrix(getComputedStyle(el.closest('.reveal') ?? el).transform).m42 : 0
      return { x: r.left - wr.left, y: r.top - wr.top - ty, w: r.width, h: r.height }
    }

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
    const dash = (c: CanvasRenderingContext2D, spec: Spec, t: number) => {
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

    const draw = (now = performance.now()) => {
      if (!ctx || !canvasEl) return
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
      ctx.setTransform(dpr, 0, 0, dpr, BLEED * dpr, BLEED * dpr)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'butt'
      const d = ((now - t0) / 1000) * SPEED
      for (const spec of specs) {
        // Heads sit wherever the phase is a whole number of SPACINGs behind d.
        const first = (((d - spec.s) % SPACING) + SPACING) % SPACING
        for (let t = first; t <= spec.len + DASH; t += SPACING) dash(ctx, spec, t)
      }
    }
    const loop = (now: number) => {
      draw(now)
      frame = visible ? requestAnimationFrame(loop) : 0
    }

    const measure = () => {
      const wr = wrap.getBoundingClientRect()
      const wide = window.matchMedia('(min-width: 768px)').matches
      const problem = [...wrap.querySelectorAll('[data-flow="problem"]')].map((el) => boxOf(el, wr))
      const stepEls = [...wrap.querySelectorAll('[data-flow="step"]')]
      const finalEl = wrap.querySelector('[data-flow="final"]')
      if (!stepEls.length || !finalEl) return
      const steps = stepEls.map((el) => boxOf(el, wr))
      // The dash ends on the solid circle, inside the halo.
      const fin = boxOf(finalEl.firstElementChild ?? finalEl, wr)
      // The trunk ends LABEL_GAP above the solution label. The label sits a
      // column gap above the step list; measured from layout, not its rect,
      // so its own entrance offset can't skew it.
      const labelEl = stepEls[0].closest('section')?.querySelector<HTMLElement>('h2')
      const labelGap = labelEl?.parentElement ? parseFloat(getComputedStyle(labelEl.parentElement).rowGap) || 0 : 0
      const stop = steps[0].y - (labelEl ? labelEl.offsetHeight + labelGap : 0) - LABEL_GAP

      const grid = wide && problem.length === 4
      const cx = grid ? (problem[0].x + problem[0].w + problem[1].x) / 2 : steps[0].x + steps[0].w / 2

      // The connectors: a dot on the middle of each card's inner side, then a
      // quarter circle from DOT_GAP past it bending down into the trunk.
      const joins = problem.map((b, i) => {
        const left = i % 2 === 0
        const edge = left ? b.x + b.w - 0.5 : b.x + 0.5
        const y = b.y + b.h / 2
        const sx = edge + (left ? 1 : -1) * (DOT + DOT_GAP)
        const r = Math.abs(cx - sx)
        return { left, edge, y, sx, r, end: y + r }
      })
      const upper = Math.min(...joins.map((j) => j.end))
      const end = stop - DOT * 2 - DOT_GAP
      linesEl.innerHTML = grid
        ? [
            ...joins.map(
              (j) =>
                `<circle cx="${j.edge}" cy="${j.y}" r="${DOT}" class="fill-border stroke-none" />` +
                `<path d="M${j.sx} ${j.y} A${j.r} ${j.r} 0 0 ${j.left ? 1 : 0} ${cx} ${j.end}" />`,
            ),
            `<path d="M${cx} ${upper} V${end}" />`,
            `<circle cx="${cx}" cy="${stop - DOT}" r="${DOT}" class="fill-border stroke-none" />`,
          ].join('')
        : ''

      if (!animate || !canvasEl || !ctx) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvasEl.width = Math.round((wr.width + BLEED * 2) * dpr)
      canvasEl.height = Math.round((wr.height + BLEED * 2) * dpr)
      color = toRgb(ctx, getComputedStyle(wrap).getPropertyValue('--color-primary').trim() || '#f04a00')

      // On the vertical lines the phase is y; each curve's phase counts back
      // from where it meets the trunk.
      const vertical = (from: number, to: number) => polyline([[cx, from], [cx, to]], from)
      specs = []
      if (grid) {
        for (const j of joins) {
          const curve: Pt[] = Array.from({ length: 17 }, (_, k) => {
            const a = -Math.PI / 2 + ((j.left ? 1 : -1) * (k * Math.PI)) / 2 / 16
            return [j.sx + j.r * Math.cos(a), j.y + j.r + j.r * Math.sin(a)]
          })
          const pts: Pt[] = [[j.edge, j.y], ...curve]
          specs.push(polyline(pts, j.end - length(pts)))
        }
        specs.push(vertical(upper, stop - DOT))
      }
      // Down the connectors between the step cards, and to the circle.
      steps.forEach((b, i) => {
        const next = i + 1 < steps.length ? steps[i + 1].y + 0.5 : fin.y
        specs.push(vertical(b.y + b.h - 0.5, next))
      })
      draw()
    }

    measure()
    // Only run frames while the flow is on screen.
    const seen =
      animate && typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            if (visible && !frame) frame = requestAnimationFrame(loop)
          })
        : undefined
    seen?.observe(wrap)
    let observer: ResizeObserver | undefined
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(measure)
      observer.observe(wrap)
      wrap.querySelectorAll('[data-flow]').forEach((el) => observer!.observe(el))
    }
    document.fonts?.ready.then(measure)
    return () => {
      cancelAnimationFrame(frame)
      seen?.disconnect()
      observer?.disconnect()
    }
  }, [animate])

  return (
    <>
      <svg ref={lines} aria-hidden="true" className="pointer-events-none absolute inset-0 hidden size-full overflow-visible fill-none stroke-border md:block" />
      {animate && (
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="pointer-events-none absolute top-[-48px] left-[-48px] z-20 h-[calc(100%+96px)] w-[calc(100%+96px)]"
        />
      )}
    </>
  )
}
