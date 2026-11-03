import { Check, ChevronDown } from '../icons'
import { Menu } from './Menu'

/* A small dropdown: the button shows the current choice, the menu has a check
   beside it. */
export function Picker<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: { id: T; label: string; count?: number }[]
  onChange: (id: T) => void
}) {
  const current = options.find((o) => o.id === value)
  return (
    <Menu
      below
      label={label}
      trigger={({ open, toggle }) => (
        <button type="button" className="s-ghost s-ac-filter-btn" aria-haspopup="menu" aria-expanded={open} aria-label={`${label}: ${current?.label}`} onClick={toggle}>
          {current?.label}
          {current?.count != null && <span className="s-ac-count">{current.count}</span>}
          <ChevronDown size={12} />
        </button>
      )}
    >
      {(close) =>
        options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="menuitemradio"
            aria-checked={o.id === value}
            className="s-menu-item"
            onClick={() => {
              onChange(o.id)
              close()
            }}
          >
            {o.label}
            {o.id === value ? <Check size={13} /> : o.count != null && <span className="s-ac-menu-count">{o.count}</span>}
          </button>
        ))
      }
    </Menu>
  )
}
