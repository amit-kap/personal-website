/* Work with me journey motion (Paper "note / v5 — how it plays"). The Problem
   and Solution sections sit on one stage that pins under the header. A
   scroll timeline carries the disc (and its glow) along the route; a shared
   timed finale takes over at the solution, with a longer pause for the cards:
   - along the route to each stop ring; on arrival the
     stop blips (300ms, Paper "detail / a — Gate blip") and the problem beside
     it lights; once the disc leaves, the stop stays filled with the primary;
   - the last stop is "How I can help": arriving there, on its own clock, the
     disc fades away, the Diagnose, Plan and Build cards come up one after
     another, each flashing a 10% primary background that fades out, and the
     disc reappears on the dot under them;
   - the last swipe releases a glide into the package, which fills with the
     primary from its centre, starts to turn, then reveals the footer.
   While it moves the disc stretches along its way and sheds a stream of
   sparks. The stage's content moves up only as far as it must to keep the
   disc on a line just past the middle of the screen, so it stays still while
   the disc runs a lane; at the end the package sits fully in view, and the
   stage gives that extra room back so the footer follows right on. Desktop
   only; under reduced motion, or on phones, the stage is the plain static
   layout with everything lit. */
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { journeyEase, journeyFrame, magneticProgress, settle, type JourneyDock } from '@/lib/journeyMotion'
import { getLenis } from '@/lib/useSmoothScroll'

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin)

const LINE = 0.55 // the stage line the disc rides on, as a fraction of its height
const TRAVEL = 0.8 // px of scroll per px the disc travels
const REST = 320 // a reading beat without swallowing a whole trackpad gesture
const SOLUTION_REST = 1200 // give all three cards a longer reading pause
const PACKAGE_RUN = 240 // one short gesture carries the disc into the package
const LIGHT = 80 // px of scroll a problem or a stop takes to light
const IGNITE = 160 // the fill follows the final glide without another long drag
const DIM = 0.4 // the zero state's opacity (Paper "timeline / 1")
const SPARK_EVERY = 5 // px the disc travels per spark

export function JourneyMotion({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const query = '(min-width: 768px) and (prefers-reduced-motion: no-preference)'
    const setup = () => {
      const root = rootRef.current!
      const stage = stageRef.current!
      const inner = innerRef.current!
      const $ = <T extends Element>(name: string) => inner.querySelector<T>(`[data-journey="${name}"]`)
      const $$ = <T extends Element>(name: string) => [...inner.querySelectorAll<T>(`[data-journey="${name}"]`)]
      const path = $<SVGPathElement>('path')
      const box = $<HTMLElement>('box')
      const disc = $<SVGGElement>('disc')
      const glow = $<HTMLElement>('glow')
      const dot = $<SVGCircleElement>('dot')
      const toPackage = $<SVGPathElement>('line')
      const pkg = $<HTMLElement>('package')
      const pkgFill = $<HTMLElement>('package-fill')
      const pkgGlow = $<HTMLElement>('package-glow')
      if (!path || !box || !disc || !glow || !dot || !toPackage || !pkg || !pkgFill || !pkgGlow) return
      const problems = $$<HTMLElement>('problem')
      const steps = $$<HTMLElement>('step')
      const rings = $$<SVGCircleElement>('stop')
      const blips = $$<SVGGElement>('blip')
      const sparks = $$<SVGCircleElement>('spark')

      // Token colours as rgb() so GSAP can blend them.
      const probe = document.createElement('span')
      inner.append(probe)
      const color = (name: string, alpha = 1) => {
        probe.style.color = `var(${name})`
        const [r, g, b] = gsap.utils.splitColor(getComputedStyle(probe).color)
        return `rgba(${r}, ${g}, ${b}, ${alpha})`
      }
      const primary = color('--primary')
      const background = color('--background')
      const columnRing = color('--card', 0.9)
      const border = color('--border')
      const muted = color('--muted-foreground')
      const onPrimary = color('--primary-foreground')
      const flash = color('--primary', 0.1)
      const clear = color('--primary', 0)
      probe.remove()

      // Geometry, in the journey box's coordinates (the disc starts at 400, 12).
      const header = document.querySelector('header')?.offsetHeight ?? 0
      const stageHeight = window.innerHeight - header
      const boxRect = box.getBoundingClientRect()
      const boxTop = boxRect.top - inner.getBoundingClientRect().top
      const centreOf = (el: Element) => {
        const r = el.getBoundingClientRect()
        return { x: r.left + r.width / 2 - boxRect.left, y: r.top + r.height / 2 - boxRect.top }
      }
      const dotAt = centreOf(dot)
      const pkgAt = centreOf(pkg)
      // At the end the package sits fully in view, its bottom 15% above the
      // stage's; the stage hands that room back below so the footer follows on.
      const extra = pkg.offsetHeight / 2 + 6 + stageHeight * 0.15
      const maxOffset = Math.max(0, inner.offsetHeight - stageHeight + extra)
      const line = stageHeight * LINE
      const offsetAt = (y: number) => gsap.utils.clamp(0, maxOffset, boxTop + y - line)

      // Distance along the route at the centre of each stop ring.
      const total = path.getTotalLength()
      const stops = rings.map((ring) => {
        const x = Number(ring.getAttribute('cx'))
        const y = Number(ring.getAttribute('cy'))
        let best = 0
        let bestDistance = Infinity
        for (let at = 0; at <= total; at += 2) {
          const p = path.getPointAtLength(at)
          const distance = Math.abs(p.x - x) + Math.abs(p.y - y)
          if (distance < bestDistance) [best, bestDistance] = [at, distance]
        }
        // Include the exact endpoint, and refine the coarse search so the
        // disc settles in the centre of a ring rather than a pixel beside it.
        const refineEnd = Math.min(total, best + 2)
        for (let at = Math.max(0, best - 2); at <= refineEnd; at += 0.1) {
          const p = path.getPointAtLength(at)
          const distance = Math.hypot(p.x - x, p.y - y)
          if (distance < bestDistance) [best, bestDistance] = [at, distance]
        }
        const end = path.getPointAtLength(total)
        if (Math.hypot(end.x - x, end.y - y) < bestDistance) best = total
        return best
      })

      // Zero state: problems dim, cards hidden below, no line, the package
      // dark (a 2px ring in its black ring, muted icon, no glow) and still.
      gsap.set(stage, { height: stageHeight })
      gsap.set(root, { marginBottom: -extra })
      gsap.set(problems, { opacity: DIM })
      gsap.set(steps, { opacity: 0, y: 60 })
      gsap.set(dot, { opacity: 0 })
      gsap.set(toPackage, { drawSVG: '0%' })
      const pkgRing = (inset: number) => `0 0 0 6px ${columnRing}, inset 0 0 0 ${inset}px ${border}`
      gsap.set(pkg, { backgroundColor: background, boxShadow: pkgRing(2), color: muted })
      gsap.set(pkgFill, { scale: 0 })
      gsap.set(disc, { transformOrigin: '50% 50%' })
      pkg.setAttribute('data-idle', '')

      // Only renderFrame writes the disc position. The scroll timeline owns
      // route distance and the final run; the timed reveal owns its handoff.
      const route = { distance: 0 }
      const reveal = { handoff: 0, camera: 0, opacity: 1 }
      const tail = { progress: 0, opacity: 1 }
      let phase: 'route' | 'cards' | 'package' = 'route'
      let requestedPhase: 'route' | 'cards' | 'package' = 'route'
      const setInner = gsap.quickSetter(inner, 'y', 'px')
      let point = { x: 400, y: 12, opacity: 1 }
      const renderFrame = () => {
        const at = path.getPointAtLength(route.distance)
        const frame = journeyFrame(phase, at, dotAt, pkgAt, reveal, tail)
        const before = path.getPointAtLength(Math.max(0, route.distance - 0.5))
        const after = path.getPointAtLength(Math.min(total, route.distance + 0.5))
        const rotation = phase === 'route' ? Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI : 90
        gsap.set(disc, { x: frame.x - 400, y: frame.y - 12, rotation, opacity: frame.opacity })
        gsap.set(glow, { x: frame.x - 400, y: frame.y - 12, opacity: frame.opacity })
        setInner(-offsetAt(frame.cameraY))
        point = frame
      }

      // While the disc moves it stretches along its way and sheds sparks that
      // drift, shrink and fade (after Paper "detail / c — Disc in motion").
      type Spark = { el: SVGCircleElement; x: number; y: number; dx: number; dy: number; r: number; age: number; life: number }
      const live: Spark[] = []
      let nextSpark = 0
      let last = point
      let lastDistance = route.distance
      let lastPhase: 'route' | 'cards' | 'package' = phase
      let travelled = 0
      let motion = 0
      const animateSparks = (_time: number, deltaMs: number) => {
        const at = point
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
            ? path.getPointAtLength(lastDistance + (route.distance - lastDistance) * fraction)
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
        lastDistance = route.distance
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
        gsap.set(disc, { scaleX: 1 + 0.28 * motion, scaleY: 1 - 0.1 * motion })
        gsap.set(glow, { scale: 1 + 0.18 * motion })
      }
      gsap.ticker.add(animateSparks)

      // A stop's arrival blip, 300ms in, then it fades.
      const blipTimelines = blips.map((blip) =>
        gsap
          .timeline({ paused: true })
          .fromTo(blip, { opacity: 0 }, { opacity: 1, duration: 0.15 })
          .fromTo(blip.querySelector('[data-blip="core"]'), { attr: { r: 6 } }, { attr: { r: 8.5 }, duration: 0.3, ease: 'back.out(2)' }, 0)
          .fromTo(blip.querySelector('[data-blip="ring"]'), { attr: { r: 12 } }, { attr: { r: 24 }, duration: 0.3, ease: 'power2.out' }, 0)
          .to(blip, { opacity: 0, duration: 0.5, ease: 'power1.in' }, 0.3),
      )

      // A small, real-time emphasis when each problem first lights. It
      // completes even when scrolling pauses, without changing text layout.
      const problemPulses = problems.map((problem) => gsap.timeline({ paused: true })
        .to(problem, { scale: 1.045, duration: 0.22, ease: 'power2.out' })
        .to(problem, { scale: 1, duration: 0.42, ease: 'power2.inOut' }))

      // Arriving at "How I can help" plays on its own clock: the disc fades
      // away (its stop stays lit), the cards come up 1, 2, 3 like notes, each
      // rising in with a 10% primary flash that fades out, and then the disc
      // reappears on the dot under them, on the way to the package.
      const endStop = rings[rings.length - 1]
      const finale = gsap.timeline({ paused: true })
      finale.to(reveal, { opacity: 0, duration: 0.3 }, 0)
      finale.to(endStop, { fill: primary, stroke: primary, duration: 0.3 }, 0)
      steps.forEach((step, i) => {
        const at = 0.18 + i * 0.16
        finale.fromTo(step, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.85, ease: 'power2.out' }, at)
        finale.fromTo(step, { backgroundColor: flash }, { backgroundColor: clear, duration: 0.8, ease: 'sine.inOut' }, at + 0.18)
      })
      // Gently bring the cards into the reading area while they appear, even
      // if the visitor stops scrolling here. The hidden handoff stays hidden.
      finale.to(reveal, { camera: 1, duration: 1.55, ease: 'sine.inOut' }, 0.12)
      finale.set(reveal, { handoff: 1 }, 1.4)
      finale.to(dot, { opacity: 1, duration: 0.3 }, 1.4)
      finale.to(reveal, { opacity: 1, duration: 0.45 }, 1.4)
      const cardsReady = finale.duration()

      // The entire handoff shares one clock. A fast swipe changes its
      // destination, never seeks past an unfinished reveal.
      finale.to(tail, { progress: 1, duration: 1.05, ease: 'sine.inOut' }, cardsReady)
      finale.to(toPackage, { drawSVG: '100%', duration: 0.9, ease: 'sine.inOut' }, cardsReady)
      finale.to(tail, { opacity: 0, duration: 0.22, ease: 'sine.inOut' }, cardsReady + 0.82)
      const igniteAt = cardsReady + 0.82
      finale.to(pkgFill, { scale: 1, duration: 0.6, ease: 'power2.out' }, igniteAt)
      finale.to(pkg, { boxShadow: pkgRing(0), color: onPrimary, duration: 0.6 }, igniteAt)
      finale.to(pkgGlow, { opacity: 1, duration: 0.65, ease: 'sine.inOut' }, igniteAt)
      const finaleEnd = finale.duration()
      finale.eventCallback('onUpdate', () => {
        phase = requestedPhase === 'route' ? 'route' : finale.time() > cardsReady ? 'package' : 'cards'
        pkg.toggleAttribute('data-idle', finale.time() < finaleEnd - 0.001)
        renderFrame()
      })

      // The content offset is worked out after every render, from wherever the
      // disc ended up, so a jump (a reload, a fast fling) can't leave it stale.
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
      const station = (duration: number, onArrive: () => void, onLeaveBack: () => void) =>
        tl.to({}, { duration, onStart: onArrive, onReverseComplete: onLeaveBack })

      // 1. Along the route, stop by stop.
      let from = 0
      let cardsAt = 0
      const docks: JourneyDock[] = []
      stops.forEach((to, i) => {
        const leave = tl.duration()
        const duration = (to - from) * TRAVEL
        tl.to(route, { distance: to, duration, ease: journeyEase }, leave)
        // The stop just left stays lit, filled with the primary.
        if (i > 0) tl.to(rings[i - 1], { fill: primary, stroke: primary, duration: LIGHT }, leave)
        const arrive = tl.duration()
        if (problems[i]) tl.to(problems[i], {
          opacity: 1, duration: LIGHT, ease: 'power1.out',
          onStart: () => { problemPulses[i].restart() },
          onReverseComplete: () => { problemPulses[i].pause(0) },
        }, arrive)
        docks.push({ from, to, start: leave, arrival: arrive, settled: tl.duration() + 0.1 })
        const isLast = i === stops.length - 1
        if (isLast) cardsAt = tl.duration()
        station(
          isLast ? SOLUTION_REST : REST,
          () => {
            blipTimelines[i]?.restart()
          },
          () => {
            blipTimelines[i]?.pause(0)
          },
        )
        from = to
      })

      // 2. Crossing this threshold releases the final glide. Its own clock
      // carries it through ignition, even when the swipe has already ended.
      const leaveDot = tl.duration()
      tl.to({}, { duration: PACKAGE_RUN + IGNITE + 80 })
      let finaleTween: gsap.core.Tween | undefined
      let scrollTween: gsap.core.Tween | undefined
      let scrollOwned = false
      let footerRevealed = false
      let dockTimer = 0
      const scrollTo = (target: number, duration: number) => {
        scrollTween?.kill()
        scrollOwned = true
        const onComplete = () => { scrollOwned = false }
        const lenis = getLenis()
        if (lenis) lenis.scrollTo(target, { duration, easing: gsap.parseEase('power2.inOut'), onComplete })
        else {
          const position = { y: window.scrollY }
          scrollTween = gsap.to(position, { y: target, duration, ease: 'power2.inOut',
            onUpdate: () => window.scrollTo(0, position.y), onComplete })
        }
      }
      const showFooter = () => {
        if (requestedPhase !== 'package' || footerRevealed) return
        footerRevealed = true
        const bottom = document.documentElement.scrollHeight - window.innerHeight
        if (bottom - window.scrollY > 2) scrollTo(bottom, 1.45)
      }
      const driveFinale = (next: 'route' | 'cards' | 'package') => {
        finaleTween?.kill()
        const destination = next === 'route' ? 0 : next === 'cards' ? cardsReady : finaleEnd
        const distance = Math.abs(destination - finale.time())
        if (distance < 0.001) {
          if (next === 'package') showFooter()
          return
        }
        finaleTween = finale.tweenTo(destination, {
          duration: next === 'route' ? Math.min(0.8, distance) : distance,
          ease: 'none',
          onComplete: () => { if (next === 'package') showFooter() },
        })
      }
      tl.eventCallback('onUpdate', () => {
        const time = tl.time()
        const next = time < cardsAt ? 'route' : time < leaveDot ? 'cards' : 'package'
        if (next !== requestedPhase) {
          requestedPhase = next
          if (next !== 'package') footerRevealed = false
          driveFinale(next)
        }
        phase = next === 'route' ? 'route' : finale.time() > cardsReady ? 'package' : 'cards'
        renderFrame()
      })
      renderFrame()

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: `top ${header}px`,
        end: `+=${tl.duration()}`,
        pin: true,
        scrub: 0.2,
        animation: tl,
        onUpdate: (self) => {
          window.clearTimeout(dockTimer)
          if (scrollOwned || self.progress * tl.duration() >= cardsAt) return
          // Let trackpad momentum finish. Dock through Lenis too, so two
          // scroll engines cannot pull against each other.
          dockTimer = window.setTimeout(() => {
            if (scrollOwned) return
            const progress = magneticProgress(self.progress, tl.duration(), self.direction, docks)
            if (Math.abs(progress - self.progress) * (self.end - self.start) > 1) {
              scrollTo(self.start + progress * (self.end - self.start), 0.4)
            }
          }, 220)
        },
      })

      // User input always takes over from an automatic scroll, particularly
      // an upward gesture during the footer reveal. Never lock the trackpad.
      const releaseScroll = () => {
        window.clearTimeout(dockTimer)
        if (!scrollOwned) return
        scrollOwned = false
        scrollTween?.kill()
        const lenis = getLenis()
        if (lenis) lenis.scrollTo(window.scrollY, { immediate: true })
      }
      const releaseKey = (event: KeyboardEvent) => {
        if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) releaseScroll()
      }
      window.addEventListener('wheel', releaseScroll, { passive: true, capture: true })
      window.addEventListener('touchstart', releaseScroll, { passive: true })
      window.addEventListener('keydown', releaseKey)

      return () => {
        window.clearTimeout(dockTimer)
        window.removeEventListener('wheel', releaseScroll, true)
        window.removeEventListener('touchstart', releaseScroll)
        window.removeEventListener('keydown', releaseKey)
        releaseScroll()
        finaleTween?.kill()
        scrollTween?.kill()
        trigger.kill()
        tl.kill()
        finale.kill()
        blipTimelines.forEach((blip) => blip.kill())
        problemPulses.forEach((pulse) => pulse.kill())
        gsap.ticker.remove(animateSparks)
        sparks.forEach((spark) => spark.setAttribute('opacity', '0'))
        gsap.set([disc, glow, inner, ...problems, ...steps, pkgFill], { clearProps: 'transform,transformOrigin' })
        gsap.set([disc, glow, ...problems, ...steps, ...blips, dot, pkgGlow], { clearProps: 'opacity,backgroundColor' })
        gsap.set(rings, { clearProps: 'fill,stroke' })
        gsap.set(toPackage, { clearProps: 'all' })
        gsap.set(pkg, { clearProps: 'backgroundColor,boxShadow,color' })
        gsap.set([stage, root], { clearProps: 'height,marginBottom' })
        pkg.removeAttribute('data-idle')
      }
    }

    let mm = gsap.matchMedia()
    mm.add(query, setup)

    // Lengths depend on the window height, so rebuild after a resize settles.
    let timer = 0
    const onResize = () => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        mm.revert()
        mm = gsap.matchMedia()
        mm.add(query, setup)
      }, 200)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.clearTimeout(timer)
      mm.revert()
    }
  }, [])

  return (
    <div ref={rootRef}>
      <div ref={stageRef} className="relative">
        <div ref={innerRef} className="will-change-transform">
          {children}
        </div>
      </div>
    </div>
  )
}
