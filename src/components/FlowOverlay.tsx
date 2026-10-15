import { useLayoutEffect, useRef } from 'react'

/* The "flow" from the problem cards to the clients circle, looping on its own
   while it is on screen, in four steps with STEP_MS between them and LOOP_MS
   before the next round. Step one: all four problem cards fire at once: a dash
   runs round each card's border both ways to its inner corner while a wide
   light sweeps across it, the dashes meet in the ring, which lights, and one
   dash runs down the connector, which stops just above the centred Proposed
   Solution label, and Diagnose turns on with a sweep from top to bottom. Steps two to four: a dash runs down the connector from the
   card that is on and turns the next one on (Plan, then Build), which turns
   the one before off; at the circle the halo grows out and fades and the last
   card turns off.
   Dashes are drawn on a canvas the same way as the hero pill's Star Border:
   the trail is cut into ~2px steps that fade in and whiten toward the head,
   under a faint wide glow stroke, with a soft bloom at the head. Geometry is
   measured from [data-flow] elements (problem, step, final). */
const DASH = 56
const SPEED = 400 // px per second
const PULSE = 60 // px of travel the ring stays lit after the arrival
const GLOW = 0.8
const THICKNESS = 1
const BLEED = 48 // canvas overhang so the glow isn't clipped
const SWEEP = 280 // px width of the light band across a card
const SWEEP_ALPHA = 0.35
const SWEEP_MS = 900 // how long a step card's turn-on sweep takes
const STEP_MS = 500 // pause between the steps of a round
const LOOP_MS = 2500 // pause before the next round
const LABEL_GAP = 8 // px between the ring's connector and the solution label
const STEPS = 8
/* Per problem card: outer corner, then the inner corner nearest the ring. */
const CORNERS = [['tl', 'br'], ['tr', 'bl'], ['bl', 'tr'], ['br', 'tl']]

type Pt = [number, number]
type Box = { x: number; y: number; w: number; h: number }
type Rgb = [number, number, number]
type Spec = { pts: Pt[]; cum: number[]; len: number; s: number }
/* A card a sweep can cross: from one point to another, clipped to its box. */
type Lamp = { el: HTMLElement; box: Box; radii: number[]; from: Pt; to: Pt }
/* A problem card: its two border runs to the inner corner (the dashes then
   cross to the ring), how long its border runs are, and its distance to the
   ring along the longer run. */
type Card = Lamp & { edges: Spec[]; border: number; arrive: number }
/* One step of the flow: an optional problem phase, a connector the dash runs
   down, then the target turning on (a step card) or pulsing (the circle). */
type Leg = { problems: boolean; path?: Spec; step?: number; start?: number; done: boolean }

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
    let steps: Lamp[] = []
    let legs: Leg[] = []
    let sync = 0 // the problem dashes' common arrival distance at the ring
    let ringPt: Pt = [0, 0]
    let color: Rgb = WHITE
    let dpr = 1
    let frame = 0
    let lastRing = false
    const pulseEl = wrap.querySelector<HTMLElement>('[data-flow-pulse]')
    let visible = false

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
    const polyline = (pts: Pt[], s = 0): Spec => {
      const cum = pts.map((_, i) => length(pts.slice(0, i + 1)))
      return { pts, cum, len: cum[cum.length - 1], s }
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
    /* A wide band of light crossing the card from `from` to `to`; p runs 0-1. */
    const sweep = (c: CanvasRenderingContext2D, lamp: Lamp, p: number) => {
      if (p <= 0 || p >= 1) return
      const [fx, fy] = lamp.from
      const dx = lamp.to[0] - fx
      const dy = lamp.to[1] - fy
      const span = Math.hypot(dx, dy)
      const [ux, uy] = [dx / span, dy / span]
      const mid = -SWEEP / 2 + p * (span + SWEEP)
      const g = c.createLinearGradient(fx + ux * (mid - SWEEP / 2), fy + uy * (mid - SWEEP / 2), fx + ux * (mid + SWEEP / 2), fy + uy * (mid + SWEEP / 2))
      g.addColorStop(0, rgba(color, 0))
      g.addColorStop(0.5, rgba(color, SWEEP_ALPHA))
      g.addColorStop(1, rgba(color, 0))
      const { x, y, w, h } = lamp.box
      c.save()
      c.beginPath()
      c.roundRect(x, y, w, h, lamp.radii)
      c.clip()
      c.fillStyle = g
      c.fillRect(x, y, w, h)
      c.restore()
    }

    /* When a leg's dash reaches its target, and when the leg is over. */
    const pre = (leg: Leg) => (leg.problems ? sync : 0)
    const arrival = (leg: Leg) => leg.start! + ((pre(leg) + (leg.path?.len ?? 0)) / SPEED) * 1000
    const ends = (leg: Leg) => arrival(leg) + (leg.step === undefined ? (DASH / SPEED) * 1000 : SWEEP_MS)

    /* Only the newest step card is on, from the end of its sweep until the
       next dash arrives (the next card, or the circle); once the circle is
       reached everything is back off. */
    const light = (now: number) => {
      const reached = legs.filter((l) => l.start !== undefined && now >= arrival(l)).pop()
      steps.forEach((lamp, i) => {
        const on = reached?.step === i && now >= arrival(reached) + SWEEP_MS
        if (on !== lamp.el.hasAttribute('data-flow-on')) lamp.el.toggleAttribute('data-flow-on', on)
      })
    }

    const draw = (now = performance.now()) => {
      if (!ctx || !canvasEl) return
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
      ctx.setTransform(dpr, 0, 0, dpr, BLEED * dpr, BLEED * dpr)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'butt'
      let lit = false
      for (const leg of legs) {
        if (leg.start === undefined || now > ends(leg) + 100) continue
        const d = ((now - leg.start) / 1000) * SPEED
        if (leg.problems) {
          for (const card of cards) {
            // Shorter runs start later, so every dash reaches the ring together.
            const t = d - (sync - card.arrive)
            sweep(ctx, card, t / card.border)
            for (const spec of card.edges) dash(ctx, spec, t)
            // Then straight from the inner corner into the ring.
            for (const spec of card.edges) dash(ctx, polyline([spec.pts[spec.pts.length - 1], ringPt]), t - spec.len)
          }
          if (d >= sync && d <= sync + PULSE) lit = true
        }
        if (leg.path) dash(ctx, leg.path, d - pre(leg))
        const at = arrival(leg)
        if (now < at) continue
        if (leg.step !== undefined) sweep(ctx, steps[leg.step], (now - at) / SWEEP_MS)
        else if (!leg.done) {
          leg.done = true
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
      light(now)
    }

    /* Start the next step STEP_MS after the one before it is over, and a new
       round LOOP_MS after the last. */
    const check = (now: number) => {
      if (!legs.length) return
      const next = legs.findIndex((l) => l.start === undefined)
      if (next < 0) {
        if (now < ends(legs[legs.length - 1]) + LOOP_MS) return
        legs.forEach((l) => ((l.start = undefined), (l.done = false)))
        legs[0].start = now
        return
      }
      const before = legs[next - 1]
      if (before && now < ends(before) + STEP_MS) return
      legs[next].start = now
    }
    const loop = (now: number) => {
      check(now)
      draw(now)
      frame = visible ? requestAnimationFrame(loop) : 0
    }

    const measure = () => {
      const wr = wrap.getBoundingClientRect()
      const wide = window.matchMedia('(min-width: 768px)').matches
      const problemEls = [...wrap.querySelectorAll<HTMLElement>('[data-flow="problem"]')]
      const problem = problemEls.map((el) => boxOf(el, wr))
      const stepEls = [...wrap.querySelectorAll<HTMLElement>('[data-flow="step"]')]
      const finalEl = wrap.querySelector('[data-flow="final"]')
      if (!stepEls.length || !finalEl) return
      const stepBoxes = stepEls.map((el) => boxOf(el, wr))
      // The dash ends on the solid circle, inside the halo.
      // The ring's connector ends LABEL_GAP above the solution label. The label
      // sits a column gap above the step list; measured from layout, not its
      // rect, so its own entrance offset can't skew it.
      const labelEl = stepEls[0].closest('section')?.querySelector<HTMLElement>('h2')
      const labelGap = labelEl?.parentElement ? parseFloat(getComputedStyle(labelEl.parentElement).rowGap) || 0 : 0
      const stop = stepBoxes[0].y - (labelEl ? labelEl.offsetHeight + labelGap : 0) - LABEL_GAP
      const fin = boxOf(finalEl.querySelector(':scope > :not([data-flow-pulse])') ?? finalEl, wr)

      const grid = wide && problem.length === 4
      const cx = grid ? (problem[0].x + problem[0].w + problem[1].x) / 2 : 0
      const cy = grid ? (problem[0].y + problem[0].h + problem[2].y) / 2 : 0
      // Ring centred between the four cards, connector down to just above the label.
      ringEl.style.visibility = lineEl.style.visibility = wide ? 'visible' : 'hidden'
      ringEl.style.transform = `translate(${cx - 12}px, ${cy - 12}px)`
      lineEl.style.transform = `translate(${cx - 3}px, ${cy + 9}px)`
      lineEl.style.height = `${stop - (cy + 9)}px`

      if (!animate || !canvasEl || !ctx) return
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvasEl.width = Math.round((wr.width + BLEED * 2) * dpr)
      canvasEl.height = Math.round((wr.height + BLEED * 2) * dpr)
      color = toRgb(ctx, getComputedStyle(wrap).getPropertyValue('--color-primary').trim() || '#f04a00')
      ringPt = [cx, cy]

      // Problem cards: both ways round the border to the inner corner, then into the ring.
      cards = []
      if (grid) {
        problem.forEach((b, i) => {
          const radii = radiiOf(problemEls[i])
          const o = outline(b, radii)
          const [from, to] = CORNERS[i]
          const one = o.slice(o.pos[from], o.pos[to])
          const two = o.slice(o.pos[to], o.pos[from]).reverse()
          const edges = [polyline(one), polyline(two)]
          const border = Math.max(...edges.map((e) => e.len))
          const arrive = Math.max(...edges.map((e) => e.len + length([e.pts[e.pts.length - 1], ringPt])))
          cards.push({ el: problemEls[i], box: b, radii, from: one[0], to: one[one.length - 1], edges, border, arrive })
        })
      }
      sync = Math.max(0, ...cards.map((c) => c.arrive))

      // Step cards light up from top-centre to bottom-centre.
      steps = stepEls.map((el, i) => {
        const b = stepBoxes[i]
        return { el, box: b, radii: radiiOf(el), from: [b.x + b.w / 2, b.y], to: [b.x + b.w / 2, b.y + b.h] }
      })
      const top = (b: Box): Pt => [b.x + b.w / 2, b.y + 0.5]
      const bottom = (b: Box): Pt => [b.x + b.w / 2, b.y + b.h - 0.5]
      const next: Leg[] = [
        { problems: grid, path: grid ? polyline([ringPt, [cx, stop - 3]]) : undefined, step: 0, done: false },
        ...stepBoxes.slice(1).map((b, i) => ({ problems: false, path: polyline([bottom(stepBoxes[i]), top(b)]), step: i + 1, done: false })),
        { problems: false, path: polyline([bottom(stepBoxes[stepBoxes.length - 1]), [fin.x + fin.w / 2, fin.y]]), done: false },
      ]
      // Keep progress through a re-measure.
      next.forEach((leg, i) => {
        leg.start = legs[i]?.start
        leg.done = legs[i]?.done ?? false
      })
      legs = next
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
