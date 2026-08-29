import { useEffect, useRef } from 'react'

/* Shared entrance contract: starts hidden (.reveal), IntersectionObserver adds
   .is-in once. Elements already in the viewport animate on load; everything
   else animates when scrolled into view. `delay` staggers via --reveal-delay. */
export default function Reveal({
  as: Tag = 'div',
  className = '',
  delay = 0,
  scale = false,
  children,
}: {
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  delay?: number
  scale?: boolean
  children?: React.ReactNode
}) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Anything already in the viewport reveals on load without waiting for the
    // observer: the load entrance, and a safety net where IO never fires.
    const rect = el.getBoundingClientRect()
    if (typeof IntersectionObserver === 'undefined' || (rect.top < window.innerHeight && rect.bottom > 0)) {
      el.classList.add('is-in')
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -32px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const Component = Tag as React.ElementType
  return (
    <Component
      ref={ref}
      className={`reveal ${scale ? 'reveal-scale' : ''} ${className}`}
      style={delay ? ({ '--reveal-delay': `${delay}s` } as React.CSSProperties) : undefined}
    >
      {children}
    </Component>
  )
}
