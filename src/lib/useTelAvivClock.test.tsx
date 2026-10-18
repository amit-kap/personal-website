import { act, renderHook } from '@testing-library/react'
import { vi } from 'vitest'
import { formatTelAviv, useTelAvivClock } from './useTelAvivClock'

describe('formatTelAviv', () => {
  it('formats in Asia/Jerusalem (UTC+3 in summer, UTC+2 in winter)', () => {
    expect(formatTelAviv(new Date('2026-07-01T09:05:07Z'))).toBe('Tel Aviv · 12:05:07')
    expect(formatTelAviv(new Date('2026-01-01T09:05:07Z'))).toBe('Tel Aviv · 11:05:07')
  })

  it('uses a 24-hour clock that wraps past midnight', () => {
    expect(formatTelAviv(new Date('2026-07-01T21:00:00Z'))).toBe('Tel Aviv · 00:00:00')
  })
})

describe('useTelAvivClock', () => {
  afterEach(() => vi.useRealTimers())

  it('shows the time on mount and ticks every second', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-07-01T09:00:00Z'))
    const { result } = renderHook(() => useTelAvivClock())
    expect(result.current).toBe('Tel Aviv · 12:00:00')

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toBe('Tel Aviv · 12:00:01')
  })

  it('stops ticking after unmount', () => {
    vi.useFakeTimers()
    const { unmount } = renderHook(() => useTelAvivClock())
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
