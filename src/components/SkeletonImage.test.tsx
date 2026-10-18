import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import SkeletonImage from './SkeletonImage'

/* The placeholder and error state use theme tokens (muted fill, muted text),
   so they follow the light or dark theme instead of a fixed light grey. */
describe('SkeletonImage', () => {
  afterEach(cleanup)

  it('shows a themed placeholder while loading and hides it once loaded', () => {
    const { container } = render(<SkeletonImage src="/a.webp" alt="Shot" />)
    const placeholder = container.querySelector('span[aria-hidden="true"]')!
    expect(placeholder).toHaveClass('bg-muted', 'animate-pulse')

    fireEvent.load(screen.getByAltText('Shot'))
    expect(placeholder).toHaveClass('opacity-0')
    expect(screen.getByAltText('Shot')).toHaveClass('opacity-100')
  })

  it('shows a themed "Image unavailable" message when the image fails', () => {
    render(<SkeletonImage src="/missing.webp" alt="Shot" />)
    fireEvent.error(screen.getByAltText('Shot'))

    const message = screen.getByText('Image unavailable')
    expect(message).toHaveClass('bg-muted', 'text-muted-foreground')
  })
})
