/* Work with me journey motion (Paper "note / v5 — how it plays"). The Problem
   and Solution sections sit on one stage that pins under the header. One
   GSAP timeline, scrubbed by ScrollTrigger, carries the disc (and its glow)
   from station to station, with a long rest at each:
   - along the route with MotionPathPlugin to each stop ring; on arrival the
     stop blips (300ms, Paper "detail / a — Gate blip") and the problem beside
     it lights; once the disc leaves, the stop stays filled with the primary;
   - the last stop is "How I can help": arriving there, on its own clock, the
     disc fades away, the Diagnose, Plan and Build cards come up one after
     another, each flashing a 10% primary background that fades out, and the
     disc reappears on the dot under them;
   - the last scroll drives the disc down the line into the package, which
     fills with the primary from its centre and then starts to turn.
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
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin)

const LINE = 0.55 // the stage line the disc rides on, as a fraction of its height
const TRAVEL = 0.8 // px of scroll per px the disc travels
const REST = 600 // px of scroll the disc rests on each station
const LIGHT = 80 // px of scroll a problem or a stop takes to light
const IGNITE = 260 // px of scroll the package takes to fill
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

      // How far along the route (0–1) each stop ring sits.
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
        return best / total
      })

      // Zero state: problems dim, cards hidden below, no line, the package
      // dark (a 2px ring in its black ring, muted icon, no glow) and still.
      gsap.set(stage, { height: stageHeight })
      gsap.set(root, { marginBottom: -extra })
      gsap.set(problems, { opacity: DIM })
      gsap.set(steps, { opacity: 0, y: 60 })
      gsap.set(dot, { opacity: 0 })
      gsap.set(toPackage, { drawSVG: '0%' })
      const pkgRing = (inset: number) => `0 0 0 6px ${background}, inset 0 0 0 ${inset}px ${border}`
      gsap.set(pkg, { backgroundColor: background, boxShadow: pkgRing(2), color: muted })
      gsap.set(pkgFill, { scale: 0 })
      gsap.set(disc, { transformOrigin: '50% 50%' })
      pkg.setAttribute('data-idle', '')

      // The content follows the disc's height.
      const setInner = gsap.quickSetter(inner, 'y', 'px')
      const discPoint = () => ({ x: 400 + Number(gsap.getProperty(disc, 'x')), y: 12 + Number(gsap.getProperty(disc, 'y')) })
      const follow = () => setInner(-offsetAt(discPoint().y))

      // While the disc moves it stretches along its way and sheds sparks that
      // drift, shrink and fade (after Paper "detail / c — Disc in motion").
      type Spark = { el: SVGCircleElement; x: number; y: number; dx: number; dy: number; r: number; age: number; life: number }
      const live: Spark[] = []
      let nextSpark = 0
      let last = discPoint()
      let travelled = 0
      let motion = 0
      const animateSparks = (_time: number, deltaMs: number) => {
        const at = discPoint()
        const moved = Math.hypot(at.x - last.x, at.y - last.y)
        const visible = Number(gsap.getProperty(disc, 'opacity')) > 0.5
        travelled += moved
        while (visible && travelled >= SPARK_EVERY) {
          travelled -= SPARK_EVERY
          const el = sparks[nextSpark++ % sparks.length]
          const old = live.findIndex((s) => s.el === el)
          if (old >= 0) live.splice(old, 1)
          live.push({
            el,
            x: at.x + gsap.utils.random(-3, 3),
            y: at.y + gsap.utils.random(-3, 3),
            dx: gsap.utils.random(-12, 12),
            dy: gsap.utils.random(-12, 12),
            r: gsap.utils.random(0.8, 2.4),
            age: 0,
            life: gsap.utils.random(450, 800),
          })
        }
        if (!visible) travelled = 0
        last = at
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
        motion += (gsap.utils.clamp(0, 1, moved / 8) - motion) * 0.2
        if (motion < 0.001) motion = 0
        gsap.set(disc, { scaleX: 1 + 0.35 * motion, scaleY: 1 - 0.1 * motion })
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

      // Arriving at "How I can help" plays on its own clock: the disc fades
      // away (its stop stays lit), the cards come up 1, 2, 3 like notes, each
      // rising in with a 10% primary flash that fades out, and then the disc
      // reappears on the dot under them, on the way to the package.
      const endStop = rings[rings.length - 1]
      const cardsIn = gsap.timeline({ paused: true })
      cardsIn.to([disc, glow], { opacity: 0, duration: 0.3 }, 0)
      cardsIn.to(endStop, { fill: primary, stroke: primary, duration: 0.3 }, 0)
      steps.forEach((step, i) => {
        const at = 0.3 + i * 0.22
        cardsIn.fromTo(step, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, at)
        cardsIn.fromTo(step, { backgroundColor: flash }, { backgroundColor: clear, duration: 0.9, ease: 'power1.in' }, at + 0.25)
      })
      cardsIn.set([disc, glow], { x: dotAt.x - 400, y: dotAt.y - 12 })
      cardsIn.to(dot, { opacity: 1, duration: 0.2 })
      cardsIn.to([disc, glow], { opacity: 1, duration: 0.4 }, '<')

      // The content offset is worked out after every render, from wherever the
      // disc ended up, so a jump (a reload, a fast fling) can't leave it stale.
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' }, onUpdate: follow })
      const station = (onArrive: () => void, onLeaveBack: () => void) =>
        tl.to({}, { duration: REST, onStart: onArrive, onReverseComplete: onLeaveBack })

      // 1. Along the route, stop by stop.
      let from = 0
      stops.forEach((to, i) => {
        const leave = tl.duration()
        const motionPath = { path, align: path, alignOrigin: [0.5, 0.5] as [number, number], start: from, end: to }
        const duration = (to - from) * total * TRAVEL
        tl.to(disc, { motionPath: { ...motionPath, autoRotate: true }, duration }, leave)
        tl.to(glow, { motionPath, duration }, leave)
        // The stop just left stays lit, filled with the primary.
        if (i > 0) tl.to(rings[i - 1], { fill: primary, stroke: primary, duration: LIGHT }, leave)
        const arrive = tl.duration()
        if (problems[i]) tl.to(problems[i], { opacity: 1, duration: LIGHT, ease: 'power1.out' }, arrive)
        const isLast = i === stops.length - 1
        station(
          () => {
            blipTimelines[i]?.restart()
            if (isLast) cardsIn.play()
          },
          () => {
            blipTimelines[i]?.pause(0)
            if (isLast) cardsIn.reverse()
          },
        )
        from = to
      })

      // 2. The last scroll drives the disc from the dot into the package,
      // drawing the line behind it, and lights the package; once it is full
      // it starts to turn.
      const run = pkgAt.y - dotAt.y
      const leaveDot = tl.duration()
      const runTime = run * TRAVEL * 2 // slower: this run is the last word
      // Scrolled on before the cards finished? Finish them now, so the disc
      // is on the dot for this run.
      const finishCards = () => {
        if (cardsIn.progress() < 1) cardsIn.progress(1)
      }
      tl.fromTo(
        [disc, glow],
        { y: dotAt.y - 12 },
        { y: pkgAt.y - 12, duration: runTime, onStart: finishCards, immediateRender: false },
        leaveDot,
      )
      tl.to(toPackage, { drawSVG: '100%', duration: runTime * 0.8 }, leaveDot)
      tl.to([disc, glow], { opacity: 0, duration: LIGHT }, '>')
      const igniteAt = tl.duration() - LIGHT
      tl.to(pkgFill, { scale: 1, duration: IGNITE, ease: 'power2.out' }, igniteAt)
      tl.to(pkg, { boxShadow: pkgRing(0), color: onPrimary, duration: IGNITE }, igniteAt)
      tl.to(pkgGlow, { opacity: 1, duration: IGNITE }, igniteAt)
      tl.to({}, {
        duration: REST,
        onStart: () => pkg.removeAttribute('data-idle'),
        onReverseComplete: () => pkg.setAttribute('data-idle', ''),
      })

      const trigger = ScrollTrigger.create({
        trigger: stage,
        start: `top ${header}px`,
        end: `+=${tl.duration()}`,
        pin: true,
        scrub: true,
        animation: tl,
      })

      return () => {
        trigger.kill()
        tl.kill()
        cardsIn.kill()
        blipTimelines.forEach((blip) => blip.kill())
        gsap.ticker.remove(animateSparks)
        sparks.forEach((spark) => spark.setAttribute('opacity', '0'))
        gsap.set([disc, glow, inner, ...steps, pkgFill], { clearProps: 'transform,transformOrigin' })
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
