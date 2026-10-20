import { cameraOffset, dockingEase, journeyEase, journeyFrame, journeyPhase, magneticProgress, settle } from './journeyMotion'

describe('journey motion', () => {
  const route = { x: 400, y: 1600 }
  const dot = { x: 400, y: 1950 }
  const pkg = { x: 400, y: 2250 }

  it('reads SVG point accessors without relying on enumerable properties', () => {
    const svgPoint = Object.create({ get x() { return 760 }, get y() { return 322 } })
    expect(journeyFrame('route', svgPoint, dot, pkg,
      { handoff: 0, camera: 0, opacity: 1 }, { progress: 0, opacity: 1 }))
      .toEqual({ x: 760, y: 322, cameraY: 322, opacity: 1 })
  })

  it('arrives exactly at a station without overshooting in either direction', () => {
    expect(journeyEase(0)).toBe(0)
    expect(journeyEase(1)).toBe(1)
    let previous = 0
    for (let i = 0; i <= 100; i++) {
      const progress = i / 100
      const eased = journeyEase(progress)
      expect(eased).toBeGreaterThanOrEqual(previous)
      expect(eased).toBeLessThanOrEqual(1)
      expect(eased).toBeCloseTo(1 - journeyEase(1 - progress))
      previous = eased
    }
    expect(journeyEase(0.01)).toBeLessThan(0.001)
  })

  it('settles by elapsed time rather than the display refresh rate', () => {
    let at60Hz = 1
    let at120Hz = 1
    for (let i = 0; i < 60; i++) at60Hz = settle(at60Hz, 0, 1000 / 60, 85)
    for (let i = 0; i < 120; i++) at120Hz = settle(at120Hz, 0, 1000 / 120, 85)
    expect(at60Hz).toBeCloseTo(at120Hz, 10)
    expect(at60Hz).toBeLessThan(0.001)
  })

  it('carries the incoming speed into docking and finishes without overshoot', () => {
    const duration = 0.3
    const distance = 80
    const ease = dockingEase(120, distance, duration)
    const step = 0.00001
    expect((ease(step) - ease(0)) / step * distance / duration).toBeCloseTo(120, 1)
    expect((ease(1) - ease(1 - step)) / step).toBeCloseTo(0, 3)
    for (const speed of [0, 120, 8000]) {
      const curve = dockingEase(speed, distance, duration)
      let previous = 0
      for (let i = 0; i <= 100; i++) {
        const current = curve(i / 100)
        expect(current).toBeGreaterThanOrEqual(previous)
        expect(current).toBeLessThanOrEqual(1)
        previous = current
      }
      expect(curve(1)).toBe(1)
    }
  })

  it('eases the camera into its bounds while preserving the reading positions', () => {
    expect(cameraOffset(-100, 1000)).toBe(0)
    expect(cameraOffset(1100, 1000)).toBe(1000)
    expect(cameraOffset(500, 1000)).toBe(500)
    const step = 0.001
    expect(cameraOffset(step, 1000) / step).toBeLessThan(0.001)
    expect((1000 - cameraOffset(1000 - step, 1000)) / step).toBeLessThan(0.001)
    expect((cameraOffset(48 + step, 1000) - cameraOffset(48 - step, 1000)) / (2 * step)).toBeCloseTo(1, 3)
    for (const maximum of [0, 20, 1000]) {
      let previous = 0
      for (let y = 0; y <= maximum; y++) {
        const offset = cameraOffset(y, maximum)
        expect(offset).toBeGreaterThanOrEqual(previous)
        expect(offset).toBeLessThanOrEqual(maximum)
        previous = offset
      }
    }
  })

  const docks = [
    { from: 0, to: 500, start: 0, arrival: 400, settled: 480 },
    { from: 500, to: 1500, start: 1080, arrival: 1880, settled: 1960 },
  ]

  it('magnetically completes a nearby arrival, including the light-up', () => {
    expect(magneticProgress(370 / 3000, 3000, 1, docks)).toBe(480 / 3000)
    expect(magneticProgress(430 / 3000, 3000, 1, docks)).toBe(480 / 3000)
  })

  it('does not pull the reader across a lane or reset a reading pause', () => {
    expect(magneticProgress(200 / 3000, 3000, 1, docks)).toBe(200 / 3000)
    expect(magneticProgress(900 / 3000, 3000, 1, docks)).toBe(900 / 3000)
  })

  it('docks in the direction of travel when approaching a station in reverse', () => {
    expect(magneticProgress(1110 / 3000, 3000, -1, docks)).toBe(1080 / 3000)
    expect(magneticProgress(1110 / 3000, 3000, 1, docks)).toBe(1110 / 3000)
  })

  it('moves the reading area during the timed reveal while the disc is hidden', () => {
    const frame = journeyFrame('cards', route, dot, pkg,
      { handoff: 0, camera: 0.5, opacity: 0 }, { progress: 0, opacity: 1 })
    expect(frame).toEqual({ ...route, cameraY: 1775, opacity: 0 })
  })

  it('keeps the handoff continuous when leaving the cards for the package', () => {
    const reveal = { handoff: 1, camera: 1, opacity: 1 }
    const tail = { progress: 0, opacity: 1 }
    expect(journeyFrame('cards', route, dot, pkg, reveal, tail))
      .toEqual(journeyFrame('package', route, dot, pkg, reveal, tail))
  })

  it('keeps the visible handoff when a fast swipe changes or reverses its destination', () => {
    const cardsReady = 1.85
    expect(journeyPhase('package', 0.5, cardsReady)).toBe('cards')
    expect(journeyPhase('route', 2.5, cardsReady)).toBe('package')
    expect(journeyPhase('route', cardsReady, cardsReady)).toBe('cards')
    expect(journeyPhase('route', 0.5, cardsReady)).toBe('cards')
    expect(journeyPhase('route', 0, cardsReady)).toBe('route')
    expect(journeyPhase('cards', 0, cardsReady)).toBe('cards')
  })

  it('returns continuously to the live route position after the reverse handoff', () => {
    const liveRoute = { x: 750, y: 1200 }
    const reveal = { handoff: 0, camera: 0, opacity: 1 }
    const tail = { progress: 0, opacity: 1 }
    expect(journeyFrame('cards', liveRoute, dot, pkg, reveal, tail))
      .toEqual(journeyFrame('route', liveRoute, dot, pkg, reveal, tail))
  })
})
