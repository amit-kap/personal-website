import { act, render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ProductCarousel from './ProductCarousel'

const images = [
  { src: '/first.png', width: 1600, height: 900 },
  { src: '/second.png', width: 1600, height: 900 },
  { src: '/third.png', width: 1600, height: 900 },
]

describe('ProductCarousel', () => {
  afterEach(() => vi.useRealTimers())

  it('advances the slide and expanding dot from the same active index', () => {
    vi.useFakeTimers()
    const { container } = render(
      <ProductCarousel
        images={images}
        alt="Example product screens"
        plateClassName="p-4"
        cornerClassName="rounded"
      />,
    )

    const activeDot = () => container.querySelector('.product-carousel-dot.is-active')
    expect(activeDot()).toHaveAttribute('data-active', 'true')
    expect(container.querySelectorAll('.product-carousel-dot')[0]).toBe(activeDot())

    act(() => vi.advanceTimersByTime(6000))
    expect(container.querySelectorAll('.product-carousel-dot')[1]).toBe(activeDot())

    act(() => vi.advanceTimersByTime(6000))
    expect(container.querySelectorAll('.product-carousel-dot')[2]).toBe(activeDot())
  })
})
