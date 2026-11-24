import { useRef, useState } from 'react'
import { X } from 'lucide-react'

export type Shown = { src: string; alt: string; video?: boolean }

/** A full-screen viewer for one image or video. Returns the dialog to render and a function that opens it. */
export function useViewer() {
  const ref = useRef<HTMLDialogElement>(null)
  const [shown, setShown] = useState<Shown | null>(null)
  const show = (item: Shown) => {
    setShown(item)
    ref.current?.showModal()
  }
  const dialog = (
    <dialog ref={ref} className="h01-lightbox" aria-label={shown?.alt} onClose={() => setShown(null)} onClick={(e) => e.target === e.currentTarget && ref.current?.close()}>
      <button type="button" className="h01-lightbox-close" aria-label="Close" onClick={() => ref.current?.close()}>
        <X size={20} strokeWidth={1.5} aria-hidden />
      </button>
      {shown?.video ? (
        <video className="h01-shown" src={shown.src} autoPlay muted loop playsInline controls />
      ) : shown ? (
        <img className="h01-shown" src={shown.src} alt={shown.alt} />
      ) : null}
    </dialog>
  )
  return { show, dialog }
}
