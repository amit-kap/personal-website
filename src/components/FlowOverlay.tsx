import { useLayoutEffect, useRef } from 'react'

/* The "flow" from the problem cards to the solution. A problem card fires one
   wave as it scrolls into view (so the top pair, then the bottom pair), and
   again when clicked, which also presses it like a button. A wave: a dash runs round that card's border both ways to its inner
   corner while a wide light sweeps across the card the same way, the dashes
   meet in the ring, which pulses, and a new dash leaves the ring, runs round
   each step card and slides into the final circle, whose halo grows out and
   fades when it lands. A hovered card scales down a little, so its sweep and
   border dashes are drawn scaled to the card's live size. Drawn on a canvas the same
   way as the hero pill's Star Border: the trail is cut into ~2px steps that
   fade in and whiten toward the head, under a faint wide glow stroke, with a
   soft bloom at the head. Geometry is measured from [data-flow] elements
   (problem, step, final). */
const DASH = 56
const SPEED = 400 // px per second
const PULSE = 60 // px of travel the ring stays lit after an arrival
const GLOW = 0.8
const THICKNESS = 1
const BLEED = 48 // canvas overhang so the glow isn't clipped
const SWEEP = 280 // px width of the light band across a card
const SWEEP_ALPHA = 0.35
const STEPS = 8
/* Per problem card: outer corner, then the inner corner nearest the ring. */
const CORNERS = [['tl', 'br'], ['tr', 'bl'], ['bl', 'tr'], ['br', 'tl']]

type Pt = [number, number]
type Box = { x: number; y: number; w: number; h: number }
type Rgb = [number, number, number]
type Spec = { pts: Pt[]; cum: number[]; len: number; s: number }
/* A problem card: its two border runs to the inner corner (the dashes then
   cross to the ring), the sweep axis from its outer corner to its inner
   corner, and how far its dashes travel. */
type Card = { el: HTMLElement; box: Box; radius: number; edges: Spec[]; from: Pt; to: Pt; border: number; arrive: number }
type Wave = { card: number; t0: number; landed: boolean }

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

    let cards: Card[] = []
    let chain: Spec[] = [] // from the ring to the final circle, s relative to the ring
    let chainEnd = 0
    let waves: Wave[] = []
    let color: Rgb = WHITE
    let dpr = 1
    let frame = 0
    let lastRing = false
    let ringPt: Pt = [0, 0]
    const pulseEl = wrap.querySelector<HTMLElement>('[data-flow-pulse]')

    /* Rects relative to the wrapper, minus any Reveal entrance offset. Taken
       from the rect's centre and the layout size, so a card scaled on hover
       still gives its full-size box. */
    const boxOf = (el: Element, wr: DOMRect): Box => {
      const r = el.getBoundingClientRect()
      const ty = typeof DOMMatrix === 'function' ? new DOMMatrix(getComputedStyle(el.closest('.reveal') ?? el).transform).m42 : 0
      const w = (el as HTMLElement).offsetWidth || r.width
      const h = (el as HTMLElement).offsetHeight || r.height
      return { x: r.left + r.width / 2 - w / 2 - wr.left, y: r.top + r.height / 2 - h / 2 - wr.top - ty, w, h }
    }
    const radiiOf = (el: Element) => {
      const s = getComputedStyle(el)
      return [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius].map((v) =>
        Math.max(0, (parseFloat(v) || 0) - 0.5),
      )
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
    /* A wide band of light crossing the card from its outer corner to its
       inner corner, in step with the dashes on its border. */
    const sweep = (c: CanvasRenderingContext2D, card: Card, d: number) => {
      const [fx, fy] = card.from
      const dx = card.to[0] - fx
      const dy = card.to[1] - fy
      const span = Math.hypot(dx, dy)
      const p = d / card.border
      if (p <= 0 || p >= 1) return
      const [ux, uy] = [dx / span, dy / span]
      const mid = -SWEEP / 2 + p * (span + SWEEP)
      const g = c.createLinearGradient(fx + ux * (mid - SWEEP / 2), fy + uy * (mid - SWEEP / 2), fx + ux * (mid + SWEEP / 2), fy + uy * (mid + SWEEP / 2))
      g.addColorStop(0, rgba(color, 0))
      g.addColorStop(0.5, rgba(color, SWEEP_ALPHA))
      g.addColorStop(1, rgba(color, 0))
      const { x, y, w, h } = card.box
      c.save()
      c.beginPath()
      c.roundRect(x, y, w, h, card.radius)
      c.clip()
      c.fillStyle = g
      c.fillRect(x, y, w, h)
      c.restore()
    }

    const draw = (now = performance.now()) => {
      if (!ctx || !canvasEl) return
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
      ctx.setTransform(dpr, 0, 0, dpr, BLEED * dpr, BLEED * dpr)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'butt'
      let lit = false
      waves = waves.filter((w) => cards[w.card] && ((now - w.t0) / 1000) * SPEED <= cards[w.card].arrive + chainEnd + DASH)
      for (const w of waves) {
        const card = cards[w.card]
        const d = ((now - w.t0) / 1000) * SPEED
        // The card's live scale (hover and press), about its centre.
        const k = card.el.getBoundingClientRect().width / card.box.w || 1
        const cx = card.box.x + card.box.w / 2
        const cy = card.box.y + card.box.h / 2
        const scaled = (p: Pt): Pt => [cx + (p[0] - cx) * k, cy + (p[1] - cy) * k]
        ctx.save()
        ctx.transform(k, 0, 0, k, cx * (1 - k), cy * (1 - k))
        sweep(ctx, card, d)
        for (const spec of card.edges) dash(ctx, spec, d)
        ctx.restore()
        // Then straight from the (scaled) inner corner into the ring.
        for (const spec of card.edges) dash(ctx, polyline([scaled(spec.pts[spec.pts.length - 1]), ringPt], spec.len), d - spec.len)
        const out = d - card.arrive
        for (const spec of chain) dash(ctx, spec, out - spec.s)
        if (out >= 0 && out <= PULSE) lit = true
        if (!w.landed && out >= chainEnd) {
          w.landed = true
          // The halo grows out from the solid circle (80 of its 128px) and fades.
          pulseEl?.animate(
            [
              { opacity: 1, transform: 'scale(0.625)' },
              { opacity: 1, transform: 'scale(1)', offset: 0.45 },
              { opacity: 0, transform: 'scale(1.15)' },
            ],
            { duration: 1600, easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)' },
          )
        }
      }
      if (lit !== lastRing) {
        lastRing = lit
        ringEl.style.borderColor = lit ? 'var(--color-primary)' : ''
      }
    }
    const polyline = (pts: Pt[], s = 0): Spec => {
      const cum = pts.map((_, i) => length(pts.slice(0, i + 1)))
      return { pts, cum, len: cum[cum.length - 1], s }
    }
    const loop = (now: number) => {
      draw(now)
      frame = waves.length ? requestAnimationFrame(loop) : 0
    }

    const measure = () => {
      const wr = wrap.getBoundingClientRect()
      const wide = window.matchMedia('(min-width: 768px)').matches
      const problemEls = [...wrap.querySelectorAll<HTMLElement>('[data-flow="problem"]')]
      const problem = problemEls.map((el) => boxOf(el, wr))
      const stepEls = [...wrap.querySelectorAll('[data-flow="step"]')]
      const finalEl = wrap.querySelector('[data-flow="final"]')
      if (!stepEls.length || !finalEl) return
      const steps = stepEls.map((el) => boxOf(el, wr))
      // The dash ends on the solid circle, inside the halo.
      const fin = boxOf(finalEl.querySelector(':scope > :not([data-flow-pulse])') ?? finalEl, wr)

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
      ringPt = [cx, cy]
      const spec = polyline

      // Each card: both ways round its border to the inner corner, then into the ring.
      cards = []
      if (wide && problem.length === 4) {
        problem.forEach((b, i) => {
          const radii = radiiOf(problemEls[i])
          const o = outline(b, radii)
          const [from, to] = CORNERS[i]
          const one = o.slice(o.pos[from], o.pos[to])
          const two = o.slice(o.pos[to], o.pos[from]).reverse()
          const edges = [spec(one), spec(two)]
          const border = Math.max(...edges.map((e) => e.len))
          const arrive = Math.max(...edges.map((e) => e.len + length([e.pts[e.pts.length - 1], ringPt])))
          cards.push({ el: problemEls[i], box: b, radius: radii[0], edges, from: one[0], to: one[one.length - 1], border, arrive })
        })
      }

      // From the ring: down to Diagnose, both ways round each step card, down to the circle.
      chain = []
      let cursor = 0
      const add = (pts: Pt[]) => {
        const sp = spec(pts, cursor)
        chain.push(sp)
        return sp.len
      }
      const outs = stepEls.map((el, i) => outline(steps[i], radiiOf(el)))
      if (wide) cursor += add([ringPt, [outs[0].x, outs[0].top]])
      outs.forEach((o, i) => {
        const half = add(o.slice(0, o.pos.bc))
        add(o.slice(o.pos.bc, o.total).reverse())
        cursor += half
        const next: Pt = i + 1 < outs.length ? [outs[i + 1].x, outs[i + 1].top] : [fin.x + fin.w / 2, fin.y]
        cursor += add([[o.x, o.bottom], next])
      })
      chainEnd = cursor
      draw()
    }

    /* One wave from card i, unless its last one is still on the card. */
    const fire = (i: number) => {
      const now = performance.now()
      if (waves.some((w) => w.card === i && ((now - w.t0) / 1000) * SPEED < cards[i].border)) return
      waves.push({ card: i, t0: now, landed: false })
      if (!frame) frame = requestAnimationFrame(loop)
    }
    /* Clicking a card presses it (scale down, then back up) and fires a wave. */
    const onClick = (event: Event) => {
      const i = cards.findIndex((c) => c.el === event.currentTarget)
      if (i < 0) return
      // From and back to whatever scale the card has (hover scales it down).
      cards[i].el.animate([{ scale: '0.95', offset: 0.35 }], {
        duration: 260,
        easing: 'cubic-bezier(0.3, 0, 0.2, 1)',
      })
      fire(i)
    }
    /* Each card fires as it comes well into view, and re-arms once it has
       scrolled fully out. */
    const armed = new Set<Element>()
    const seen =
      animate && typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                if (!entry.isIntersecting) armed.add(entry.target)
                else if (entry.intersectionRatio >= 0.6 && armed.delete(entry.target)) {
                  const i = cards.findIndex((c) => c.el === entry.target)
                  if (i >= 0) fire(i)
                }
              }
            },
            { threshold: [0, 0.6] },
          )
        : undefined

    measure()
    const problemEls = [...wrap.querySelectorAll('[data-flow="problem"]')]
    if (animate)
      problemEls.forEach((el) => {
        armed.add(el)
        el.addEventListener('click', onClick)
        seen?.observe(el)
      })
    let observer: ResizeObserver | undefined
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(measure)
      observer.observe(wrap)
      wrap.querySelectorAll('[data-flow]').forEach((el) => observer!.observe(el))
    }
    document.fonts?.ready.then(measure)
    return () => {
      cancelAnimationFrame(frame)
      problemEls.forEach((el) => el.removeEventListener('click', onClick))
      seen?.disconnect()
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
          className="pointer-events-none absolute top-[-48px] left-[-48px] z-20 h-[calc(100%+96px)] w-[calc(100%+96px)]"
        />
      )}
    </>
  )
}
