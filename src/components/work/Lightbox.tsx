import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { getLenis } from '@/lib/useSmoothScroll'

/* Full-frame view of a product screenshot. Portalled to the body because the
   reveal wrappers carry a transform, which would otherwise make `fixed`
   resolve against the card instead of the viewport. */
export default function Lightbox({
  src,
  alt,
  onClose,
  video = false,
}: {
  src: string
  alt: string
  onClose: () => void
  video?: boolean
}) {
  const close = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    close.current?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    const lenis = getLenis()
    lenis?.stop()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      lenis?.start()
      document.body.style.overflow = previous
      opener?.focus()
    }
  }, [onClose])

  return createPortal(
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label={alt}>
      {video ? (
        <video
          src={src}
          aria-label={alt}
          controls
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onClick={(event) => event.stopPropagation()}
        />
      ) : (
        <img src={src} alt={alt} onClick={(event) => event.stopPropagation()} />
      )}
      <button ref={close} type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5" />
        </svg>
      </button>
    </div>,
    document.body,
  )
}
