/* Product screenshots in browser-window chrome, enlargeable in the Lightbox. */
import { useState } from 'react'
import type { ContentImage } from '@/lib/content'
import Lightbox from '@/components/work/Lightbox'
import { MediaCaption } from '@/components/work/MediaCaption'

/* Browser-window chrome around a product screenshot. The UI in these is too
   small to read in place, so the whole thing lifts on hover and opens
   full-frame on click. Everything inside must be phrasing content because it lives
   in a <button>. `chrome={false}` drops the window bar (article images). A
   `caption` adds the name-and-Enlarge row under it. */
export function ZoomableWindow({
  src,
  alt,
  chrome = true,
  caption,
  children,
}: {
  src: string
  alt: string
  chrome?: boolean
  caption?: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className="window-btn" onClick={() => setOpen(true)} aria-label={`Enlarge: ${alt}`}>
        <span className="window">
          {chrome && (
            <span className="winbar">
              <span className="windot windot-r" />
              <span className="windot windot-y" />
              <span className="windot windot-g" />
            </span>
          )}
          {children}
        </span>
      </button>
      {caption && <MediaCaption label={caption} onEnlarge={() => setOpen(true)} decorative />}
      {open && <Lightbox src={src} alt={alt} chrome={chrome} onClose={() => setOpen(false)} />}
    </>
  )
}

/* A product screenshot, shown whole, in browser-window chrome. */
export function WindowCard({ image, alt, caption }: { image?: ContentImage; alt: string; caption?: string }) {
  if (!image) return null
  return (
    <ZoomableWindow src={image.src} alt={alt} caption={caption}>
      <img src={image.src} alt={alt} width={image.width} height={image.height} loading="lazy" className="block h-auto w-full" />
    </ZoomableWindow>
  )
}
