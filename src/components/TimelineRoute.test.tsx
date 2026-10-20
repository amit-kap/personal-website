import { render } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, vi } from 'vitest'
import TimelineRoute from './TimelineRoute'

/* The route measures [data-route] elements inside its parent. jsdom has no
   layout, so rects come from a stand-in: an 800x2000 wrapper with an origin,
   two problems, a label, three steps in a row and the final circle. SVG path
   measuring is stubbed too: a path "is" as long as its start-to-end distance
   by polyline over its M/L/A end points (close enough for these checks). */
function Fixture({ animate }: { animate: boolean }) {
  return (
    <div data-testid="wrapper">
      <span data-route="origin" />
      {[0, 1].map((i) => (
        <div key={i} data-route="item" data-i={i}>
          <span data-route="node" data-i={i} />
        </div>
      ))}
      <h2>
        <span data-route="label" />
      </h2>
      {[0, 1, 2].map((i) => (
        <div key={i} data-route="step" data-i={i} />
      ))}
      <div data-route="final">
        <div />
      </div>
      <span data-route="bloom" />
      <TimelineRoute animate={animate} />
    </div>
  )
}

const rect = (x: number, y: number, w: number, h: number) =>
  ({ x, y, left: x, top: y, width: w, height: h, right: x + w, bottom: y + h, toJSON: () => ({}) }) as DOMRect

/* Phones stack the steps. */
let stacked = false

function fakeRect(this: Element): DOMRect {
  const i = Number(this.getAttribute('data-i'))
  if (this.getAttribute('data-testid') === 'wrapper') return rect(0, 0, 800, 2000)
  if (this.getAttribute('data-route') === 'origin') return rect(391, 3, 18, 18)
  if (this.getAttribute('data-route') === 'item') return rect(72, 316 + i * 120, 728, 120)
  if (this.getAttribute('data-route') === 'node') return rect(18, 322 + i * 120, 12, 12)
  if (this.getAttribute('data-route') === 'label') return rect(344, 708, 112, 20)
  if (this.getAttribute('data-route') === 'step') return stacked ? rect(0, 880 + i * 262, 343, 222) : rect(i * 286.67, 880, 226.67, 222)
  if (this.parentElement?.getAttribute('data-route') === 'final') return rect(344, 1230, 112, 112)
  return rect(0, 0, 0, 0)
}

function mockWide(wide: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) => ({ matches: wide && query.includes('min-width: 768px'), media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
  )
}

/* A path that runs straight down from y=0, so a distance is a y. */
function mockPathMeasuring() {
  const proto = SVGElement.prototype as unknown as Record<string, unknown>
  proto.getTotalLength = () => 100000
  proto.getPointAtLength = (len: number) => ({ x: 0, y: len })
}

describe('TimelineRoute', () => {
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(fakeRect)
    // Frame callbacks run at once.
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0)
      return 1
    })
  })
  afterEach(() => {
    delete (SVGElement.prototype as unknown as Record<string, unknown>).getTotalLength
    delete (SVGElement.prototype as unknown as Record<string, unknown>).getPointAtLength
    stacked = false
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('draws one continuous path, with a node on the rail for each problem', () => {
    mockWide(true)
    const { container } = render(<Fixture animate={false} />)

    const root = container.querySelector('[aria-hidden="true"]')!
    const paths = root.querySelectorAll('path')
    // The rail and its copy for the trail.
    expect(paths).toHaveLength(2)
    const d = paths[0].getAttribute('d')!
    expect(d.startsWith('M400 12 L400 130 A40 40 0 0 1 360 170 L64 170')).toBe(true)
    expect(d.match(/M/g)).toHaveLength(1)
    // The rail is 24px in from the column: the nodes' centre x.
    expect(d).toContain('A40 40 0 0 0 24 210')
    expect(root.querySelectorAll('circle[data-at]').length).toBeGreaterThanOrEqual(2)
  })

  it('runs straight down the centre through stacked steps on narrow screens', () => {
    mockWide(false)
    stacked = true
    const { container } = render(<Fixture animate={false} />)

    const d = container.querySelector('path')!.getAttribute('d')!
    // After the rail (which ends back at the centre) nothing leaves the centre line.
    const afterRail = d.slice(d.indexOf('A40 40 0 0 1 400 ') + 1)
    expect(afterRail).not.toContain('A')
    expect(afterRail.match(/L400 /g)!.length).toBeGreaterThan(4)
  })

  it('lights everything, fills the trail and shows no disc when motion is off', () => {
    mockWide(true)
    mockPathMeasuring()
    const { container } = render(<Fixture animate={false} />)

    expect(container.querySelector('[data-show]')).not.toBeInTheDocument()
    expect(container.querySelectorAll('[data-route="item"][data-lit]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-route="step"][data-lit]')).toHaveLength(3)
    expect(container.querySelector('[data-route="bloom"]')).toHaveAttribute('data-lit')
    expect(container.querySelectorAll('circle[data-at]:not([data-lit])')).toHaveLength(0)
  })

  it('starts unlit with the disc at the origin, then lights up as the page scrolls', () => {
    mockWide(true)
    mockPathMeasuring()
    vi.stubGlobal('innerHeight', 1000)
    let top = 5000 // the wrapper starts far below the viewport line
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      return this.getAttribute('aria-hidden') === 'true' && this.className.includes('absolute') ? rect(0, top, 800, 2000) : fakeRect.call(this)
    })
    const { container } = render(<Fixture animate />)

    expect(container.querySelector('[data-show]')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-lit]')).toHaveLength(0)

    // Scrolled so the viewport line (550px) is far down the route.
    top = -5000
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
    expect(container.querySelectorAll('[data-route="item"][data-lit]')).toHaveLength(2)
    expect(container.querySelector('[data-route="bloom"]')).toHaveAttribute('data-lit')
    // Past the end the disc has landed and is gone.
    expect(container.querySelector('[data-show]')).not.toBeInTheDocument()
  })

  it('only follows the scroll while the section is near the viewport, and cleans up', () => {
    mockWide(true)
    let notify: (entries: Partial<IntersectionObserverEntry>[]) => void = () => {}
    const disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: typeof notify) {
          notify = cb
        }
        observe() {}
        disconnect = disconnect
      },
    )
    const add = vi.spyOn(window, 'addEventListener')
    const remove = vi.spyOn(window, 'removeEventListener')

    const { unmount } = render(<Fixture animate />)
    expect(add.mock.calls.filter(([type]) => type === 'scroll')).toHaveLength(0)

    act(() => notify([{ isIntersecting: true }]))
    const scroll = add.mock.calls.find(([type]) => type === 'scroll')!
    expect(scroll[2]).toEqual({ passive: true })

    act(() => notify([{ isIntersecting: false }]))
    expect(remove.mock.calls.filter(([type]) => type === 'scroll')).toHaveLength(1)

    unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it('draws nothing when the problem and solution markup is missing', () => {
    mockWide(true)
    const { container } = render(
      <div>
        <TimelineRoute animate={false} />
      </div>,
    )
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })
})
