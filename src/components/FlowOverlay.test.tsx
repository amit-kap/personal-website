import { render } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import FlowOverlay from './FlowOverlay'

/* The overlay measures [data-flow] elements inside its parent. jsdom has no
   layout, so rects come from a stand-in: a 800x2000 wrapper, two columns of
   problem cards, three stacked steps and a final circle. */
function Fixture({ animate }: { animate: boolean }) {
  return (
    <div data-testid="wrapper">
      <section>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} data-flow="problem" data-i={i} />
        ))}
      </section>
      <section>
        <h2>Proposed Solution</h2>
        {[0, 1, 2].map((i) => (
          <div key={i} data-flow="step" data-i={i} />
        ))}
        <div data-flow="final">
          <div />
        </div>
      </section>
      <FlowOverlay animate={animate} />
    </div>
  )
}

const rect = (x: number, y: number, w: number, h: number) =>
  ({ x, y, left: x, top: y, width: w, height: h, right: x + w, bottom: y + h, toJSON: () => ({}) }) as DOMRect

function fakeRect(this: Element): DOMRect {
  if (this.getAttribute('data-testid') === 'wrapper') return rect(0, 0, 800, 2000)
  const i = Number(this.getAttribute('data-i'))
  switch (this.getAttribute('data-flow')) {
    case 'problem':
      return rect(i % 2 ? 430 : 0, 100 + Math.floor(i / 2) * 200, 370, 150)
    case 'step':
      return rect(100, 900 + i * 200, 600, 100)
    default:
      return this.parentElement?.hasAttribute('data-flow') ? rect(350, 1600, 100, 100) : rect(0, 0, 0, 0)
  }
}

function mockCanvas() {
  const gradient = { addColorStop: vi.fn() }
  const ctx = {
    fillStyle: '#000',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    globalCompositeOperation: '',
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillRect: vi.fn(),
    createRadialGradient: vi.fn(() => gradient),
  }
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
  return ctx
}

function mockWide(wide: boolean) {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) => ({ matches: wide && query.includes('min-width: 768px'), media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList,
  )
}

describe('FlowOverlay', () => {
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(fakeRect)
  })
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('renders without a canvas when not animating, and still draws the connectors', () => {
    mockWide(true)
    const { container } = render(<Fixture animate={false} />)

    expect(container.querySelector('canvas')).not.toBeInTheDocument()
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    // Four card dots plus the trunk dot, four curves plus the trunk line.
    expect(svg.querySelectorAll('circle')).toHaveLength(5)
    expect(svg.querySelectorAll('path')).toHaveLength(5)
  })

  it('runs a dot-to-dot centre line down the stacked cards on narrow screens', () => {
    mockWide(false)
    const { container } = render(<Fixture animate={false} />)

    const svg = container.querySelector('svg')!
    // One run below each of the four cards (the last into the trunk), a dot at each end.
    expect(svg.querySelectorAll('path')).toHaveLength(4)
    expect(svg.querySelectorAll('circle')).toHaveLength(8)
    // Straight down one x: no quarter-circle arcs.
    expect(svg.innerHTML).not.toContain(' A')
    expect(new Set([...svg.querySelectorAll('circle')].map((c) => c.getAttribute('cx'))).size).toBe(1)
  })

  it('places each card dot on the card edge facing the trunk', () => {
    mockWide(true)
    const { container } = render(<Fixture animate={false} />)

    const dots = [...container.querySelectorAll('svg circle')].slice(0, 4)
    // Left cards end at x=370, right cards start at x=430; half a pixel inside the border.
    expect(dots.map((d) => d.getAttribute('cx'))).toEqual(['369.5', '430.5', '369.5', '430.5'])
    expect(dots.map((d) => d.getAttribute('cy'))).toEqual(['175', '175', '375', '375'])
  })

  it('draws a canvas sized to the wrapper plus the bleed, and paints dashes when animating', () => {
    mockWide(true)
    const ctx = mockCanvas()
    const { container } = render(<Fixture animate />)

    const canvas = container.querySelector('canvas')!
    expect(canvas).toHaveAttribute('aria-hidden', 'true')
    expect(canvas.width).toBe(800 + 96)
    expect(canvas.height).toBe(2000 + 96)
    expect(ctx.clearRect).toHaveBeenCalled()
    expect(ctx.globalCompositeOperation).toBe('lighter')
    expect(ctx.stroke).toHaveBeenCalled()
  })

  it('only runs animation frames while visible, and stops on unmount', () => {
    mockWide(true)
    mockCanvas()
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
    const raf = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(7)
    const cancel = vi.spyOn(window, 'cancelAnimationFrame')

    const { unmount } = render(<Fixture animate />)
    expect(raf).not.toHaveBeenCalled()

    notify([{ isIntersecting: true }])
    expect(raf).toHaveBeenCalledTimes(1)

    unmount()
    expect(cancel).toHaveBeenCalledWith(7)
    expect(disconnect).toHaveBeenCalled()
  })

  it('does nothing when the problem and solution markup is missing', () => {
    mockWide(true)
    const { container } = render(
      <div>
        <FlowOverlay animate={false} />
      </div>,
    )
    expect(container.querySelector('svg')!.innerHTML).toBe('')
  })

  it('survives a missing 2d context (jsdom default) when animating', () => {
    mockWide(true)
    expect(() => render(<Fixture animate />)).not.toThrow()
  })
})
