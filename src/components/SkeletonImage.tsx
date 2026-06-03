import { useCallback, useRef, useState, type ImgHTMLAttributes } from 'react'

type ImageLoadState = 'loading' | 'loaded' | 'error'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'className'> {
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
  onLoad,
  onError,
  ...rest
}: Props) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [loadState, setLoadState] = useState<{ src: string; state: ImageLoadState }>({
    src,
    state: src ? 'loading' : 'error',
  })

  const currentState = loadState.src === src ? loadState.state : src ? 'loading' : 'error'

  const updateLoadState = useCallback((state: ImageLoadState) => {
    setLoadState(previous =>
      previous.src === src && previous.state === state ? previous : { src, state },
    )
  }, [src])

  const setImageRef = useCallback((img: HTMLImageElement | null) => {
    imgRef.current = img
    if (!img) return
    if (!src) {
      updateLoadState('error')
      return
    }
    if (img.complete) updateLoadState(img.naturalWidth > 0 ? 'loaded' : 'error')
  }, [src, updateLoadState])

  return (
    <div className={`relative overflow-hidden ${wrapperClassName}`}>
      <img
        ref={setImageRef}
        src={src}
        alt={alt}
        onLoad={(event) => {
          updateLoadState('loaded')
          onLoad?.(event)
        }}
        onError={(event) => {
          updateLoadState('error')
          onError?.(event)
        }}
        className={`${className} transition-opacity duration-300 ${
          currentState === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
        {...rest}
      />
      <div
        aria-hidden="true"
        className={`absolute inset-0 bg-neutral-100 pointer-events-none transition-opacity duration-500 ${
          currentState === 'loading' ? 'opacity-100 animate-pulse' : 'opacity-0'
        }`}
      />
      {currentState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 px-4 text-center text-[10px] font-mono uppercase tracking-[0.18em] text-black/30">
          Image unavailable
        </div>
      )}
    </div>
  )
}
