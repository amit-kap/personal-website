import { useEffect, useRef, useState, type ReactNode } from 'react'

/* A small menu that opens above its button and closes on outside click or Esc
   (Esc stops here, so it does not also close the panel). */
export function Menu({ trigger, children, label, below = false }: { below?: boolean; trigger: (p: { open: boolean; toggle: () => void }) => ReactNode; children: (close: () => void) => ReactNode; label: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    return () => document.removeEventListener('pointerdown', away)
  }, [open])

  return (
    <div
      ref={root}
      className="s-menu-root"
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation()
          setOpen(false)
        }
      }}
    >
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div className="s-menu" data-below={below} role="menu" aria-label={label}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}
