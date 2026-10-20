import { act, cleanup, render } from '@testing-library/react'
import { vi } from 'vitest'
import DotWaves from './DotWaves'

describe('DotWaves color cache', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('draws without reading styles each frame and refreshes on color or ancestor theme changes', async () => {
    const context = {
      setTransform: vi.fn(), clearRect: vi.fn(), beginPath: vi.fn(),
      moveTo: vi.fn(), arc: vi.fn(), fill: vi.fn(), fillStyle: '',
    }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D)
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
    const styles = vi.spyOn(window, 'getComputedStyle')
    let frame: FrameRequestCallback
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frame = callback
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      disconnect() {}
    })
    const { container, rerender } = render(<div data-theme="dark"><DotWaves color="red" /></div>)
    expect(context.fillStyle).toBe('')
    const initialReads = styles.mock.calls.length
    act(() => {
      frame(16)
      frame(32)
      frame(48)
    })
    expect(context.fillStyle).toBe('rgb(255, 0, 0)')
    expect(styles).toHaveBeenCalledTimes(initialReads)

    rerender(<div data-theme="dark"><DotWaves color="blue" /></div>)
    act(() => frame(64))
    expect(context.fillStyle).toBe('rgb(0, 0, 255)')
    const afterPropChange = styles.mock.calls.length
    await act(async () => container.firstElementChild!.setAttribute('data-theme', 'light'))
    expect(styles.mock.calls.length).toBeGreaterThan(afterPropChange)
  })
})
