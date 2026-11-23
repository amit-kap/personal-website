import { useRef, useState, type KeyboardEvent } from 'react'
import { agents, askIntro, composerActions } from '../fixtures/ask'
import { Menu } from './Menu'
import { AgentGlyph, Check, ChevronDown, Plus, Send } from '../icons'

/* The floating message box: two rows of text, with the custom-actions menu,
   the agent picker and the send button inside it. */
export function Composer({ onSend, placeholder = askIntro.placeholder }: { onSend: (text: string) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('')
  const [agent, setAgent] = useState(agents[0])
  const field = useRef<HTMLTextAreaElement>(null)

  const send = () => {
    if (!draft.trim()) return
    onSend(draft)
    setDraft('')
  }
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      send()
    }
  }

  return (
    <form
      className="s-composer"
      onSubmit={(e) => {
        e.preventDefault()
        send()
      }}
    >
      <div className="s-compose-card">
        <textarea
          ref={field}
          className="s-compose-field"
          rows={2}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder={placeholder}
          aria-label="Message Ask Shift"
        />
        <div className="s-compose-bar">
          <Menu
            label="Custom actions"
            trigger={({ open, toggle }) => (
              <button type="button" className="s-tool" aria-haspopup="menu" aria-expanded={open} aria-label="Custom actions" onClick={toggle}>
                <Plus size={14} />
              </button>
            )}
          >
            {(close) =>
              composerActions.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  role="menuitem"
                  className="s-menu-item"
                  onClick={() => {
                    setDraft((d) => (d && !d.endsWith(' ') ? `${d} ${a.insert}` : d + a.insert))
                    close()
                    field.current?.focus()
                  }}
                >
                  {a.label}
                </button>
              ))
            }
          </Menu>
          <Menu
            label="Agent"
            trigger={({ open, toggle }) => (
              <button type="button" className="s-tool s-agent-pick" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
                <AgentGlyph size={13} />
                <span>{agent}</span>
                <ChevronDown size={12} />
              </button>
            )}
          >
            {(close) =>
              agents.map((a) => (
                <button
                  key={a}
                  type="button"
                  role="menuitemradio"
                  aria-checked={a === agent}
                  className="s-menu-item"
                  onClick={() => {
                    setAgent(a)
                    close()
                  }}
                >
                  {a}
                  {a === agent && <Check size={13} />}
                </button>
              ))
            }
          </Menu>
          <button type="submit" className="s-send" disabled={!draft.trim()} aria-label="Send">
            <Send size={14} />
          </button>
        </div>
      </div>
    </form>
  )
}
