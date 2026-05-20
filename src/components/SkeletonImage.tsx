import { useEffect, useRef, useState, type ImgHTMLAttributes } from 'react'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'onLoad' | 'className'> {
  src: string
  alt: string
  /** Classes for the wrapper div (layout, aspect ratio, border, radius). */
  wrapperClassName?: string
  /** Classes for the img element (object-fit, transforms, etc.). */
  className?: string
}

export default function SkeletonImage({
  src,
  alt,
  wrapperClassName = '',
  className = '',
  ...rest
}: Props) {
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // Cached images may already be complete before React attaches the onLoad handler.
  useEffect(() => {
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) setLoaded(true)
  }, [])

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={className}
        {...rest}
      />
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-neutral-100 pointer-events-none transition-opacity duration-500 ${
          loaded ? 'opacity-0' : 'opacity-100 animate-pulse'
        }`}
      />
    </div>
  )
}
