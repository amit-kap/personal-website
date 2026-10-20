import { useEffect, useRef } from 'react'

/* Dot field. Dot radius follows travelling sine waves, so the grid swells and
   shrinks in bands; the pointer adds a ripple. Dots go from pinpricks to
   near-touching discs at full opacity.

   Two modes: fixed to the viewport (the page backdrop), or `contained`, which
   fills its positioned parent and follows its size (the footer band).
   Colours are CSS custom properties, cached until the colour or theme changes
   so the draw loop never needs a style read. */

/* Smallest dot radius in px: the pinprick at a wave trough. */
const MIN_RADIUS = 0.6

type Props = {
  /* CSS colour or `var(--token)`. */
  color?: string
  speed?: number
  gap?: number
  maxRadius?: number
  contained?: boolean
  className?: string
}

/* maxRadius 5 = 10px across at a wave crest. `live` holds the latest props so
   the draw loop reads them without restarting. */
export default function DotWaves({
  color = 'var(--primary)',
  speed = 1,
  gap = 18,
  maxRadius = 5,
  contained = false,
  className = '',
}: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const live = useRef({ color, speed, gap, maxRadius })
  const relayout = useRef<(() => void) | null>(null)
  const recolor = useRef<(() => void) | null>(null)

  useEffect(() => {
    const gapChanged = live.current.gap !== gap
    const colorChanged = live.current.color !== color
    live.current = { color, speed, gap, maxRadius }
    if (colorChanged) recolor.current?.()
    if (gapChanged) relayout.current?.()
  }, [color, speed, gap, maxRadius])

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let cols = 0
    let rows = 0
    let raf = 0
    let onScreen = true
    let fill = ''
    const pointer = { x: -1, y: -1 }

    const size = () =>
      contained && canvas.parentElement
        ? { w: canvas.parentElement.clientWidth, h: canvas.parentElement.clientHeight }
        : { w: window.innerWidth, h: window.innerHeight }

    /* Canvas fillStyle cannot resolve CSS custom properties. Resolve only
       when invalidated, away from the frame loop. */
    const resolveColor = () => {
      const probe = canvas.style
      probe.color = live.current.color
      fill = getComputedStyle(canvas).color
      probe.color = ''
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { w, h } = size()
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      cols = Math.ceil(w / live.current.gap) + 1
      rows = Math.ceil(h / live.current.gap) + 1
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (ms: number) => {
      const { speed: waveSpeed, gap: cell, maxRadius: crestRadius } = live.current
      const time = (ms / 1000) * waveSpeed
      ctx.clearRect(0, 0, cols * cell, rows * cell)
      ctx.fillStyle = fill
      ctx.beginPath()
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          // Three overlapping travelling waves, summed; x and y are grid cells, not px.
          let wave =
            Math.sin(x * 0.11 + time * 0.9 + Math.sin(y * 0.08 + time * 0.4) * 1.8) +
            Math.sin(y * 0.18 - time * 0.7 + x * 0.04) * 0.8 +
            Math.sin((x + y) * 0.06 + time * 0.5) * 0.6
          // The pointer adds a ripple that fades out over 240px.
          if (pointer.x >= 0) {
            const distance = Math.hypot(x * cell - pointer.x, y * cell - pointer.y)
            wave += Math.max(0, 1 - distance / 240) * 1.6 * Math.sin(distance * 0.05 - time * 3)
          }
          // The waves sum to about -2.4..2.4; normalise to 0..1.
          const level = Math.min(1, Math.max(0, (wave + 2.4) / 4.8))
          // Sharpen the curve so most dots stay tiny and crests pop.
          const radius = MIN_RADIUS + level * level * level * (crestRadius - MIN_RADIUS)
          ctx.moveTo(x * cell + radius, y * cell)
          ctx.arc(x * cell, y * cell, radius, 0, Math.PI * 2)
        }
      }
      ctx.fill()
    }

    const loop = (ms: number) => {
      draw(ms)
      raf = requestAnimationFrame(loop)
    }
    /* Runs only while visible: on-screen, tab shown, motion allowed. A
       reduced-motion visitor gets one static frame. */
    const start = () => {
      cancelAnimationFrame(raf)
      raf = 0
      if (!onScreen || document.hidden) return
      if (reduced.matches) draw(2000)
      else raf = requestAnimationFrame(loop)
    }
    const onMove = (event: PointerEvent) => {
      if (!onScreen || document.hidden || reduced.matches) return
      const rect = canvas.getBoundingClientRect()
      pointer.x = event.clientX - rect.left
      pointer.y = event.clientY - rect.top
    }
    const onLeave = () => {
      pointer.x = pointer.y = -1
    }
    const onResize = () => {
      resize()
      start()
    }
    const onVisibility = () => start()
    const onColorChange = () => {
      resolveColor()
      if (reduced.matches && onScreen && !document.hidden) draw(2000)
    }

    relayout.current = onResize
    recolor.current = onColorChange
    resolveColor()
    resize()
    start()

    // Theme tokens may be scoped to a parent, the body, or the document root.
    // Observe ancestors only: our own canvas style writes do not invalidate it.
    const themeObserver = new MutationObserver(onColorChange)
    for (let parent = canvas.parentElement; parent; parent = parent.parentElement) {
      themeObserver.observe(parent, {
        attributes: true,
        attributeFilter: ['class', 'style', 'data-theme'],
      })
    }
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)')
    colorScheme.addEventListener('change', onColorChange)
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      start()
    })
    visibilityObserver.observe(canvas)
    // Contained fields follow their parent's size; the fixed page field follows the window.
    let resizeObserver: ResizeObserver | undefined
    if (contained && canvas.parentElement) {
      resizeObserver = new ResizeObserver(onResize)
      resizeObserver.observe(canvas.parentElement)
    } else {
      window.addEventListener('resize', onResize)
    }
    window.addEventListener('pointermove', onMove)
    document.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    reduced.addEventListener('change', start)
    return () => {
      relayout.current = null
      recolor.current = null
      cancelAnimationFrame(raf)
      themeObserver.disconnect()
      visibilityObserver.disconnect()
      resizeObserver?.disconnect()
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      reduced.removeEventListener('change', start)
      colorScheme.removeEventListener('change', onColorChange)
    }
  }, [contained])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none inset-0 ${contained ? 'absolute' : 'fixed'} ${className}`}
    />
  )
}
