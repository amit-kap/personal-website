import { useState } from 'react'
import type { ContentImage } from '@/lib/content'
import Reveal from '@/components/Reveal'
import { ZoomInIcon } from '@/components/icons'
import Lightbox from '@/components/work/Lightbox'
import ProductVideo from '@/components/work/ProductVideo'

/* The hero product media, whole, in the home page's Featured frame.
   Pass `video` for a looping walkthrough; `image` then serves as its poster.
   With a `caption`, a video carries a row under it: its name, and a way to
   enlarge it. */
export function HeroMedia({ image, video, alt, caption }: { image?: ContentImage; video?: string; alt: string; caption?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <div className="inner-col pb-16">
        <Reveal>
          <div className="hero-media-frame">
            {video ? (
              <ProductVideo src={video} poster={image?.src} label={alt} />
            ) : (
              image && (
                <img src={image.src} alt={alt} width={image.width} height={image.height} className="product-media" />
              )
            )}
          </div>
          {video && caption && (
            <div className="mt-3 flex items-center justify-between gap-4 text-meta text-muted-foreground">
              <span>{caption}</span>
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-primary focus-visible:text-primary"
              >
                <ZoomInIcon />
                Enlarge
              </button>
            </div>
          )}
        </Reveal>
        {video && open && <Lightbox src={video} alt={alt} video onClose={() => setOpen(false)} />}
      </div>
    </div>
  )
}
