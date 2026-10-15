import type { ContentImage } from '@/lib/content'
import Reveal from '@/components/Reveal'
import ProductVideo from '@/components/work/ProductVideo'

/* The hero product media, whole, in the home page's Featured frame.
   Pass `video` for a looping walkthrough; `image` then serves as its poster. */
export function HeroBackdrop({ image, video, alt }: { image?: ContentImage; video?: string; alt: string }) {
  return (
    <div className="relative">
      <div className="inner-col pb-16">
        <Reveal>
          <div className="media-frame">
            {video ? (
              <ProductVideo src={video} poster={image?.src} label={alt} />
            ) : (
              image && (
                <img src={image.src} alt={alt} width={image.width} height={image.height} className="backdrop-media" />
              )
            )}
          </div>
        </Reveal>
      </div>
    </div>
  )
}
