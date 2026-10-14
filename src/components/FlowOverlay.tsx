import { useLayoutEffect, useRef } from 'react'

/* Scroll-scrubbed "flow" along the problem and solution cards. One dash runs
   a single route at one speed: the problem cards' borders into the ring, down
   the connector, round each step card, down to the final circle. Geometry is
   measured from [data-flow] elements (problem, step, final), and the dashes
   are written straight to the DOM on scroll — no React render per frame. */
const DASH = 100
const STEPS = 8
/* Per problem card: outer corner, then the inner corner nearest the ring. */
const CORNERS = [['tl', 'br'], ['tr', 'bl'], ['bl', 'tr'], ['br', 'tl']]

type Pt = [number, number]
type Box = { x: number; y: number; w: number; h: number }
type Spec = { el: SVGPathElement; s: number; len: number; hold: boolean }

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
  const svg = useRef<SVGSVGElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const line = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const svgEl = svg.current
    const ringEl = ring.current
    const lineEl = line.current
    const wrap = ringEl?.parentElement
    if (!wrap || !ringEl || !lineEl) return

    let specs: Spec[] = []
    let total = 0
    let ringAt = 0
    let startY = 0
    let endY = 1
    let lastRing = false

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

    const apply = () => {
      const d = Math.min(1, Math.max(0, (window.scrollY - startY) / (endY - startY))) * total
      for (const { el, s, len, hold } of specs) {
        const t = hold ? Math.min(d - s, len) : d - s
        const a = Math.max(0, t - DASH)
        const b = Math.min(len, t)
        el.setAttribute('visibility', b - a > 0.5 ? 'visible' : 'hidden')
        el.setAttribute('stroke-dasharray', `${Math.max(b - a, 0)} ${len + DASH}`)
        el.setAttribute('stroke-dashoffset', `${-a}`)
      }
      const lit = specs.length > 0 && d >= ringAt && d <= ringAt + DASH
      if (lit !== lastRing) {
        lastRing = lit
        ringEl.style.borderColor = lit ? 'var(--color-primary)' : ''
      }
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
      const top0 = wr.top + window.scrollY

      const cx = wide && problem.length === 4 ? (problem[0].x + problem[0].w + problem[1].x) / 2 : 0
      const cy = wide && problem.length === 4 ? (problem[0].y + problem[0].h + problem[2].y) / 2 : 0
      // Ring centred between the four cards, connector down to Diagnose (+3px overlap).
      ringEl.style.visibility = lineEl.style.visibility = wide ? 'visible' : 'hidden'
      ringEl.style.transform = `translate(${cx - 12}px, ${cy - 12}px)`
      lineEl.style.transform = `translate(${cx - 3}px, ${cy + 9}px)`
      lineEl.style.height = `${steps[0].y + 3 - (cy + 9)}px`

      if (!animate || !svgEl) return
      const ringPt: Pt = [cx, cy]
      const route = (pts: Pt[], start: number, hold = false) => {
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        el.setAttribute('d', 'M' + pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join('L'))
        specs.push({ el, s: start, len: length(pts), hold })
        return length(pts)
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

      let cursor = wide ? maxLen : 0
      const add = (pts: Pt[], hold = false) => route(pts, cursor, hold)
      const outs = stepEls.map((el, i) => outline(steps[i], radiiOf(el)))
      if (wide) cursor += add([ringPt, [outs[0].x, outs[0].top]])
      outs.forEach((o, i) => {
        const half = add(o.slice(0, o.pos.bc))
        add(o.slice(o.pos.bc, o.total).reverse())
        cursor += half
        const next: Pt = i + 1 < outs.length ? [outs[i + 1].x, outs[i + 1].top] : [fin.x + fin.w / 2, fin.y]
        cursor += add([[o.x, o.bottom], next], i + 1 === outs.length)
      })
      total = cursor
      ringAt = maxLen
      svgEl.replaceChildren(...specs.map((s) => s.el))
      // Scrub from the first card entering the viewport to the final circle reaching 40% of it.
      const vh = window.innerHeight
      startY = top0 + (wide && problem.length === 4 ? problem[0].y : steps[0].y) - vh
      endY = Math.max(startY + 1, top0 + fin.y - vh * 0.4)
      apply()
    }

    let frame = 0
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), apply()))
    }
    measure()
    if (animate) window.addEventListener('scroll', onScroll, { passive: true })
    let observer: ResizeObserver | undefined
    if (typeof ResizeObserver === 'function') {
      observer = new ResizeObserver(measure)
      observer.observe(wrap)
      wrap.querySelectorAll('[data-flow]').forEach((el) => observer!.observe(el))
    }
    document.fonts?.ready.then(measure)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      observer?.disconnect()
    }
  }, [animate])

  return (
    <>
      <div ref={ring} aria-hidden="true" className="invisible absolute top-0 left-0 hidden size-6 rounded-pill border border-border md:block" />
      <div ref={line} aria-hidden="true" className="invisible absolute top-0 left-0 hidden w-1.5 md:block">
        <div className="flex h-full flex-col items-center gap-0.5">
          <span className="size-1.5 shrink-0 rounded-pill bg-border" />
          <span className="w-px flex-1 bg-border" />
          <span className="size-1.5 shrink-0 rounded-pill bg-border" />
        </div>
      </div>
      {animate && (
        <svg
          ref={svg}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full fill-none stroke-primary"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </>
  )
}
