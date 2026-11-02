import { useLayoutEffect, useRef, useState } from 'react'
import { AgentGlyph, Close } from '../icons'

/* The floating Ask Shift button. It becomes Close while the panel is open.
   The pill hugs whichever label is showing: both labels are measured once so
   its padding and the icon-to-label gap are identical in both states. */
export function AskFab({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const askRef = useRef<HTMLSpanElement>(null)
  const closeRef = useRef<HTMLSpanElement>(null)
  const [widths, setWidths] = useState<{ ask: number; close: number } | null>(null)

  useLayoutEffect(() => {
    if (askRef.current && closeRef.current) {
      setWidths({
        ask: Math.ceil(askRef.current.getBoundingClientRect().width),
        close: Math.ceil(closeRef.current.getBoundingClientRect().width),
      })
    }
  }, [])

  return (
    <button
      type="button"
      className="s-fab"
      data-open={open}
      aria-expanded={open}
      aria-controls="s-ask"
      onClick={onToggle}
    >
      <span className="s-fab-icon">
        <AgentGlyph size={20} data-icon="ask" />
        <Close size={20} data-icon="close" />
      </span>
      <span className="s-fab-label" style={widths ? { width: open ? widths.close : widths.ask } : undefined}>
        <span ref={askRef} data-label="ask">
          Ask Shift
        </span>
        <span ref={closeRef} data-label="close">
          Close
        </span>
      </span>
    </button>
  )
}
