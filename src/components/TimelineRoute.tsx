import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { RouteBuilder, dashPattern, inSpan, type Pt, type Span } from '@/lib/route'
import { addHolds, buildScrollMap, lengthAtScroll, lengthKey, type ScrollMap } from '@/lib/routeProgress'

/* The Work with me route: one continuous line from the origin node under the
   problem headline, round the rail of problems, through the label, across the
   three steps and down into the package. A disc rides it as the page scrolls
   and everything behind the disc lights up.
   The path is built from positions measured off [data-route] elements
   (origin, item, node, step, final, plus the "How I can help" label), so the
   layout in Problem.tsx and Solution.tsx drives it. Turns are 40px quarter
   circles, as in Paper. The path is continuous so the disc can travel it by
   distance, but parts of it are not drawn: it passes behind the label and
   through each step card (the disc is hidden there), and stops short of the
   connector dots. The lit trail is a second copy of the path, dashed to the
   disc's distance.
   Scroll maps to distance with a lookup table sampled off the real path
   (routeProgress), with a short hold on each problem and step so the disc
   rests there while it is read. Frames run only while the section is near the viewport,
   from passive scroll listeners throttled to animation frames; the disc moves
   by transform. Without motion (or without SVG path measuring) everything is
   lit, the trail is full and there is no disc. */
const TURN = 40 // radius of every turn
const DOT = 3 // connector dot radius
const DOT_GAP = 5 // undrawn rail beside a connector dot (dot radius plus the 2px gap)
const LABEL_GAP = 12 // undrawn rail above and below the "How I can help" label
const RAIL_RISE = 146 // wide: the rail's top turn is this far above the first problem
const RAIL_FALL = 88 // wide: its bottom turn is this far above the last problem's bottom edge
const ROW_RISE = 255 // the route turns toward the steps this far above the first card (midway from the label)
const EXIT_DROP = 312 // and leaves them this far below the last card (midway to the package)
const LINE = 0.55 // the viewport line the disc tracks, as a fraction of its height; each hold is centred on it
const HOLD = 260 // px of scroll the disc rests on each problem and step while it is read
const ROW_BEAT = 0.65 // the step holds' spacing across one row, in holds
const ROW_LEAD = 0.52 // and how far ahead of the row's middle they are centred, in holds
const SAMPLE_STEP = 4 // px between lookup samples
const LAND_EARLY = 160 // px of scroll before the page bottom at which the disc lands
const WIDE = '(min-width: 768px)'

type Mark = { x: number; y: number; at: number }
type Trigger = { el: Element; at: number }
type Layout = {
  sig: string
  d: string
  length: number
  visible: Span[]
  hops: Span[]
  origin: Pt
  nodes: Mark[]
  dots: Mark[]
  triggers: Trigger[]
}

type Box = { x: number; y: number; w: number; h: number }

/* Rects relative to the wrapper, minus any Reveal entrance offset: while a
   .reveal is still sliding in (translateY), its rect is shifted, and the route
   must be measured where the element will settle. */
function boxOf(el: Element, wrapperRect: DOMRect): Box {
  const rect = el.getBoundingClientRect()
  const entranceOffsetY = typeof DOMMatrix === 'function' ? new DOMMatrix(getComputedStyle(el.closest('.reveal') ?? el).transform).m42 : 0
  return { x: rect.left - wrapperRect.left, y: rect.top - wrapperRect.top - entranceOffsetY, w: rect.width, h: rect.height }
}

function measureRoute(wrapper: HTMLElement): Layout | null {
  const wrapperRect = wrapper.getBoundingClientRect()
  const all = (name: string) => [...wrapper.querySelectorAll(`[data-route="${name}"]`)]
  const originEl = all('origin')[0]
  const itemEls = all('item')
  const nodeEls = all('node')
  const stepEls = all('step')
  const finalEl = all('final')[0]
  const labelEl = all('label')[0]
  const bloomEl = all('bloom')[0]
  if (!originEl || !itemEls.length || itemEls.length !== nodeEls.length || !stepEls.length || !finalEl || !labelEl) return null

  const origin = boxOf(originEl, wrapperRect)
  const items = itemEls.map((el) => boxOf(el, wrapperRect))
  const nodeBoxes = nodeEls.map((el) => boxOf(el, wrapperRect))
  const steps = stepEls.map((el) => boxOf(el, wrapperRect))
  const label = boxOf(labelEl, wrapperRect)
  // The route ends on the solid circle (the final's first child).
  const final = boxOf(finalEl.firstElementChild ?? finalEl, wrapperRect)
  const wide = window.matchMedia?.(WIDE).matches ?? false

  const cx = origin.x + origin.w / 2
  const railX = nodeBoxes[0].x + nodeBoxes[0].w / 2
  const lastItem = items[items.length - 1]
  const railTop = items[0].y - (wide ? RAIL_RISE : TURN)
  const railBottom = wide ? lastItem.y + lastItem.h - RAIL_FALL : lastItem.y + lastItem.h + TURN

  const b = new RouteBuilder({ x: cx, y: origin.y + origin.h / 2 })
  // Out of the origin, left to the rail, down past the problems, back to the centre.
  b.line({ x: cx, y: railTop - TURN }).arc({ x: cx - TURN, y: railTop }, 1).line({ x: railX + TURN, y: railTop }).arc({ x: railX, y: railTop + TURN }, 0)
  const nodes = nodeBoxes.map((box) => ({ x: railX, y: box.y + box.h / 2, at: b.length + box.y + box.h / 2 - (railTop + TURN) }))
  b.line({ x: railX, y: railBottom - TURN }).arc({ x: railX + TURN, y: railBottom }, 0).line({ x: cx - TURN, y: railBottom }).arc({ x: cx, y: railBottom + TURN }, 1)
  // Behind the label.
  b.line({ x: cx, y: label.y - LABEL_GAP }).line({ x: cx, y: label.y + label.h + LABEL_GAP }, 'hop')

  const dots: Mark[] = []
  const triggers: Trigger[] = []
  const dot = (x: number, y: number, at: number) => dots.push({ x, y, at })
  const last = steps.length - 1
  const lastBox = steps[last]
  const midY = steps[0].y + steps[0].h / 2

  if (wide) {
    const rowY = steps[0].y - ROW_RISE
    const firstX = steps[0].x + steps[0].w / 2
    b.line({ x: cx, y: rowY - TURN }).arc({ x: cx - TURN, y: rowY }, 1).line({ x: firstX + TURN, y: rowY }).arc({ x: firstX, y: rowY + TURN }, 0).line({ x: firstX, y: steps[0].y })
    dot(firstX, steps[0].y, b.length)
    steps.forEach((box, i) => {
      triggers.push({ el: stepEls[i], at: b.length })
      if (i === last) {
        b.line({ x: box.x + box.w / 2, y: box.y + box.h }, 'hop')
        return
      }
      // Through the card to its right edge, then the dot-line-dot connector.
      b.line({ x: box.x + box.w, y: midY }, 'hop')
      const next = steps[i + 1]
      const start = b.length
      const gap = next.x - (box.x + box.w)
      dot(box.x + box.w + DOT, midY, start + DOT)
      dot(next.x - DOT, midY, start + gap - DOT)
      b.line({ x: box.x + box.w + DOT_GAP + DOT, y: midY }, 'gap').line({ x: next.x - DOT_GAP - DOT, y: midY }).line({ x: next.x, y: midY }, 'gap')
    })
    const lastX = lastBox.x + lastBox.w / 2
    const exitY = lastBox.y + lastBox.h + EXIT_DROP
    dot(lastX, lastBox.y + lastBox.h, b.length)
    b.line({ x: lastX, y: exitY - TURN }).arc({ x: lastX - TURN, y: exitY }, 1).line({ x: cx + TURN, y: exitY }).arc({ x: cx, y: exitY + TURN }, 0)
    b.line({ x: cx, y: Math.max(final.y, exitY + TURN) })
  } else {
    // Stacked: straight down the centre, through each card.
    b.line({ x: cx, y: steps[0].y })
    dot(cx, steps[0].y, b.length)
    steps.forEach((box, i) => {
      triggers.push({ el: stepEls[i], at: b.length })
      b.line({ x: cx, y: box.y + box.h }, 'hop')
      const start = b.length
      if (i === last) {
        dot(cx, box.y + box.h, start)
        return
      }
      const gap = steps[i + 1].y - (box.y + box.h)
      dot(cx, box.y + box.h + DOT, start + DOT)
      dot(cx, steps[i + 1].y - DOT, start + gap - DOT)
      b.line({ x: cx, y: box.y + box.h + DOT_GAP + DOT }, 'gap').line({ x: cx, y: steps[i + 1].y - DOT_GAP - DOT }).line({ x: cx, y: steps[i + 1].y }, 'gap')
    })
    b.line({ x: cx, y: Math.max(final.y, lastBox.y + lastBox.h) })
  }

  items.forEach((_, i) => triggers.push({ el: itemEls[i], at: nodes[i].at }))
  if (bloomEl) triggers.push({ el: bloomEl, at: b.length })
  const d = b.d()
  const sig = [d, JSON.stringify(nodes), JSON.stringify(dots), JSON.stringify(triggers.map((t) => t.at))].join('|')
  return { sig, d, length: b.length, visible: b.visible, hops: b.hops, origin: { x: cx, y: origin.y + origin.h / 2 }, nodes, dots, triggers }
}

/* Render inside the positioned wrapper around the problem and solution
   sections: it measures from its own parent. */
export default function TimelineRoute({ animate }: { animate: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const trailRef = useRef<SVGPathElement>(null)
  const discRef = useRef<HTMLDivElement>(null)
  // Redraws the route state for the current scroll position.
  const update = useRef<() => void>(() => {})
  const [layout, setLayout] = useState<Layout | null>(null)

  // Measure now, and again when anything measured resizes or the fonts load.
  useLayoutEffect(() => {
    const wrapper = rootRef.current?.parentElement
    if (!wrapper) return
    const measure = () => {
      const next = measureRoute(wrapper)
      setLayout((prev) => (prev && next && prev.sig === next.sig ? prev : next))
    }
    measure()
    let resizeObserver: ResizeObserver | undefined
    let queued = 0
    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(queued)
        queued = requestAnimationFrame(measure)
      })
      resizeObserver.observe(wrapper)
      wrapper.querySelectorAll('[data-route]').forEach((el) => resizeObserver!.observe(el))
    }
    document.fonts?.ready.then(measure)
    return () => {
      cancelAnimationFrame(queued)
      resizeObserver?.disconnect()
    }
  }, [])

  // Sample the drawn path into a scroll lookup, and light the route to the disc.
  useLayoutEffect(() => {
    const path = pathRef.current
    const trail = trailRef.current
    const root = rootRef.current
    if (!layout || !path || !trail || !root) return
    const measurable = typeof path.getTotalLength === 'function' && typeof path.getPointAtLength === 'function'
    let map: ScrollMap | undefined
    let tailFrom = 0
    if (measurable) {
      const total = path.getTotalLength()
      const samples = []
      for (let len = 0; len < total; len += SAMPLE_STEP) {
        const p = path.getPointAtLength(len)
        samples.push({ len, x: p.x, y: p.y })
      }
      const end = path.getPointAtLength(total)
      samples.push({ len: total, x: end.x, y: end.y })
      // Rest on each problem and step (everything lit on the way, not the package).
      const stops = layout.triggers.map((t) => t.at).filter((at) => at < layout.length - 0.5)
      // Each hold is centred on the stop's own height on the page, so it is
      // read at the viewport line however the sideways runs shift the map.
      // Steps in one row share a height, so their holds are spread ROW_BEAT
      // holds apart, a little ahead of the row's middle (ROW_LEAD), one beat
      // per step while the row is in the middle of the screen.
      const ys = stops.map((at) => path.getPointAtLength(at).y)
      const stepAts = layout.triggers.filter((t) => !layout.nodes.some((n) => n.at === t.at) && t.at < layout.length - 0.5).map((t) => t.at)
      const stepYs = stepAts.map((at) => path.getPointAtLength(at).y)
      const inRow = stepYs.length > 1 && Math.max(...stepYs) - Math.min(...stepYs) < HOLD
      const rowMid = stepYs.length ? (Math.min(...stepYs) + Math.max(...stepYs)) / 2 : 0
      const stopYs = stops.map((at, i) => {
        const step = stepAts.indexOf(at)
        return step >= 0 && inRow ? rowMid + (step - (stepAts.length - 1) / 2) * ROW_BEAT * HOLD - ROW_LEAD * HOLD : ys[i]
      })
      const base = buildScrollMap(samples)
      map = addHolds(base, stops, HOLD, stopYs)
      // The last run, Build to the package, starts after the last hold.
      tailFrom = Math.max(...stopYs, lengthKey(base, Math.max(...stops))) + HOLD / 2
    }
    const lights = [...root.querySelectorAll('[data-at]')].map((el) => ({ el, at: Number(el.getAttribute('data-at')) }))
    const targets = [...lights, ...layout.triggers]
    const still = !animate || !map || !measurable

    update.current = () => {
      let at = layout.length
      if (!still && map) {
        const top = root.getBoundingClientRect().top
        let y = LINE * window.innerHeight - top
        // Land a little before the page runs out of scroll (on a tall viewport
        // the end of the route may never reach the line at all): stretch only
        // the last run, Build to the package, so the disc is in the package
        // LAND_EARLY px before the bottom and everything above keeps its pace.
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight
        const land = LINE * window.innerHeight - (top + window.scrollY - maxScroll) - LAND_EARLY
        const end = map.keys[map.keys.length - 1]
        if (land < end && y > tailFrom && land > tailFrom) y = tailFrom + ((y - tailFrom) * (end - tailFrom)) / (land - tailFrom)
        at = lengthAtScroll(map, y)
      }
      trail.setAttribute('stroke-dasharray', dashPattern(layout.visible, layout.length, at))
      for (const { el, at: lit } of targets) el.toggleAttribute('data-lit', at >= lit - 0.5)
      const disc = discRef.current
      if (disc && !still) {
        const p = path.getPointAtLength(at)
        disc.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`
        // Hidden behind the label and inside the cards, and gone at the package.
        disc.toggleAttribute('data-show', at < layout.length - 0.5 && !inSpan(layout.hops, at))
      }
    }
    update.current()
  }, [layout, animate])

  // Follow the scroll while the section is near the viewport.
  useEffect(() => {
    const wrapper = rootRef.current?.parentElement
    if (!wrapper || !animate) return
    let frame = 0
    const schedule = () => {
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          update.current()
        })
      }
    }
    let listening = false
    const listen = (on: boolean) => {
      if (on === listening) return
      listening = on
      const toggle = on ? window.addEventListener : window.removeEventListener
      toggle.call(window, 'scroll', schedule, { passive: true })
      toggle.call(window, 'resize', schedule, { passive: true })
    }
    let observer: IntersectionObserver | undefined
    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        ([entry]) => {
          listen(entry.isIntersecting)
          // One last pass on the way out, so a fast scroll past leaves the right state.
          schedule()
        },
        { rootMargin: '200px 0px' },
      )
      observer.observe(wrapper)
    } else listen(true)
    return () => {
      cancelAnimationFrame(frame)
      listen(false)
      observer?.disconnect()
    }
  }, [animate])

  const rail = layout && dashPattern(layout.visible, layout.length)
  return (
    // Decorative: the route is for the eye only.
    <div ref={rootRef} aria-hidden="true" className="pointer-events-none absolute inset-0">
      {layout && (
        <svg className="absolute inset-0 size-full overflow-visible fill-none" strokeWidth="2">
          <path ref={pathRef} d={layout.d} className="stroke-border" strokeDasharray={rail ?? undefined} />
          <path ref={trailRef} d={layout.d} className="stroke-primary" strokeDasharray={rail ?? undefined} />
          {layout.nodes.map((n) => (
            <circle
              key={n.y}
              data-at={n.at}
              cx={n.x}
              cy={n.y}
              r="6"
              strokeWidth="1.5"
              className="fill-background stroke-muted-foreground transition-colors duration-300 data-lit:fill-primary data-lit:stroke-primary"
            />
          ))}
          {layout.dots.map((p, i) => (
            <circle key={i} data-at={p.at} cx={p.x} cy={p.y} r={DOT} className="fill-border stroke-none transition-colors duration-300 data-lit:fill-primary" />
          ))}
          {/* The origin. When animating, the disc itself starts here and leaves;
              without motion this ring stands in for it. */}
          {!animate && (
            <>
              <circle cx={layout.origin.x} cy={layout.origin.y} r="9" strokeWidth="1.5" className="fill-background stroke-primary" />
              <circle cx={layout.origin.x} cy={layout.origin.y} r="3" className="fill-primary stroke-none" />
            </>
          )}
        </svg>
      )}
      {animate && (
        <div ref={discRef} className="absolute top-0 left-0 size-0 opacity-0 transition-opacity duration-200 will-change-transform data-show:opacity-100">
          <span className="absolute -top-[30px] -left-[30px] size-[60px] rounded-pill bg-primary/35 blur-[24px]" />
          <svg className="absolute -top-3 -left-3 size-6" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" strokeWidth="1.5" className="fill-background stroke-primary" />
            <circle cx="12" cy="12" r="3" className="fill-primary" />
          </svg>
        </div>
      )}
    </div>
  )
}
