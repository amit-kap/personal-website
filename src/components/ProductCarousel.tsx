import { useEffect, useState, type CSSProperties } from 'react'
import type { ContentImage } from '@/lib/content'

type ProductCarouselProps = {
  images: ContentImage[]
  alt: string
  plateClassName: string
  cornerClassName: string
  plateStyle?: CSSProperties
}

const slideInterval = 6000
const slideTransition = 700

export default function ProductCarousel({ images, alt, plateClassName, cornerClassName, plateStyle }: ProductCarouselProps) {
  const imageCount = images.length
  const frames = [...images].reverse().concat([...images].reverse(), [...images].reverse())
  const startingFrame = imageCount * 2 - 1
  const [activeIndex, setActiveIndex] = useState(0)
  const [frameIndex, setFrameIndex] = useState(startingFrame)
  const [isTransitioning, setIsTransitioning] = useState(true)

  useEffect(() => {
    let currentFrame = startingFrame
    let resetTimer: ReturnType<typeof window.setTimeout> | undefined
    let enableTimer: ReturnType<typeof window.setTimeout> | undefined

    const advance = () => {
      currentFrame -= 1
      setFrameIndex(currentFrame)
      setActiveIndex(index => (index + 1) % imageCount)

      if (currentFrame !== imageCount - 1) return

      resetTimer = window.setTimeout(() => {
        setIsTransitioning(false)
        currentFrame = startingFrame
        setFrameIndex(startingFrame)
        enableTimer = window.setTimeout(() => setIsTransitioning(true), 32)
      }, slideTransition)
    }

    const interval = window.setInterval(advance, slideInterval)
    return () => {
      window.clearInterval(interval)
      if (resetTimer) window.clearTimeout(resetTimer)
      if (enableTimer) window.clearTimeout(enableTimer)
    }
  }, [imageCount, startingFrame])

  if (imageCount === 0) return null

  return (
    <div className={`relative overflow-hidden ${plateClassName}`} style={plateStyle} role="img" aria-label={alt}>
      <div className="relative h-full w-full">
        <img
          src={images[0].src}
          alt=""
          aria-hidden="true"
          width={images[0].width}
          height={images[0].height}
          className={`h-full w-full ${cornerClassName} object-cover object-left-top opacity-0`}
        />
        <div className={`absolute inset-0 overflow-hidden ${cornerClassName} bg-white`}>
          <div
            className="flex h-full will-change-transform"
            style={{
              width: `${frames.length * 100}%`,
              transform: `translateX(-${(frameIndex / frames.length) * 100}%)`,
              transition: isTransitioning ? `transform ${slideTransition}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
            }}
          >
            {frames.map((image, index) => (
              <img
                key={`${image.src}-${index}`}
                src={image.src}
                alt=""
                width={image.width}
                height={image.height}
                loading={index < imageCount * 2 ? 'eager' : 'lazy'}
                className="h-full shrink-0 object-cover object-left-top"
                style={{ width: `${100 / frames.length}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      {imageCount > 1 ? (
        <div className="product-carousel-dots" aria-hidden="true">
          {images.map((image, index) => (
            <span key={image.src} className={`product-carousel-dot ${index === activeIndex ? 'is-active' : ''}`} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
