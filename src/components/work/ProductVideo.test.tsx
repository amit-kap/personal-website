import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import ProductVideo from './ProductVideo'

/* The "Loading video" label must clear however the video gets ready: through
   canplay, through playback starting, or by already being ready (cached) when
   the component mounts, before React could hear canplay. */
describe('ProductVideo loader', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  const renderVideo = () => render(<ProductVideo src="/walk.mp4" label="Walkthrough" />)

  it('shows the loader until the video can play', () => {
    renderVideo()
    expect(screen.getByRole('status')).toHaveTextContent('Loading video')

    fireEvent.canPlay(screen.getByLabelText('Walkthrough'))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('clears the loader when playback starts', () => {
    renderVideo()
    act(() => {
      screen.getByLabelText('Walkthrough').dispatchEvent(new Event('playing'))
    })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('skips the loader when the video is already ready on mount', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'readyState', 'get').mockReturnValue(HTMLMediaElement.HAVE_ENOUGH_DATA)
    renderVideo()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
