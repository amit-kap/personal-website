import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cameraOffset, dockingEase, journeyEase, journeyFrame, journeyPhase, magneticProgress, JOURNEY_MEDIA_QUERY, type JourneyDock, type JourneyPhase } from '@/lib/journeyMotion'
import { getLenis } from '@/lib/useSmoothScroll'
import { measureJourneyPath } from './path'
import { startJourneyParticles } from './particles'

gsap.registerPlugin(ScrollTrigger)

const LINE = 0.55 // the stage line the disc rides on, as a fraction of its height
const TRAVEL = 0.8 // px of scroll per px the disc travels
const REST = 320 // a reading beat without swallowing a whole trackpad gesture
const SOLUTION_REST = 1200 // give all three cards a longer reading pause
const PACKAGE_RUN = 240 // one short gesture carries the disc into the package
const LIGHT = 80 // px of scroll a problem or a stop takes to light
const IGNITE = 160 // the fill follows the final glide without another long drag
const DIM = 0.4 // the zero state's opacity (Paper "timeline / 1")
const WAVE_NOTE = 0.3 // s between one card's flash and the next
const WAVE_REST = 0.8 // s of quiet before the 1, 2, 3 repeats
const WAVE_LEAVE = 40 // px of scroll on from the cards that ends the wave

/* Desktop enhancement. The static page remains the baseline on phones and
   under reduced motion; the React wrapper loads this module only when needed. */
export function createJourneyMotion(root: HTMLElement, stage: HTMLElement, inner: HTMLElement) {
  const query = JOURNEY_MEDIA_QUERY
  const setup = () => {
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
    const offsetAt = (y: number) => cameraOffset(boxTop + y - line, maxOffset)

    const { total, stops } = measureJourneyPath(path, rings)

    // Zero state: problems dim, cards hidden below, no line, the package
    // dark (a 2px ring in its black ring, muted icon, no glow) and still.
    gsap.set(stage, { height: stageHeight })
    gsap.set(inner, { willChange: 'transform' })
    gsap.set(root, { marginBottom: -extra })
    gsap.set(problems, { opacity: DIM })
    gsap.set(steps, { opacity: 0, y: 60 })
    gsap.set(dot, { opacity: 0 })
    gsap.set(toPackage, { strokeDasharray: toPackage.getTotalLength(), strokeDashoffset: toPackage.getTotalLength() })
    const pkgRing = (inset: number) => `0 0 0 6px ${columnRing}, inset 0 0 0 ${inset}px ${border}`
    gsap.set(pkg, { backgroundColor: background, boxShadow: pkgRing(2), color: muted, scale: 1, transformOrigin: '50% 50%' })
    gsap.set(pkgFill, { scale: 0 })
    gsap.set(disc, { transformOrigin: '50% 50%' })
    pkg.setAttribute('data-idle', '')

    // Only renderFrame writes the disc position. The scroll timeline owns
    // route distance and the final run; the timed reveal owns its handoff.
    const route = { distance: 0 }
    const reveal = { handoff: 0, camera: 0, opacity: 1 }
    const tail = { progress: 0, opacity: 1 }
    let phase: JourneyPhase = 'route'
    let requestedPhase: JourneyPhase = 'route'
    const contact = { pressure: 0 }
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

    const stopParticles = startJourneyParticles(disc, glow, sparks, path, () => ({
      point, distance: route.distance, phase, pressure: contact.pressure,
    }))

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
    // Contact shares the light-up beat. The ticker combines this small
    // compression with travel stretch, so two tweens never fight for scale.
    const contactPulse = gsap.timeline({ paused: true })
      .to(contact, { pressure: 1, duration: 0.12, ease: 'power2.out' })
      .to(contact, { pressure: 0, duration: 0.36, ease: 'sine.out' })
    const arriveAt = (index: number) => {
      contactPulse.restart()
      blipTimelines[index]?.restart()
      problemPulses[index]?.restart()
    }

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
    finale.to(toPackage, { strokeDashoffset: 0, duration: 0.9, ease: 'sine.inOut' }, cardsReady)
    finale.to(tail, { opacity: 0, duration: 0.22, ease: 'sine.inOut' }, cardsReady + 0.82)
    const igniteAt = cardsReady + 0.82
    finale.to(pkgFill, { scale: 1, duration: 0.6, ease: 'power2.out' }, igniteAt)
    finale.to(pkg, { boxShadow: pkgRing(0), color: onPrimary, duration: 0.6 }, igniteAt)
    finale.to(pkg, { scale: 1.025, duration: 0.18, ease: 'power2.out' }, igniteAt)
    finale.to(pkg, { scale: 1, duration: 0.46, ease: 'sine.out' }, igniteAt + 0.18)
    finale.to(pkgGlow, { opacity: 1, duration: 0.65, ease: 'sine.inOut' }, igniteAt)
    const packageArrival = cardsReady + 1.05
    const finaleEnd = finale.duration()

    // While the visitor rests on the cards, the flash keeps playing across
    // them 1, 2, 3 (do, re, mi) and repeats. Scrolling on fades it out.
    const wave = gsap.timeline({ paused: true, repeat: -1, repeatDelay: WAVE_REST })
    steps.forEach((step, i) => {
      wave.fromTo(step, { backgroundColor: clear }, { backgroundColor: flash, duration: 0.35, ease: 'sine.out' }, i * WAVE_NOTE)
      wave.to(step, { backgroundColor: clear, duration: 0.7, ease: 'sine.inOut' }, i * WAVE_NOTE + 0.35)
    })
    // It starts wherever the scroll settled on the cards, and once scrolling
    // moves on it stays off until the visitor leaves the cards and returns.
    let waveFrom: number | null = null
    let waveSpent = false
    const stopWave = () => {
      if (waveFrom === null) return
      waveFrom = null
      wave.pause()
      gsap.to(steps, { backgroundColor: clear, duration: 0.3, ease: 'sine.out' })
    }
    const syncWave = () => {
      if (requestedPhase !== 'cards' || finale.time() < cardsReady - 0.001) {
        waveSpent = false
        stopWave()
      } else if (waveFrom === null && !waveSpent) {
        waveFrom = tl.time()
        wave.restart()
      } else if (waveFrom !== null && Math.abs(tl.time() - waveFrom) > WAVE_LEAVE) {
        waveSpent = true
        stopWave()
      }
    }

    finale.eventCallback('onUpdate', () => {
      syncWave()
      phase = journeyPhase(requestedPhase, finale.time(), cardsReady)
      pkg.toggleAttribute('data-idle', finale.time() < packageArrival)
      renderFrame()
      // Start the view's gentle departure as the glow is still settling.
      // showFooter latches before scrolling and ignores reverse playback.
      if (finale.time() >= packageArrival) showFooter()
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
        onStart: () => { arriveAt(i) },
        onReverseComplete: () => { problemPulses[i].pause(0) },
      }, arrive)
      docks.push({ from, to, start: leave, arrival: arrive, settled: tl.duration() + 0.1 })
      const isLast = i === stops.length - 1
      if (isLast) cardsAt = tl.duration()
      station(
        isLast ? SOLUTION_REST : REST,
        () => {
          if (isLast) arriveAt(i)
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
    let lastInputAt = -Infinity
    const scrollTo = (target: number, duration: number, easing = gsap.parseEase('power2.inOut')) => {
      scrollTween?.kill()
      scrollOwned = true
      const onComplete = () => { scrollOwned = false }
      const lenis = getLenis()
      if (lenis) lenis.scrollTo(target, { duration, easing, onComplete })
      else {
        const position = { y: window.scrollY }
        scrollTween = gsap.to(position, { y: target, duration, ease: easing,
          onUpdate: () => window.scrollTo(0, position.y), onComplete })
      }
    }
    const showFooter = () => {
      if (requestedPhase !== 'package' || footerRevealed) return
      footerRevealed = true
      const bottom = document.documentElement.scrollHeight - window.innerHeight
      if (bottom - window.scrollY > 2) scrollTo(bottom, 1.45)
    }
    const driveFinale = (next: JourneyPhase) => {
      finaleTween?.kill()
      const destination = next === 'route' ? 0 : next === 'cards' ? cardsReady : finaleEnd
      const distance = Math.abs(destination - finale.time())
      if (distance < 0.001) {
        if (next === 'package') showFooter()
        return
      }
      finaleTween = finale.tweenTo(destination, {
        duration: next === 'route' ? Math.min(1.2, distance) : distance,
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
      syncWave()
      phase = journeyPhase(requestedPhase, finale.time(), cardsReady)
      renderFrame()
    })
    renderFrame()

    const trigger = ScrollTrigger.create({
      trigger: stage,
      start: `top ${header}px`,
      end: `+=${tl.duration()}`,
      pin: true,
      // Lenis already smooths the input. A second scrub tween adds a
      // delayed stop/start to every small trackpad gesture.
      scrub: true,
      animation: tl,
    })

    // Catch the last of the incoming momentum instead of waiting for a
    // complete stop. Sample in px/second so 60Hz and 120Hz feel alike.
    let lastScroll = getLenis()?.animatedScroll ?? window.scrollY
    let previousSpeed = 0
    const dockOnSettle = (_time: number, deltaMs: number) => {
      const lenis = getLenis()
      const scroll = lenis?.animatedScroll ?? window.scrollY
      const velocity = (scroll - lastScroll) * 1000 / Math.max(1, deltaMs)
      const speed = Math.abs(velocity)
      const slowing = speed <= previousSpeed + 5
      previousSpeed = speed
      lastScroll = scroll
      if (scrollOwned || lenis?.isStopped || !trigger.isActive || phase !== 'route' || trigger.progress * tl.duration() >= cardsAt) return
      if (performance.now() - lastInputAt < 70 || speed > 140 || !slowing) return
      const progress = magneticProgress(trigger.progress, tl.duration(), trigger.direction, docks)
      const target = trigger.start + progress * (trigger.end - trigger.start)
      const distance = Math.abs(target - scroll)
      if (distance <= 1) return
      // A gesture that already aims beyond this station keeps its momentum.
      if (lenis && (lenis.targetScroll - target) * trigger.direction > 1) return
      const duration = gsap.utils.clamp(0.24, 0.38, 0.22 + distance * 0.001)
      scrollTo(target, duration, dockingEase(speed, distance, duration))
    }
    gsap.ticker.add(dockOnSettle)

    // User input always takes over from an automatic scroll, particularly
    // an upward gesture during the footer reveal. Never lock the trackpad.
    const releaseScroll = () => {
      lastInputAt = performance.now()
      if (!scrollOwned) return
      scrollOwned = false
      scrollTween?.kill()
      const lenis = getLenis()
      // scrollTo(current, { immediate: true }) can return early when its
      // target already matches. Reset the active tween even before frame 1.
      if (lenis && !lenis.isStopped) {
        lenis.stop()
        lenis.start()
      }
    }
    const releaseWheel = (event: WheelEvent) => {
      if (event.deltaY < 0 && requestedPhase === 'package') footerRevealed = true
      releaseScroll()
    }
    const releaseKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'PageUp', 'Home'].includes(event.key) && requestedPhase === 'package') footerRevealed = true
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) releaseScroll()
    }
    window.addEventListener('wheel', releaseWheel, { passive: true, capture: true })
    window.addEventListener('touchstart', releaseScroll, { passive: true })
    window.addEventListener('keydown', releaseKey)

    return () => {
      window.removeEventListener('wheel', releaseWheel, true)
      window.removeEventListener('touchstart', releaseScroll)
      window.removeEventListener('keydown', releaseKey)
      releaseScroll()
      finaleTween?.kill()
      scrollTween?.kill()
      trigger.kill()
      tl.kill()
      finale.kill()
      wave.kill()
      gsap.killTweensOf(steps)
      contactPulse.kill()
      blipTimelines.forEach((blip) => blip.kill())
      problemPulses.forEach((pulse) => pulse.kill())
      stopParticles()
      gsap.ticker.remove(dockOnSettle)
      gsap.set([disc, glow, inner, ...problems, ...steps, pkgFill, pkg], { clearProps: 'transform,transformOrigin' })
      gsap.set([disc, glow, ...problems, ...steps, ...blips, dot, pkgGlow], { clearProps: 'opacity,backgroundColor' })
      gsap.set(rings, { clearProps: 'fill,stroke' })
      gsap.set(toPackage, { clearProps: 'all' })
      gsap.set(pkg, { clearProps: 'backgroundColor,boxShadow,color' })
      gsap.set(inner, { clearProps: 'willChange' })
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
}
