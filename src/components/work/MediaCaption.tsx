import { ZoomInIcon } from '@/components/icons'

/* The row under a piece of product media: its name on the left, and a way to
   enlarge it on the right. `decorative` hides the button from assistive tech
   and the tab order when the media itself is already an enlarge button. */
export function MediaCaption({ label, onEnlarge, decorative = false }: { label: string; onEnlarge: () => void; decorative?: boolean }) {
  return (
    <div className="mt-3 flex items-center justify-between gap-4 text-meta text-muted-foreground">
      <span>{label}</span>
      <button
        type="button"
        onClick={onEnlarge}
        aria-label={decorative ? undefined : `Enlarge ${label}`}
        aria-hidden={decorative || undefined}
        tabIndex={decorative ? -1 : undefined}
        className="inline-flex items-center gap-1.5 transition-colors hover:text-primary focus-visible:text-primary"
      >
        <ZoomInIcon />
        Enlarge
      </button>
    </div>
  )
}
