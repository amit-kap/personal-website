import { useLayoutEffect, useRef, useState } from 'react'
import { AgentGlyph, Close } from '../icons'

/* The floating Ask Shift button. It becomes Close while Ask Shift is open, and
   steps aside while it is docked (the panel has its own close button).
   The pill hugs whichever label is showing: both labels are measured once so
   its padding and the icon-to-label gap are identical in both states. */
export function AskFab({ open, hidden, onToggle }: { open: boolean; hidden: boolean; onToggle: () => void }) {
  const askRef = useRef<HTMLSpanElement>(null)
  const closeRef = useRef<HTMLSpanElement>(null)
  const [widths, setWidths] = useState<{ ask: number; close: number } | null>(null)

  useLayoutEffect(() => {
    if (askRef.current && closeRef.current) {
      setWidths({
        ask: Math.ceil(askRef.current.offsetWidth),
        close: Math.ceil(closeRef.current.offsetWidth),
      })
    }
  }, [])

  return (
    <button
      type="button"
      className="s-fab"
      data-open={open}
      data-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
      aria-expanded={open}
      aria-controls="s-ask"
      onClick={onToggle}
    >
      <span className="s-fab-icon">
        <AgentGlyph size={16} data-icon="ask" />
        <Close size={16} data-icon="close" />
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
