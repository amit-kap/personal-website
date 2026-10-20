import { act, cleanup, render } from '@testing-library/react'
import { vi } from 'vitest'
import { PackageTurn } from './PackageTurn'

const motion = vi.hoisted(() => ({ allowed: true }))
vi.mock('@/lib/useAllowMotion', () => ({ useAllowMotion: () => motion.allowed }))

describe('PackageTurn playback', () => {
  const frames = new Map<number, FrameRequestCallback>()
  let intersect: (visible: boolean) => void
  let hidden = false
  let nextFrame = 0

  beforeEach(() => {
    motion.allowed = true
    hidden = false
    frames.clear()
    vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      frames.set(++nextFrame, callback)
      return nextFrame
    })
    vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: IntersectionObserverCallback) {
        intersect = (visible) => callback(
          [{ isIntersecting: visible } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        )
      }
      observe() {}
      disconnect() {}
    })
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('schedules no work while idle, offscreen or hidden and preserves the rotation on resume', async () => {
    const view = (idle: boolean) => <div data-idle={idle ? '' : undefined}><PackageTurn /></div>
    const { container, rerender, unmount } = render(view(true))
    const path = container.querySelector('path')!
    const rest = path.getAttribute('d')
    act(() => intersect(true))
    expect(frames.size).toBe(0)

    await act(async () => rerender(view(false)))
    expect(frames.size).toBe(1)
    act(() => {
      const [id, callback] = [...frames][0]
      frames.delete(id)
      callback(performance.now() + 32)
    })
    const rotated = path.getAttribute('d')
    expect(rotated).not.toBe(rest)

    act(() => intersect(false))
    expect(frames.size).toBe(0)
    act(() => intersect(true))
    expect(frames.size).toBe(1)
    expect(path.getAttribute('d')).toBe(rotated)

    hidden = true
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(frames.size).toBe(0)
    hidden = false
    act(() => document.dispatchEvent(new Event('visibilitychange')))
    expect(frames.size).toBe(1)
    expect(path.getAttribute('d')).toBe(rotated)

    await act(async () => rerender(view(true)))
    expect(frames.size).toBe(0)
    unmount()
    expect(frames.size).toBe(0)
  })

  it('keeps the static icon when reduced motion is requested', () => {
    motion.allowed = false
    const { container } = render(<PackageTurn />)
    expect(container.querySelector('path')?.getAttribute('d')).toBeTruthy()
    expect(frames.size).toBe(0)
  })
})
