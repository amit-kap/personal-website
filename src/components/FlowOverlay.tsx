import { useLayoutEffect, useRef } from 'react'
import { WHITE, toRgb, type Rgb } from '@/lib/flow/color'
import { DASH, drawDash } from '@/lib/flow/drawDash'
import { length, polyline, type Pt, type FlowLine } from '@/lib/flow/geometry'

/* The "flow" from the problem cards to the clients circle, drawn like a flow
   diagram. The problem cards are joined by curved connectors: from a dot at
   the middle of each card's inner side, a quarter circle bends down into one
   trunk between the columns, which stops just above the centred Proposed
   Solution label. On phones, where the cards stack, a straight centre line
   instead runs dot to dot down the gaps between them and on into the trunk,
   like the connectors between the step cards. A constant stream of short glowing dashes runs from each
   dot along its curve and down the trunk, and on down the connectors between
   the step cards to the clients circle.
   Each line carries a phase ("distance along the flow", which is simply y on
   the vertical lines), so dashes stay evenly spaced and in step where lines
   meet. Dashes are drawn on a canvas the same way as the hero pill's Star
   Border: the trail is cut into ~2px steps that fade in and whiten toward the
   head, under a faint wide glow stroke, with a soft bloom at the head.
   Geometry is measured from [data-flow] elements (problem, step, final), so
   the layout in Problem.tsx and Solution.tsx drives it; nothing is hard-coded.
   The static connector lines are an SVG; the dashes are a canvas, skipped
   entirely under reduced motion. */
const SPACING = 56 // px between dashes along a line
const SPEED = 60 // px per second
const BLEED = 48 // canvas overhang so the glow isn't clipped
const LABEL_GAP = 8 // px between the trunk and the solution label
const DOT = 3 // connector dot radius
const DOT_GAP = 2 // px between a dot and its line, as in the step connectors

type Box = { x: number; y: number; w: number; h: number }

/* Render inside the positioned wrapper around the problem and solution
   sections: it measures from its own parent, since a parent's ref is not yet
   attached when this layout effect runs. */
export default function FlowOverlay({ animate }: { animate: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const connectorsRef = useRef<SVGSVGElement>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    const connectorSvg = connectorsRef.current
    const wrapper = connectorSvg?.parentElement
    if (!wrapper || !connectorSvg) return

    let flowLines: FlowLine[] = []
    let color: Rgb = WHITE
    let dpr = 1
    let frame = 0
    let visible = false
    const startTime = performance.now()

    /* Rects relative to the wrapper, minus any Reveal entrance offset: while a
       .reveal is still sliding in (translateY), its rect is shifted, and the
       flow must be measured where the element will settle. */
    const boxOf = (el: Element, wrapperRect: DOMRect): Box => {
      const rect = el.getBoundingClientRect()
      const entranceOffsetY = typeof DOMMatrix === 'function' ? new DOMMatrix(getComputedStyle(el.closest('.reveal') ?? el).transform).m42 : 0
      return { x: rect.left - wrapperRect.left, y: rect.top - wrapperRect.top - entranceOffsetY, w: rect.width, h: rect.height }
    }

    const draw = (now = performance.now()) => {
      if (!ctx || !canvas) return
      // Clear in device pixels, then draw in CSS px offset by the bleed.
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.setTransform(dpr, 0, 0, dpr, BLEED * dpr, BLEED * dpr)
      ctx.globalCompositeOperation = 'lighter'
      ctx.lineCap = 'butt'
      const flowDistance = ((now - startTime) / 1000) * SPEED
      for (const line of flowLines) {
        // Heads sit wherever the phase is a whole number of SPACINGs behind flowDistance.
        const firstHead = (((flowDistance - line.phase) % SPACING) + SPACING) % SPACING
        for (let head = firstHead; head <= line.len + DASH; head += SPACING) drawDash(ctx, line, head, color)
      }
    }
    const loop = (now: number) => {
      draw(now)
      frame = visible ? requestAnimationFrame(loop) : 0
    }

    const measure = () => {
      const wrapperRect = wrapper.getBoundingClientRect()
      // The two-column problem grid (and so the curved connectors) is md and up.
      const wide = window.matchMedia('(min-width: 768px)').matches
      const problemBoxes = [...wrapper.querySelectorAll('[data-flow="problem"]')].map((el) => boxOf(el, wrapperRect))
      const stepEls = [...wrapper.querySelectorAll('[data-flow="step"]')]
      const finalEl = wrapper.querySelector('[data-flow="final"]')
      if (!stepEls.length || !finalEl) return
      const stepBoxes = stepEls.map((el) => boxOf(el, wrapperRect))
      // The dash ends on the solid circle (the first child), inside its padding.
      const circleBox = boxOf(finalEl.firstElementChild ?? finalEl, wrapperRect)
      // The trunk ends LABEL_GAP above the solution label. The label sits a
      // column gap above the step list; measured from layout, not its rect,
      // so its own entrance offset can't skew it.
      const labelEl = stepEls[0].closest('section')?.querySelector<HTMLElement>('h2')
      const labelGap = labelEl?.parentElement ? parseFloat(getComputedStyle(labelEl.parentElement).rowGap) || 0 : 0
      const trunkStop = stepBoxes[0].y - (labelEl ? labelEl.offsetHeight + labelGap : 0) - LABEL_GAP

      const twoColumns = wide && problemBoxes.length === 4
      const stacked = !twoColumns && problemBoxes.length > 0
      // The trunk runs down the gutter between the columns, or, stacked, down the step cards' centre.
      const trunkX = twoColumns ? (problemBoxes[0].x + problemBoxes[0].w + problemBoxes[1].x) / 2 : stepBoxes[0].x + stepBoxes[0].w / 2

      // The connectors: a dot on the middle of each card's inner side, then a
      // quarter circle from DOT_GAP past it bending down into the trunk.
      const connectors = problemBoxes.map((box, i) => {
        const fromLeft = i % 2 === 0
        // Half a pixel inside the card's border so the dot sits on the 1px line.
        const edgeX = fromLeft ? box.x + box.w - 0.5 : box.x + 0.5
        const dotY = box.y + box.h / 2
        const curveStartX = edgeX + (fromLeft ? 1 : -1) * (DOT + DOT_GAP)
        const radius = Math.abs(trunkX - curveStartX)
        return { fromLeft, edgeX, dotY, curveStartX, radius, curveEndY: dotY + radius }
      })
      // The trunk starts where the highest curve meets it.
      const trunkTop = Math.min(...connectors.map((c) => c.curveEndY))
      // The line stops a dot's diameter plus DOT_GAP short of the trunk's end dot.
      const trunkLineEnd = trunkStop - DOT * 2 - DOT_GAP
      // Stacked: the centre line's dots sit on each card's bottom and top border.
      const stackedRuns = stacked
        ? problemBoxes.map((box, i) => ({
            top: box.y + box.h - 0.5,
            bottom: i + 1 < problemBoxes.length ? problemBoxes[i + 1].y + 0.5 : trunkStop - DOT,
          }))
        : []
      const dot = (y: number) => `<circle cx="${trunkX}" cy="${y}" r="${DOT}" class="fill-border stroke-none" />`
      connectorSvg.innerHTML = stacked
        ? stackedRuns
            .map((run) => dot(run.top) + `<path d="M${trunkX} ${run.top + DOT + DOT_GAP} V${run.bottom - DOT - DOT_GAP}" />` + dot(run.bottom))
            .join('')
        : twoColumns
        ? [
            ...connectors.map(
              (c) =>
                `<circle cx="${c.edgeX}" cy="${c.dotY}" r="${DOT}" class="fill-border stroke-none" />` +
                `<path d="M${c.curveStartX} ${c.dotY} A${c.radius} ${c.radius} 0 0 ${c.fromLeft ? 1 : 0} ${trunkX} ${c.curveEndY}" />`,
            ),
            `<path d="M${trunkX} ${trunkTop} V${trunkLineEnd}" />`,
            `<circle cx="${trunkX}" cy="${trunkStop - DOT}" r="${DOT}" class="fill-border stroke-none" />`,
          ].join('')
        : ''

      if (!animate || !canvas || !ctx) return
      // Backing store in device pixels (capped at 2x), covering the wrapper plus the bleed on every side.
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round((wrapperRect.width + BLEED * 2) * dpr)
      canvas.height = Math.round((wrapperRect.height + BLEED * 2) * dpr)
      color = toRgb(ctx, getComputedStyle(wrapper).getPropertyValue('--color-primary').trim() || '#f04a00')

      // On the vertical lines the phase is y; each curve's phase counts back
      // from where it meets the trunk.
      const vertical = (from: number, to: number) => polyline([[trunkX, from], [trunkX, to]], from)
      flowLines = []
      if (twoColumns) {
        for (const c of connectors) {
          // The quarter circle sampled in 16 chords, from straight below its centre round to the trunk.
          const curve: Pt[] = Array.from({ length: 17 }, (_, k) => {
            const angle = -Math.PI / 2 + ((c.fromLeft ? 1 : -1) * (k * Math.PI)) / 2 / 16
            return [c.curveStartX + c.radius * Math.cos(angle), c.dotY + c.radius + c.radius * Math.sin(angle)]
          })
          const pts: Pt[] = [[c.edgeX, c.dotY], ...curve]
          flowLines.push(polyline(pts, c.curveEndY - length(pts)))
        }
        flowLines.push(vertical(trunkTop, trunkStop - DOT))
      }
      for (const run of stackedRuns) flowLines.push(vertical(run.top, run.bottom))
      // Down the connectors between the step cards, and to the circle.
      stepBoxes.forEach((box, i) => {
        const nextTop = i + 1 < stepBoxes.length ? stepBoxes[i + 1].y + 0.5 : circleBox.y
        flowLines.push(vertical(box.y + box.h - 0.5, nextTop))
      })
      draw()
    }

    measure()
    // Only run frames while the flow is on screen.
    const visibilityObserver =
      animate && typeof IntersectionObserver === 'function'
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            if (visible && !frame) frame = requestAnimationFrame(loop)
          })
        : undefined
    visibilityObserver?.observe(wrapper)
    // Re-measure when the wrapper or any measured card changes size, and once webfonts have loaded.
    let resizeObserver: ResizeObserver | undefined
    if (typeof ResizeObserver === 'function') {
      resizeObserver = new ResizeObserver(measure)
      resizeObserver.observe(wrapper)
      wrapper.querySelectorAll('[data-flow]').forEach((el) => resizeObserver!.observe(el))
    }
    document.fonts?.ready.then(measure)
    return () => {
      cancelAnimationFrame(frame)
      visibilityObserver?.disconnect()
      resizeObserver?.disconnect()
    }
  }, [animate])

  return (
    <>
      {/* Decorative: the connector lines are for the eye only. */}
      <svg ref={connectorsRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full overflow-visible fill-none stroke-border" />
      {animate && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          // -48px / +96px is the BLEED, so the glow past the wrapper edge isn't clipped.
          className="pointer-events-none absolute top-[-48px] left-[-48px] z-20 h-[calc(100%+96px)] w-[calc(100%+96px)]"
        />
      )}
    </>
  )
}
