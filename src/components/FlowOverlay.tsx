import { useLayoutEffect, useRef } from 'react'

/* The "flow" along the problem and solution cards, running on its own at one
   slow speed with a new wave every few seconds. Dashes run round each problem
   card's border both ways and meet in the ring, which pulses; a new dash
   leaves the ring, runs round each step card and slides into the final
   circle. Drawn on a canvas the same way as the hero pill's Star Border: the
   trail is cut into ~2px steps that fade in and whiten toward the head, under
   a faint wide glow stroke, with a soft bloom at the head. Geometry is
   measured from [data-flow] elements (problem, step, final). */
const DASH = 56
const SPEED = 150 // px per second
const EVERY = 10 // seconds between waves
const GAP = SPEED * EVERY // px between waves along the route
const PULSE = 60 // px of travel the ring stays lit after an arrival
const GLOW = 0.8
const THICKNESS = 1
const BLEED = 48 // canvas overhang so the glow isn't clipped
const STEPS = 8
/* Per problem card: outer corner, then the inner corner nearest the ring. */
const CORNERS = [['tl', 'br'], ['tr', 'bl'], ['bl', 'tr'], ['br', 'tl']]

type Pt = [number, number]
type Box = { x: number; y: number; w: number; h: number }
type Rgb = [number, number, number]
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

/* Clockwise outline of a card, inset 0.5px so the stroke centres on its 1px
   border, starting at top-centre. marks holds arc-length positions. */
function outline(b: Box, [rtl, rtr, rbr, rbl]: number[]) {
  const x0 = b.x + 0.5, y0 = b.y + 0.5, x1 = b.x + b.w - 0.5, y1 = b.y + b.h - 0.5
  const pts: Pt[] = [[b.x + b.w / 2, y0]]
  const at: Record<string, number> = {}
  const arc = (name: string, cx: number, cy: number, r: number, a0: number) => {
    const n = r > 0 ? STEPS : 0
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i * Math.PI) / 2 / Math.max(n, 1)
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
      if (i === n / 2) at[name] = pts.length - 1
    }
    if (!n) at[name] = pts.length - 1
  }
  arc('tr', x1 - rtr, y0 + rtr, rtr, -Math.PI / 2)
  arc('br', x1 - rbr, y1 - rbr, rbr, 0)
  pts.push([b.x + b.w / 2, y1])
  at.bc = pts.length - 1
  arc('bl', x0 + rbl, y1 - rbl, rbl, Math.PI / 2)
  arc('tl', x0 + rtl, y0 + rtl, rtl, Math.PI)
  pts.push(pts[0])
  const cum = pts.map((_, i) => length(pts.slice(0, i + 1)))
  const total = cum[cum.length - 1]
  const pos = Object.fromEntries(Object.entries(at).map(([k, i]) => [k, cum[i]]))
  /* Clockwise from one arc-length to another, wrapping past the start. */
  const slice = (from: number, to: number) => {
    if (to <= from) to += total
    const ext = pts.concat(pts.slice(1))
    const ec = cum.concat(cum.slice(1).map((c) => c + total))
    const point = (s: number): Pt => {
      let i = 1
      while (i < ec.length - 1 && ec[i] < s) i++
      const t = (s - ec[i - 1]) / (ec[i] - ec[i - 1] || 1)
      return [ext[i - 1][0] + (ext[i][0] - ext[i - 1][0]) * t, ext[i - 1][1] + (ext[i][1] - ext[i - 1][1]) * t]
    }
    return [point(from), ...ext.filter((_, i) => ec[i] > from && ec[i] < to), point(to)]
  }
  return { pos, total, slice, x: b.x + b.w / 2, top: y0, bottom: y1 }
}

/* Render inside the positioned wrapper around the problem and solution
   sections: it measures from its own parent, since a parent's ref is not yet
   attached when this layout effect runs. */
export default function FlowOverlay({ animate }: { animate: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const line = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const canvasEl = canvas.current
    const ctx = canvasEl?.getContext('2d')
    const ringEl = ring.current
    const lineEl = line.current
    const wrap = ringEl?.parentElement
    if (!wrap || !ringEl || !lineEl) return

    let specs: Spec[] = []
    let color: Rgb = WHITE
    let dpr = 1
    let arrive = 0
    let frame = 0
    let lastRing = false
    const t0 = performance.now()

    /* Rects relative to the wrapper, minus any Reveal entrance offset. */
    const boxOf = (el: Element, wr: DOMRect): Box => {
      const r = el.getBoundingClientRect()
      const ty = typeof DOMMatrix === 'function' ? new DOMMatrix(getComputedStyle(el.closest('.reveal') ?? el).transform).m42 : 0
      return { x: r.left - wr.left, y: r.top - wr.top - ty, w: r.width, h: r.height }
    }
    const radiiOf = (el: Element) => {
      const s = getComputedStyle(el)
      return [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius].map((v) =>
        Math.max(0, (parseFloat(v) || 0) - 0.5),
      )
    }

    const mod = (n: number) => ((n % GAP) + GAP) % GAP
    const stroke = (a: Pt, b: Pt, width: number, style: string | CanvasGradient) => {
      ctx!.lineWidth = width
      ctx!.strokeStyle = style
      ctx!.beginPath()
      ctx!.moveTo(a[0], a[1])
      ctx!.lineTo(b[0], b[1])
      ctx!.stroke()
    }
    /* One dash with its head at t along the path: ~2px steps fading in from
       the tail, whitening toward the head, over a faint wide glow. */
    const dash = (spec: Spec, t: number) => {
      const steps = Math.ceil(DASH / 2)
      for (let i = 1; i <= steps; i++) {
        const from = Math.min(spec.len, t - (DASH * (i - 1)) / steps)
        const to = Math.max(0, t - (DASH * i) / steps)
        if (from <= to) continue
        const u = 1 - (i - 0.5) / steps
        const fade = u * u
        const tone = mix(color, WHITE, u ** 6 * 0.65)
        const a = pointAt(spec, from)
        const b = pointAt(spec, to)
        stroke(a, b, 2 + 6 * GLOW, rgba(tone, fade * 0.2 * GLOW))
        stroke(a, b, THICKNESS, rgba(tone, fade))
      }
      if (t < 0 || t > spec.len) return
      const [x, y] = pointAt(spec, t)
      const reach = 12 + 40 * GLOW
      const strength = 0.4 * GLOW
      const bloom = ctx!.createRadialGradient(x, y, 0, x, y, reach)
      bloom.addColorStop(0, rgba(color, strength))
      bloom.addColorStop(0.2, rgba(color, strength * 0.4))
      bloom.addColorStop(0.5, rgba(color, strength * 0.1))
      bloom.addColorStop(1, rgba(color, 0))
      ctx!.fillStyle = bloom
      ctx!.fillRect(x - reach, y - reach, reach * 2, reach * 2)
    }
    const draw = (now = performance.now()) => {
      if (!ctx || !canvasEl) return
      const d = ((now - t0) / 1000) * SPEED
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
      ctx.setTransform(dpr, 0, 0, dpr, BLEED * dpr, BLEED * dpr)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'butt'
      for (const spec of specs) {
        const t = mod(d - spec.s)
        if (t <= spec.len + DASH) dash(spec, t)
      }
      const lit = arrive > 0 && mod(d - arrive) <= PULSE
      if (lit !== lastRing) {
        lastRing = lit
        ringEl.style.borderColor = lit ? 'var(--color-primary)' : ''
      }
    }
    const loop = (now: number) => {
      draw(now)
      frame = requestAnimationFrame(loop)
    }

    const measure = () => {
      const wr = wrap.getBoundingClientRect()
      const wide = window.matchMedia('(min-width: 768px)').matches
      const problem = [...wrap.querySelectorAll('[data-flow="problem"]')].map((el) => boxOf(el, wr))
      const stepEls = [...wrap.querySelectorAll('[data-flow="step"]')]
      const finalEl = wrap.querySelector('[data-flow="final"]')
      if (!stepEls.length || !finalEl) return
      const steps = stepEls.map((el) => boxOf(el, wr))
      const fin = boxOf(finalEl, wr)

      const cx = wide && problem.length === 4 ? (problem[0].x + problem[0].w + problem[1].x) / 2 : 0
      const cy = wide && problem.length === 4 ? (problem[0].y + problem[0].h + problem[2].y) / 2 : 0
      // Ring centred between the four cards, connector down to Diagnose (+3px overlap).
      ringEl.style.visibility = lineEl.style.visibility = wide ? 'visible' : 'hidden'
      ringEl.style.transform = `translate(${cx - 12}px, ${cy - 12}px)`
      lineEl.style.transform = `translate(${cx - 3}px, ${cy + 9}px)`
      lineEl.style.height = `${steps[0].y + 3 - (cy + 9)}px`

      if (!animate || !canvasEl || !ctx) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvasEl.width = Math.round((wr.width + BLEED * 2) * dpr)
      canvasEl.height = Math.round((wr.height + BLEED * 2) * dpr)
      color = toRgb(ctx, getComputedStyle(wrap).getPropertyValue('--color-primary').trim() || '#f04a00')
      const ringPt: Pt = [cx, cy]
      const route = (pts: Pt[], start: number) => {
        const cum = pts.map((_, i) => length(pts.slice(0, i + 1)))
        specs.push({ pts, cum, len: cum[cum.length - 1], s: start })
        return cum[cum.length - 1]
      }
      specs = []
      // Problem phase: both ways round each card to its inner corner, then into the ring.
      const runs: Pt[][] = []
      if (wide && problem.length === 4) {
        const radii = radiiOf(wrap.querySelector('[data-flow="problem"]')!)
        problem.forEach((b, i) => {
          const o = outline(b, radii)
          const [from, to] = CORNERS[i]
          runs.push([...o.slice(o.pos[from], o.pos[to]), ringPt], [...o.slice(o.pos[to], o.pos[from]).reverse(), ringPt])
        })
      }
      // Every run ends at the ring on the same beat: shorter ones start later.
      const maxLen = Math.max(0, ...runs.map(length))
      runs.forEach((pts) => route(pts, maxLen - length(pts)))

      let cursor = maxLen
      const add = (pts: Pt[]) => route(pts, cursor)
      const outs = stepEls.map((el, i) => outline(steps[i], radiiOf(el)))
      if (wide) cursor += add([ringPt, [outs[0].x, outs[0].top]])
      outs.forEach((o, i) => {
        const half = add(o.slice(0, o.pos.bc))
        add(o.slice(o.pos.bc, o.total).reverse())
        cursor += half
        const next: Pt = i + 1 < outs.length ? [outs[i + 1].x, outs[i + 1].top] : [fin.x + fin.w / 2, fin.y]
        cursor += add([[o.x, o.bottom], next])
      })
      arrive = maxLen
      draw()
    }

    measure()
    // Only run frames while the flow is on screen.
    let io: IntersectionObserver | undefined
    if (animate && typeof IntersectionObserver === 'function') {
      io = new IntersectionObserver(([entry]) => {
        cancelAnimationFrame(frame)
        frame = entry.isIntersecting ? requestAnimationFrame(loop) : 0
      })
      io.observe(wrap)
    }
    let observer: ResizeObserver | undefined
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(measure)
      observer.observe(wrap)
      wrap.querySelectorAll('[data-flow]').forEach((el) => observer!.observe(el))
    }
    document.fonts?.ready.then(measure)
    return () => {
      cancelAnimationFrame(frame)
      io?.disconnect()
      observer?.disconnect()
    }
  }, [animate])

  return (
    <>
      <div ref={ring} aria-hidden="true" className="invisible absolute top-0 left-0 hidden size-6 rounded-pill border border-border transition-colors duration-500 md:block" />
      <div ref={line} aria-hidden="true" className="invisible absolute top-0 left-0 hidden w-1.5 md:block">
        <div className="flex h-full flex-col items-center gap-0.5">
          <span className="size-1.5 shrink-0 rounded-pill bg-border" />
          <span className="w-px flex-1 bg-border" />
          <span className="size-1.5 shrink-0 rounded-pill bg-border" />
        </div>
      </div>
      {animate && (
        <canvas
          ref={canvas}
          aria-hidden="true"
          className="pointer-events-none absolute top-[-48px] left-[-48px] h-[calc(100%+96px)] w-[calc(100%+96px)]"
        />
      )}
    </>
  )
}
