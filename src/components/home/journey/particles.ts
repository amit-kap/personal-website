import gsap from 'gsap'
import { settle, type JourneyPhase } from '@/lib/journeyMotion'

const SPARK_EVERY = 5

type Frame = {
  point: { x: number; y: number; opacity: number }
  distance: number
  phase: JourneyPhase
  pressure: number
}

/* Travel stretch and the bounded spark pool share one writer for scale.
   Once settled, the ticker performs no SVG writes. */
export function startJourneyParticles(
  disc: SVGGElement,
  glow: HTMLElement,
  sparks: SVGCircleElement[],
  path: SVGPathElement,
  state: () => Frame,
) {
  type Spark = { el: SVGCircleElement; x: number; y: number; dx: number; dy: number; r: number; age: number; life: number }
  const live: Spark[] = []
  let nextSpark = 0
  let last = state().point
  let lastDistance = state().distance
  let lastPhase = state().phase
  let travelled = 0
  let motion = 0
  let wasActive = false
  const animateSparks = (_time: number, deltaMs: number) => {
    const { point: at, distance, phase, pressure: contactPressure } = state()
    if (document.hidden) return
    const moved = Math.hypot(at.x - last.x, at.y - last.y)
    const visible = at.opacity > 0.5 && last.opacity > 0.5
    // A fling or the hidden card handoff must not dump an entire lane's
    // worth of particles at one point. Sample the actual route between
    // frames so the trail follows bends, and keep the work bounded.
    const continuous = visible && moved < 100 && deltaMs < 100 && phase === lastPhase
    const previousRemainder = travelled
    travelled = continuous ? travelled + moved : 0
    const count = Math.min(sparks.length, Math.floor(travelled / SPARK_EVERY))
    for (let i = 0; i < count; i++) {
      const fraction = Math.min(1, (SPARK_EVERY - previousRemainder + i * SPARK_EVERY) / Math.max(1, moved))
      const { x, y } = phase === 'route'
        ? path.getPointAtLength(lastDistance + (distance - lastDistance) * fraction)
        : { x: last.x + (at.x - last.x) * fraction, y: last.y + (at.y - last.y) * fraction }
      const el = sparks[nextSpark++ % sparks.length]
      const old = live.findIndex((s) => s.el === el)
      if (old >= 0) live.splice(old, 1)
      live.push({
        el,
        x: x + gsap.utils.random(-2, 2),
        y: y + gsap.utils.random(-2, 2),
        dx: -(at.x - last.x) * 0.3 + gsap.utils.random(-9, 9),
        dy: -(at.y - last.y) * 0.3 + gsap.utils.random(-9, 9),
        r: gsap.utils.random(0.8, 2),
        age: 0,
        life: gsap.utils.random(350, 650),
      })
    }
    travelled %= SPARK_EVERY
    last = at
    lastDistance = distance
    lastPhase = phase
    for (let i = live.length - 1; i >= 0; i--) {
      const s = live[i]
      s.age += deltaMs
      const t = Math.min(1, s.age / s.life)
      s.el.setAttribute('cx', String(s.x + s.dx * t))
      s.el.setAttribute('cy', String(s.y + s.dy * t))
      s.el.setAttribute('r', String(s.r * (1 - t * 0.7)))
      s.el.setAttribute('opacity', String(0.85 * (1 - t) ** 1.5))
      if (t >= 1) {
        s.el.setAttribute('opacity', '0')
        live.splice(i, 1)
      }
    }
    const speed = continuous ? moved / Math.max(1, deltaMs) : 0
    motion = settle(motion, gsap.utils.clamp(0, 1, speed / 0.7), Math.min(deltaMs, 64), 85)
    if (motion < 0.001) motion = 0
    const pressure = phase === 'route' ? contactPressure : 0
    if (!moved && !live.length && !motion && !pressure && !wasActive) return
    wasActive = Boolean(moved || live.length || motion || pressure)
    gsap.set(disc, { scaleX: 1 + 0.28 * motion - 0.055 * pressure, scaleY: 1 - 0.1 * motion + 0.035 * pressure })
    gsap.set(glow, { scale: 1 + 0.18 * motion })
  }
  gsap.ticker.add(animateSparks)
  return () => {
    gsap.ticker.remove(animateSparks)
    sparks.forEach((spark) => spark.setAttribute('opacity', '0'))
  }
}
