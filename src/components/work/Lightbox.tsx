import { useEffect } from 'react'
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@amit-kap/glaze/components/dialog'
import { getLenis } from '@/lib/useSmoothScroll'

/* Full-frame view of a product screenshot. Glaze's Dialog portals it to the
   body (the reveal wrappers carry a transform, which would make `fixed`
   resolve against the card), traps focus, locks scroll and closes on Escape.
   The popup is stretched over the viewport and carries the dark backdrop.
   `chrome` keeps the browser-window bar of the card the image came from. */
export default function Lightbox({
  src,
  alt,
  onClose,
  video = false,
  chrome = false,
}: {
  src: string
  alt: string
  onClose: () => void
  video?: boolean
  chrome?: boolean
}) {
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const lenis = getLenis()
    lenis?.stop()
    return () => {
      lenis?.start()
      opener?.focus()
    }
  }, [])

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        onClick={onClose}
        className="inset-0 z-60 grid h-full w-full max-w-none translate-x-0 translate-y-0 cursor-zoom-out place-items-center gap-0 rounded-none bg-[rgba(10,10,12,0.86)] p-[clamp(16px,4vw,56px)] ring-0 duration-200 data-open:zoom-in-100 data-closed:zoom-out-100 sm:max-w-none"
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogClose className="lightbox-close" aria-label="Close" onClick={(event) => event.stopPropagation()}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M3.5 3.5 12.5 12.5M12.5 3.5 3.5 12.5" />
          </svg>
        </DialogClose>
        {video ? (
          <video
            className="lightbox-media"
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
        ) : chrome ? (
          <span className="window lightbox-window" onClick={(event) => event.stopPropagation()}>
            <span className="winbar winbar-lg">
              <span className="windot windot-r" />
              <span className="windot windot-y" />
              <span className="windot windot-g" />
            </span>
            <img src={src} alt={alt} />
          </span>
        ) : (
          <img className="lightbox-media" src={src} alt={alt} onClick={(event) => event.stopPropagation()} />
        )}
      </DialogContent>
    </Dialog>
  )
}
