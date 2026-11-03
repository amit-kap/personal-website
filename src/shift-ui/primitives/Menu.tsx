import { useEffect, useRef, useState, type ReactNode } from 'react'

/* A small menu that opens above its button. Focus moves into it, the arrow keys
   walk the items, and it closes on outside click, focus leaving or Esc (Esc
   stops here, so it does not also close the panel). */
export function Menu({ trigger, children, label, below = false }: { below?: boolean; trigger: (p: { open: boolean; toggle: () => void }) => ReactNode; children: (close: () => void) => ReactNode; label: string }) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  const items = () => [...(root.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? [])]

  /* Opening moves focus into the menu so the arrow keys work. */
  useEffect(() => {
    if (open) items()[0]?.focus()
  }, [open])

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
        if (!open) return
        if (e.key === 'Escape') {
          e.stopPropagation()
          setOpen(false)
          root.current?.querySelector<HTMLElement>('[aria-haspopup]')?.focus()
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          const all = items()
          const at = all.indexOf(document.activeElement as HTMLElement)
          all[(at + (e.key === 'ArrowDown' ? 1 : -1) + all.length) % all.length]?.focus()
          e.preventDefault()
        }
      }}
      onBlur={(e) => {
        if (open && !root.current?.contains(e.relatedTarget as Node | null)) setOpen(false)
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
