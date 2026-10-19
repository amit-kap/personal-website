/* Work with me journey motion (Paper "note / v5 — how it plays"). The Problem
   and Solution sections sit on one stage that pins under the header while the
   disc travels the route with scroll, pausing on each stop ring (the
   data-journey="stop" circles). The stage's content moves up only as far as
   it must to keep the disc on a line just past the middle of the screen, so
   it stays still while the disc runs a lane. Each problem lights as the disc
   reaches the start of its lane, where it rests, so you read it there. After the last stop the rest of
   the stage scrolls up to the footer and the pin lets go. Desktop only; under
   reduced motion, or on phones, the stage is the plain static layout.
   ScrollTrigger reads the native scroll that Lenis drives. */
import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const LINE = 0.55 // the stage line the disc rides on, as a fraction of its height
const TRAVEL = 0.6 // px of scroll per px of route
const HOLD = 300 // px of scroll the disc rests on each stop

export function JourneyMotion({ children }: { children: React.ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    let mm = gsap.matchMedia()
    const setup = () => {
      const stage = stageRef.current!
      const inner = innerRef.current!
      const path = inner.querySelector<SVGPathElement>('[data-journey="path"]')
      const box = inner.querySelector<HTMLElement>('[data-journey="box"]')
      const disc = inner.querySelector<SVGGElement>('[data-journey="disc"]')
      const glow = inner.querySelector<HTMLElement>('[data-journey="glow"]')
      if (!path || !box || !disc || !glow) return

      const header = document.querySelector('header')?.offsetHeight ?? 0
      const stageHeight = window.innerHeight - header
      gsap.set(stage, { height: stageHeight })
      const boxTop = box.getBoundingClientRect().top - inner.getBoundingClientRect().top
      const maxOffset = Math.max(0, inner.offsetHeight - stageHeight)
      const line = stageHeight * LINE

      // Where along the route each stop ring sits.
      const total = path.getTotalLength()
      const problems = [...inner.querySelectorAll<HTMLElement>('[data-journey="problem"]')]
      const stops = [...inner.querySelectorAll('[data-journey="stop"]')].map((ring) => {
        const x = Number(ring.getAttribute('cx'))
        const y = Number(ring.getAttribute('cy'))
        let best = 0
        let bestDistance = Infinity
        for (let at = 0; at <= total; at += 2) {
          const p = path.getPointAtLength(at)
          const distance = Math.abs(p.x - x) + Math.abs(p.y - y)
          if (distance < bestDistance) [best, bestDistance] = [at, distance]
        }
        return best
      })
      const last = stops[stops.length - 1] ?? total
      const follow = (y: number) => gsap.utils.clamp(0, maxOffset, boxTop + y - line)
      const lastOffset = follow(path.getPointAtLength(last).y)

      const state = { at: 0, tail: 0 }
      const render = () => {
        const p = path.getPointAtLength(state.at)
        const dx = p.x - 400
        const dy = p.y - 12
        disc.setAttribute('transform', `translate(${dx} ${dy})`)
        glow.style.transform = `translate(${dx}px, ${dy}px)`
        const offset = state.tail > 0 ? lastOffset + state.tail * (maxOffset - lastOffset) : follow(p.y)
        inner.style.transform = `translateY(${-offset}px)`
        // Problem i lights at stop i (the start of its lane) and stays lit behind the disc.
        problems.forEach((problem, i) => problem.toggleAttribute('data-lit', stops[i] !== undefined && state.at >= stops[i] - 1))
      }

      // Durations are px of scroll: run to each stop, rest there, then scroll the rest.
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' }, onUpdate: render })
      let from = 0
      for (const at of stops) {
        tl.to(state, { at, duration: (at - from) * TRAVEL })
        tl.to({}, { duration: HOLD })
        from = at
      }
      tl.to(state, { tail: 1, duration: Math.max(1, maxOffset - lastOffset) })
      render()

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
        disc.removeAttribute('transform')
        glow.style.transform = ''
        inner.style.transform = ''
        problems.forEach((problem) => problem.removeAttribute('data-lit'))
      }
    }
    const query = '(min-width: 768px) and (prefers-reduced-motion: no-preference)'
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
    <div ref={stageRef} className="relative">
      <div ref={innerRef} className="will-change-transform">
        {children}
      </div>
    </div>
  )
}
